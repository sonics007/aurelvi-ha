"""Aurelvi MQTT bridge, persistent pages, timers and update metadata."""
from __future__ import annotations
import asyncio
import base64
import copy
from datetime import timedelta
import json
import logging
import re
import secrets
import time
from urllib.parse import urlparse
from homeassistant.components import mqtt
from homeassistant.core import callback, Context
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.event import async_track_time_interval, async_call_later
from homeassistant.helpers.network import get_url
from homeassistant.helpers.storage import Store
from .panel_settings import public_settings, public_device, normalize_panel_config
from .const import DOMAIN, PREFIX, SIGNAL, VERSION
from .models import actions, attribute_key, PROJECTED_ATTRIBUTES, finite_attribute, default_config, entities, entity_id, entity_key, mirror, number, panel_id, validate_config, validate_device

_LOGGER=logging.getLogger(__name__)

class Hub:
    def __init__(self,hass,entry):
        self.hass=hass;self.entry=entry;self.store=Store(hass,1,DOMAIN+'.studio')
        self.panels={};self.status={};self.timers={};self.settings={};self.latest={};self.logs=[]
        self.unsubs=[];self.timer_jobs={};self.event_ids={};self.lock=asyncio.Lock();self.closed=False;self.notify_bindings={};self.weather_at={}
    async def start(self):
        saved=await self.store.async_load() or {}
        self.panels=saved.get('panels',{});self.timers=saved.get('timers',{});self.settings=saved.get('settings',{})
        self.unsubs.append(await mqtt.async_subscribe(self.hass,PREFIX+'/+/avail',self.receive,1))
        self.unsubs.append(await mqtt.async_subscribe(self.hass,PREFIX+'/+/sys/+',self.receive,1))
        self.unsubs.append(await mqtt.async_subscribe(self.hass,PREFIX+'/+/event',self.receive,1))
        self.unsubs.append(self.hass.bus.async_listen('state_changed',self.state_changed))
        self.unsubs.append(async_track_time_interval(self.hass,self.periodic,timedelta(seconds=60)))
        self.unsubs.append(async_track_time_interval(self.hass,self.check_releases,timedelta(hours=6)))
        for pid,p in self.panels.items():
            self.status[pid]={'online':False,'info':{},'sys':{}}
            if p.get('paired'):
                await self.publish(pid,'cmd/info',{})
                if p.get('configSource')!='pending':await self.push(pid)
        for key in list(self.timers):self.schedule_timer(key)
        if self.settings.get('githubRepo'):await self.check_releases()
    async def close(self):
        self.closed=True
        for unsub in self.unsubs:unsub()
        for cancel in self.timer_jobs.values():cancel()
        self.timer_jobs.clear()
        await self.persist()
    async def persist(self):
        await self.store.async_save({'panels':self.panels,'timers':self.timers,'settings':self.settings})
    @callback
    def changed(self):async_dispatcher_send(self.hass,SIGNAL)
    def log(self,pid,message,level='info'):
        self.logs.append({'panel':pid,'message':message,'level':level,'ts':int(time.time()*1000)});self.logs=self.logs[-100:];self.changed()
    async def publish(self,pid,suffix,data,retain=False):
        if not mqtt.is_connected(self.hass):return
        payload=data if isinstance(data,str) else json.dumps(data,separators=(',',':'),ensure_ascii=False)
        await mqtt.async_publish(self.hass,PREFIX+'/'+panel_id(pid)+'/'+suffix,payload,qos=1,retain=retain)
    async def command(self,pid,name,data=None):
        if not self.panels.get(pid,{}).get('paired'):raise ValueError('Panel ešte nie je pridaný')
        if not mqtt.is_connected(self.hass) or not self.status.get(pid,{}).get('online'):raise ValueError('Panel alebo MQTT je odpojené')
        await self.publish(pid,'cmd/'+name,data or {},False)
    async def receive(self,msg):
        try:
            parts=msg.topic.split('/');pid=panel_id(parts[2]);suffix='/'.join(parts[3:])
            if pid not in self.panels:
                if suffix not in {'sys/info','avail'}:return
                async with self.lock:
                    if pid not in self.panels:
                        self.panels[pid]={'name':pid,'paired':False,'config':default_config(),'device':{},'revision':0,'history':[]}
                        self.status[pid]={'online':False,'info':{},'sys':{}}
                        await self.persist()
                self.changed()
            status=self.status.setdefault(pid,{'online':False,'info':{},'sys':{}})
            status['lastSeen']=int(time.time()*1000)
            if suffix=='avail':
                status['online']=msg.payload=='online';self.changed()
                if status['online']:
                    await self.publish(pid,'cmd/info',{})
                    if self.panels[pid].get('paired') and self.panels[pid].get('configSource')!='pending':await self.push(pid)
                return
            data=json.loads(msg.payload)
            if not isinstance(data,dict):return
            if suffix=='sys/info':
                status['info']={k:data[k] for k in ['model','version','ip','rssi','uptimeS','freeMemMB','android','sensors','package'] if k in data}
                if self.panels[pid].get('paired'):self.register_device(pid)
            elif suffix=='sys/settings':
                await self.import_panel_settings(pid,data)
            elif suffix.startswith('sys/'):
                name=suffix[4:]
                if name=='notification' and not msg.retain and self.panels[pid].get('paired') and data.get('status') in {'shown','dismissed','expired','action'}:
                    self.hass.bus.async_fire('aurelvi_notification',{'panel_id':pid,'id':str(data.get('id',''))[:128],'status':data['status'],'action_id':str(data.get('actionId',''))[:128]})

                if name=='screenshot':
                    try:
                        if len(data.get('data',''))>1500000:return
                        raw=base64.b64decode(data['data'],validate=True)
                        if raw.startswith(b'\x89PNG\r\n\x1a\n'):status['screenshot']=data['data']
                    except (ValueError,KeyError):pass
                elif name=='notification' and data.get('status')=='action' and not msg.retain:
                    bindings=self.notify_bindings.get((pid,data.get('id')),{}).get(data.get('actionId'))
                    if bindings:await self.execute(bindings)
                else:status['sys'][name]=data
            elif suffix=='event' and not msg.retain and self.panels[pid].get('paired'):
                event_id=data.get('eventId')
                if event_id:
                    key=pid+':'+str(event_id)
                    if key in self.event_ids:return
                    self.event_ids[key]=time.monotonic()
                await self.handle_event(pid,data)
            self.changed()
        except Exception as e:
            _LOGGER.debug('Aurelvi message rejected: %s',e)
    def register_device(self,pid):
        info=self.status.get(pid,{}).get('info',{})
        dr.async_get(self.hass).async_get_or_create(config_entry_id=self.entry.entry_id,identifiers={(DOMAIN,pid)},name=self.panels[pid]['name'],manufacturer='Aurelvi',model=info.get('model','NSPanel Pro'),sw_version=info.get('version',VERSION))
    async def add(self,pid,name):
        panel_id(pid)
        async with self.lock:
            p=self.panels.setdefault(pid,{'config':default_config(),'device':{},'revision':0,'history':[]})
            p['name']=str(name or pid)[:80];p['paired']=True
            self.status.setdefault(pid,{'online':False,'info':{},'sys':{}})
            await self.persist()
        self.register_device(pid)
        local=p.get('localSettings',{})
        if not self.settings.get('githubRepo') and not self.settings.get('configured') and local.get('githubRepo'):
            self.settings.update({k:local[k] for k in ['githubRepo','githubAsset','haUrl'] if k in local});await self.persist();await self.check_releases()
        if not p.get('revision') and not p.get('configSource'):
            p['configSource']='pending';await self.persist()
        await self.publish(pid,'cmd/info',{})
        if p.get('configSource')!='pending':await self.push(pid)
        self.changed()
    async def rename(self,pid,name):
        panel_id(pid)
        if not isinstance(name,str) or not name.strip() or len(name.strip())>80:
            raise ValueError('Názov panela musí mať 1 až 80 znakov')
        async with self.lock:
            self.panels[pid]['name']=name.strip()
            await self.persist()
        if self.panels[pid].get('paired'):self.register_device(pid)
        self.changed()
    async def save(self,pid,config,device,expected):
        config=validate_config(config);device=validate_device(device,len(config['pages']))
        if not isinstance(device,dict) or len(json.dumps(device))>262144:raise ValueError('Neplatné nastavenia panela')
        # Credentials belong on the panel, never in page configuration or backups.
        if any(k in device for k in ['haToken','maToken','password','username']):raise ValueError('Heslá nepatria do konfigurácie stránok')
        async with self.lock:
            p=self.panels[pid]
            if p['revision']!=expected:raise ValueError('Konfiguráciu medzitým zmenil iný editor. Obnov stránku.')
            p['history']=(p.get('history',[])+[{'config':p['config'],'device':p['device']}])[-5:]
            p['config']=config;p['device']=copy.deepcopy(device);p['revision']+=1;p['configSource']='studio'
            await self.persist()
        await self.push(pid);self.changed();return p['revision']
    async def restore(self,pid,expected):
        p=self.panels[pid]
        if not p.get('history'):raise ValueError('Nie je dostupná predchádzajúca konfigurácia')
        previous=copy.deepcopy(p['history'][-1])
        return await self.save(pid,previous['config'],previous['device'],expected)
    async def push(self,pid):
        p=self.panels[pid]
        if not p.get('paired'):return
        await self.publish(pid,'config/panels',p['config'],True)
        device=copy.deepcopy(p['device'])
        app=public_settings(self.settings)
        if app:device['appSettings']=app
        await self.publish(pid,'config/device',device,True)
        for entity in entities(p['config']):await self.publish_state(pid,entity)
        for page in p['config']['pages']:
            if page['type']=='weather':self.weather_at.pop(pid+':'+page.get('weather',{}).get('entity',''),None);await self.weather(pid,page)
        await self.publish_timer(pid)
    async def import_panel_settings(self,pid,data):
        """Adopt the initial panel snapshot without replacing later Studio edits."""
        if len(json.dumps(data))>524288:raise ValueError('Panel snapshot is too large')
        p=self.panels[pid]
        safe=public_settings(data.get('settings'))
        p['localSettings']=safe
        initial=not p.get('revision') and p.get('configSource') in {None,'pending'}
        if initial:
            if data.get('config') is not None:
                config=normalize_panel_config(data['config'])
                p['config']=config
                p['device']=public_device(data.get('device',{}),len(config['pages']))
            p['configSource']='panel'
        # Global update configuration is seeded once. Later panels cannot overwrite it.
        seeded=False
        if p.get('paired') and not self.settings.get('githubRepo') and safe.get('githubRepo') and not self.settings.get('configured'):
            self.settings.update({k:safe[k] for k in ['githubRepo','githubAsset','haUrl'] if k in safe})
            seeded=True
        await self.persist()
        if p.get('paired'):
            if seeded:await self.check_releases()
            if initial or seeded:await self.push(pid)
        self.changed()
    async def publish_state(self,pid,entity):
        state=self.hass.states.get(entity);doc=mirror(state)
        if entity.startswith('camera.') and state:
            token=state.attributes.get('access_token')
            base=self.settings.get('haUrl')
            if not base:
                try:base=get_url(self.hass,allow_external=False)
                except Exception:base=None
            if token and base:
                doc['stream']=base.rstrip('/')+'/api/camera_proxy_stream/'+entity+'?token='+token
        await self.publish(pid,'state/'+entity_key(entity),doc,True)
        # Separate MQTT keys let existing APK switchers display confirmed attributes.
        projected=set()
        for page in self.panels[pid]['config']['pages']:
            for tile in page.get('tiles',[]):
                attr=tile.get('stateAttribute')
                if tile.get('entity')!=entity or attr not in PROJECTED_ATTRIBUTES or attr in projected:continue
                projected.add(attr)
                value=state.attributes.get(attr) if state else None
                available=doc['available']
                await self.publish(pid,'state/'+attribute_key(entity,attr),{'available':available,'on':False,'value':(value if value is not None else 'unknown') if available else 'unavailable'},True)
    @callback
    def state_changed(self,event):
        entity=event.data.get('entity_id')
        for pid,p in self.panels.items():
            if p.get('paired') and entity in entities(p['config']):self.hass.async_create_task(self.publish_state(pid,entity))
    async def execute(self,spec):
        for action in actions(spec):
            if action.get('noop') is True:continue
            domain,service=action['service'].split('.')
            data=copy.deepcopy(action.get('data',{}));target=action.get('target',{})
            if action.get('entity_id'):target=dict(target,entity_id=action['entity_id'])
            if action.get('dynamic')=='number_step':
                entity=target.get('entity_id');entity_id(entity)
                if domain not in {'number','input_number'} or service!='set_value' or not entity.startswith(domain+'.') or action.get('delta') not in {-1,1}:raise ValueError('Invalid number adjustment')
                state=self.hass.states.get(entity)
                if not state or state.state in {'unknown','unavailable'}:raise ValueError('Number is unavailable')
                current=finite_attribute(state.state);a=state.attributes
                low=finite_attribute(a.get('min'));high=finite_attribute(a.get('max'));step=finite_attribute(a.get('step'))
                if None in (current,low,high,step) or step<=0 or low>high:raise ValueError('Number has invalid limits')
                data['value']=round(max(low,min(high,current+action['delta']*step)),10)
            data.update(target)
            await self.hass.services.async_call(domain,service,data,blocking=True)
    async def call(self,service,entity,data=None):await self.execute({'service':service,'target':{'entity_id':entity},'data':data or {}})
    async def handle_event(self,pid,event):
        eid=event.get('eventId');button=event.get('button');page=next((p for p in self.panels[pid]['config']['pages'] if p['id']==event.get('page')),None)
        try:
            if not mqtt.is_connected(self.hass) or not self.status.get(pid,{}).get('online'):raise ValueError('Panel alebo MQTT je odpojené')
            if not page:raise ValueError('Neznáma stránka')
            if page['type']=='fan':await self.fan_event(pid,page,event)
            elif page['type']=='grid':await self.grid_event(pid,page,event)
            elif page['type']=='camera':
                matched=False
                for camera in page.get('camera',{}).get('cameras',[]):
                    for direction,binding in camera.get('ptz',{}).items():
                        if button==page['id']+'.ptz.'+entity_key(camera['entity'])+'.'+direction:await self.execute(binding);matched=True
                if not matched:raise ValueError('Neznámy príkaz kamery')
            elif button=='alarm' and event.get('action')=='alarm_fired':self.hass.bus.async_fire('aurelvi_alarm_fired',{'panel_id':pid})
            else:raise ValueError('Neznáma akcia')
            if eid:await self.publish(pid,'sys/ack',{'eventId':eid,'button':button,'ok':True},False)
        except Exception as e:
            self.log(pid,'Ovládanie zlyhalo: '+str(e),'error')
            if eid:await self.publish(pid,'sys/ack',{'eventId':eid,'button':button,'ok':False,'message':str(e)[:180]},False)
    async def fan_event(self,pid,page,event):
        f=page['fan'];fan=f['fanEntity'];light=f.get('lightEntity');prefix=page['id']+'.';button=event.get('button','')
        if not button.startswith(prefix):raise ValueError('Neplatné tlačidlo')
        action=button[len(prefix):];controls=f.get('controls',{})
        if action.startswith('speed.'):
            index=int(action[6:])-1
            if not 0<=index<len(f['speeds']):raise ValueError('Neplatná rýchlosť')
            speed=f['speeds'][index]
            if speed.get('actions'):await self.execute(speed['actions'])
            elif 'preset_mode' in speed:await self.call('fan.set_preset_mode',fan,{'preset_mode':speed['preset_mode']})
            else:await self.call('fan.set_percentage',fan,{'percentage':speed['percentage']})
        elif action=='light' and light:await self.call('light.toggle',light)
        elif action=='off':await self.call('fan.turn_off',fan)
        elif action=='all_off' and controls.get('allOff'):
            await self.call('fan.turn_off',fan)
            if light:await self.call('light.turn_off',light)
        elif action=='direction' and controls.get('direction'):
            state=self.hass.states.get(fan);direction=(state.attributes if state else {}).get('direction')
            if direction not in {'forward','reverse'}:raise ValueError('Ventilátor nehlási aktuálny smer')
            await self.call('fan.set_direction',fan,{'direction':'reverse' if direction=='forward' else 'forward'})
        elif action=='brightness' and light and controls.get('brightness'):
            await self.call('light.turn_on',light,{'brightness_pct':round(number(event.get('value'),0,1)*100)})
        elif action=='temperature' and light and controls.get('temperature'):
            state=self.hass.states.get(light);a=state.attributes if state else {}
            kelvin=round(number(event.get('value'),a.get('min_color_temp_kelvin',2000),a.get('max_color_temp_kelvin',6500)))
            await self.call('light.turn_on',light,{'color_temp_kelvin':kelvin})
        elif action=='timer' and controls.get('timer'):await self.set_timer(pid,fan,number(event.get('value'),1,1440)*60)
        elif action=='cancel_timer':await self.cancel_timer(pid)
        else:
            extra=next((x for x in f.get('extras',[]) if 'extra.'+x['id']==action),None)
            if not extra:raise ValueError('Nepriradená akcia')
            await self.execute(extra['actions'])
    async def grid_event(self,pid,page,event):
        bid=event.get('button','');action=event.get('action','');tile=next((t for t in page['tiles'] if t['id']==bid or bid.startswith(t['id']+'.')),None)
        if not tile:raise ValueError('Neznáme tlačidlo')
        binding=None;entity=tile.get('entity')
        if tile.get('type')=='split':
            segment=next((s for s in tile.get('buttons',[]) if bid==tile['id']+'.'+s['id']),None)
            if not segment:raise ValueError('Neznámy segment')
            binding=segment.get('bindings',{}).get('press:'+str(event.get('state')),segment.get('bindings',{}).get(action));entity=segment.get('entity') or entity
        elif tile.get('type')=='rocker' and entity and entity.startswith('cover.'):
            if action not in {'open','close','stop'}:raise ValueError('Invalid cover action')
            await self.call('cover.'+{'open':'open_cover','close':'close_cover','stop':'stop_cover'}[action],entity);return
        elif tile.get('type')=='rocker':
            index=int(bid.rsplit('.',1)[1]);rocker=tile.get('rockers',[])[index];entity=rocker.get('entity')
        else:
            value=event.get('value');key=str(value).lower() if isinstance(value,bool) else str(value)
            binding=tile.get('bindings',{}).get(action+':'+key,tile.get('bindings',{}).get(action))
        if binding:
            binding=copy.deepcopy(binding)
            for action in binding if isinstance(binding,list) else [binding]:
                if action.get('dynamic')=='brightness_pct':
                    action.setdefault('data',{})['brightness_pct']=round(number(event.get('value'),0,1)*100)
            await self.execute(binding)
        elif action=='dim' and entity:await self.call('light.turn_on',entity,{'brightness_pct':round(number(event.get('value'),0,1)*100)})
        elif action=='state' and entity and entity.startswith(('select.','input_select.')):await self.call(entity.split('.')[0]+'.select_option',entity,{'option':str(event.get('value'))})
        elif action=='toggle' and entity:await self.call('homeassistant.toggle',entity)
        elif action=='press' and entity and entity.startswith(('scene.','script.')):await self.call(entity.split('.')[0]+'.turn_on',entity)
        else:raise ValueError('Tlačidlo nemá priradenú akciu')
    async def set_timer(self,pid,entity,seconds):
        entity_id(entity);number(seconds,5,86400)
        await self.cancel_timer(pid)
        self.timers[pid]={'entity':entity,'deadline':time.time()+seconds,'title':'Vypnutie ventilátora','active':True}
        await self.persist();self.schedule_timer(pid);await self.publish_timer(pid);self.changed()
    def schedule_timer(self,key):
        if key in self.timer_jobs:self.timer_jobs.pop(key)()
        delay=max(0,self.timers[key]['deadline']-time.time())
        async def run(_):
            timer=self.timers.get(key)
            if not timer:return
            try:await self.call(timer['entity'].split('.')[0]+'.turn_off',timer['entity'])
            except Exception as e:self.log(key,'Časovač nemohol vypnúť zariadenie: '+str(e),'error')
            finally:
                self.timers.pop(key,None);self.timer_jobs.pop(key,None);await self.persist();await self.publish_timer(key);self.changed()
        self.timer_jobs[key]=async_call_later(self.hass,delay,run)
    async def cancel_timer(self,pid):
        if pid in self.timer_jobs:self.timer_jobs.pop(pid)()
        self.timers.pop(pid,None);await self.persist();await self.publish_timer(pid);self.changed()
    async def publish_timer(self,pid):
        timer=copy.deepcopy(self.timers.get(pid,{'active':False}))
        if timer.get('active'):timer['remainingS']=max(0,round(timer['deadline']-time.time()));timer['deadline']=round(timer['deadline']*1000)
        await self.publish(pid,'sys/timer',timer,True)
    async def periodic(self,_=None):
        if not mqtt.is_connected(self.hass):self.changed();return
        self.event_ids={k:v for k,v in self.event_ids.items() if time.monotonic()-v<120}
        for pid,p in self.panels.items():
            if not p.get('paired'):continue
            if pid in self.timers:await self.publish_timer(pid)
            for page in p['config']['pages']:
                if page['type']=='weather':await self.weather(pid,page)
            self.changed()
    async def weather(self,pid,page):
        entity=page.get('weather',{}).get('entity')
        if not entity:return
        key=pid+':'+entity
        if key in self.weather_at and time.monotonic()-self.weather_at[key]<600:return
        self.weather_at[key]=time.monotonic()
        state=self.hass.states.get(entity)
        if not state:return
        data=mirror(state);data['entity']=entity
        try:
            result=await self.hass.services.async_call('weather','get_forecasts',{'entity_id':entity,'type':'daily'},blocking=True,return_response=True)
            data['forecast']=(result or {}).get(entity,{}).get('forecast',[])[:5]
        except Exception: data['forecast']=[]
        data['ts']=round(time.time()*1000)
        await self.publish(pid,'state/weather',data,True)
    async def notify(self,pid,data):
        data=copy.deepcopy(data);data.setdefault('id',secrets.token_hex(8));bindings={}
        for a in data.get('actions',[])[:3]:
            if a.get('on_press'):bindings[a['id']]=actions(a.pop('on_press'))
        self.notify_bindings[(pid,data['id'])]=bindings
        if len(self.notify_bindings)>100:self.notify_bindings.pop(next(iter(self.notify_bindings)))
        await self.command(pid,'notify',data)
    async def check_releases(self,_=None):
        repo=self.settings.get('githubRepo','')
        if not repo:self.latest={};self.changed();return
        if not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9-]{0,38}/[A-Za-z0-9_.-]{1,100}',repo):raise ValueError('Neplatný repozitár')
        try:
            session=async_get_clientsession(self.hass)
            async with session.get('https://api.github.com/repos/'+repo+'/releases/latest',headers={'Accept':'application/vnd.github+json','User-Agent':'Aurelvi/'+VERSION},timeout=20,allow_redirects=False) as response:
                if response.status!=200:raise ValueError('GitHub odpovedal '+str(response.status))
                if response.content_length and response.content_length>1048576:raise ValueError('Odpoveď je príliš veľká')
                raw=await response.content.read(1048577)
                if len(raw)>1048576:raise ValueError('Odpoveď je príliš veľká')
                release=json.loads(raw)
            asset_name=self.settings.get('githubAsset','')
            assets=[a for a in release.get('assets',[]) if a.get('name','').endswith('.apk') and (a['name']==asset_name if asset_name else a['name'].lower().startswith(('aurelvi','openpanel')))]
            if release.get('draft') or release.get('prerelease') or len(assets)!=1:raise ValueError('Vydanie musí obsahovať jedno vybrané stabilné APK')
            url=assets[0]['browser_download_url'];parsed=urlparse(url)
            if parsed.scheme!='https' or parsed.netloc!='github.com' or not parsed.path.lower().startswith('/'+repo.lower()+'/releases/download/'):raise ValueError('Neplatná adresa APK')
            tag=re.fullmatch(r'(?i)(?:(?:aurelvi|openpanel)[-_ ]*)?v?(\d+\.\d+\.\d+)',release.get('tag_name',''))
            if not tag:raise ValueError('Použi tag v0.3.0 alebo inú číselnú verziu')
            self.latest={'version':tag.group(1),'url':url,'summary':str(release.get('body',''))[:4000],'release_url':release.get('html_url'),'asset':assets[0]['name']};self.changed()
        except Exception as e:self.log('', 'Kontrola GitHubu: '+str(e),'warning')
    def snapshot(self):
        from .health import panel_health
        return {'version':VERSION,'panels':[dict(copy.deepcopy(p),id=pid,status=copy.deepcopy(self.status.get(pid,{})),health=panel_health(self,pid)) for pid,p in self.panels.items()], 'timers':copy.deepcopy(self.timers),'settings':self.settings,'latest':self.latest,'logs':self.logs[-30:]}
