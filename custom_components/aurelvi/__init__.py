"""Aurelvi: local wall panel integration and Studio."""
from pathlib import Path
import json
import logging
import voluptuous as vol
from homeassistant.components import frontend, panel_custom, websocket_api, mqtt
from homeassistant.components.http import StaticPathConfig
from homeassistant.const import Platform
from homeassistant.core import callback
from homeassistant.exceptions import HomeAssistantError
from .const import DOMAIN, PLATFORMS, VERSION
from .hub import Hub
from .i18n import msg as tr, plain
from .models import panel_id

_LOGGER=logging.getLogger(__name__)

async def async_setup(hass,config):
    hass.data.setdefault(DOMAIN,{})
    if not hass.data[DOMAIN].get('registered'):
        await hass.http.async_register_static_paths([StaticPathConfig('/aurelvi-static',str(Path(__file__).parent/'frontend'),False)])
        websocket_api.async_register_command(hass,ws_command)
        hass.data[DOMAIN]['registered']=True
    return True

async def async_setup_entry(hass,entry):
    hub=Hub(hass,entry);entry.runtime_data=hub;hass.data[DOMAIN]['hub']=hub
    try:
        await hub.start()
        await hass.config_entries.async_forward_entry_setups(entry,[Platform(x) for x in PLATFORMS])
        await panel_custom.async_register_panel(hass,frontend_url_path='aurelvi',webcomponent_name='aurelvi-studio',sidebar_title='Aurelvi Studio',sidebar_icon='mdi:gesture-tap',module_url='/aurelvi-static/studio.js?v='+VERSION,embed_iframe=False,require_admin=True,config_panel_domain=DOMAIN)
        register_services(hass)
    except Exception:
        await hub.close();hass.data[DOMAIN].pop('hub',None);raise
    return True

async def async_unload_entry(hass,entry):
    if not await hass.config_entries.async_unload_platforms(entry,[Platform(x) for x in PLATFORMS]):return False
    await entry.runtime_data.close();hass.data[DOMAIN].pop('hub',None)
    frontend.async_remove_panel(hass,'aurelvi')
    for name in ['push_config','wake','page','notify','screen','start_timer','cancel_timer','adb_command']:hass.services.async_remove(DOMAIN,name)
    return True

@websocket_api.websocket_command({vol.Required('type'):'aurelvi/command',vol.Required('action'):str,vol.Optional('panel_id'):str,vol.Optional('data',default={}):dict})
@websocket_api.require_admin
@websocket_api.async_response
async def ws_command(hass,connection,msg):
    hub=hass.data.get(DOMAIN,{}).get('hub')
    if not hub:connection.send_error(msg['id'],'not_ready',tr('backend.ws.not_ready'));return
    action=msg['action'];pid=msg.get('panel_id');data=msg['data']
    try:
        if pid:panel_id(pid)
        if action=='adb':
            from .adb import async_command
            result=await async_command(hub,data)
            if pid:
                from .adb import remember_endpoint
                await remember_endpoint(hub,pid,data)
        elif action=='licence':
            token=data.get('token','')
            import re
            if not isinstance(token,str) or not re.fullmatch(r'AV1\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+',token) or len(token)>10000:raise ValueError(tr('backend.ws.invalid_licence'))
            await hub.command(pid,'licence',{'token':token});result={'sent':True}
        elif action=='list':result=hub.snapshot()
        elif action=='add':await hub.add(pid,data.get('name'));result=hub.snapshot()
        elif action=='rename':await hub.rename(pid,data.get('name'));result=True
        elif action=='diagnostics':
            from .health import diagnostics
            result=diagnostics(hub,pid)
        elif action=='save':result={'revision':await hub.save(pid,data['config'],data.get('device',{}),data['revision'])}
        elif action=='restore':result={'revision':await hub.restore(pid,data['revision'])}
        elif action=='push':await hub.push(pid);result=True
        elif action=='command':
            name=data.get('name');payload=data.get('payload',{})
            if name not in {'wake','screen','page','info','screenshot','notify_clear','check_update'}:raise ValueError(tr('backend.ws.command_not_allowed'))
            await hub.command(pid,name,payload);result=True
        elif action=='notify':await hub.notify(pid,data);result=True
        elif action=='timer':await hub.set_timer(pid,data['entity'],data['seconds']);result=True
        elif action=='cancel_timer':await hub.cancel_timer(pid);result=True
        elif action=='settings':
            import re
            from urllib.parse import urlparse
            repo=data.get('githubRepo','').strip();url=data.get('haUrl','').strip()
            if repo and not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9-]{0,38}/[A-Za-z0-9_.-]{1,100}',repo):raise ValueError(tr('backend.ws.invalid_repo_format'))
            if url:
                u=urlparse(url)
                if u.scheme not in {'http','https'} or not u.hostname or u.username or u.password:raise ValueError(tr('backend.ws.invalid_ha_url'))
            hub.latest={};hub.settings={'githubRepo':repo,'githubAsset':data.get('githubAsset','').strip(),'haUrl':url,'configured':True};await hub.persist();await hub.check_releases()
            for panel,p in hub.panels.items():
                if p.get('paired'):await hub.push(panel)
            result=True
        elif action=='check_update':await hub.check_releases();result=hub.latest
        elif action=='install_update':
            if not hub.latest.get('url'):raise ValueError(tr('backend.ws.no_apk'))
            await hub.command(pid,'update',{'url':hub.latest['url']});result=True
        elif action=='states':
            from .models import entities, mirror
            cfg=data.get('config',{})
            result={entity.replace('.','_'):mirror(hass.states.get(entity)) for entity in entities(cfg)}
        else:raise ValueError(tr('backend.ws.unknown_operation'))
        connection.send_result(msg['id'],result)
    except (ValueError,KeyError,TypeError) as e:connection.send_error(msg['id'],'invalid_request',str(e))
    except Exception:
        _LOGGER.exception('Aurelvi Studio operation failed: %s',action)
        connection.send_error(msg['id'],'failed',tr('backend.ws.failed'))

def register_services(hass):
    async def handle(call):
        hub=hass.data[DOMAIN]['hub'];data=dict(call.data);pid=data.pop('panel_id')
        try:
            if call.service=='push_config':await hub.push(pid)
            elif call.service=='start_timer':await hub.set_timer(pid,data['entity_id'],data['seconds'])
            elif call.service=='cancel_timer':await hub.cancel_timer(pid)
            elif call.service=='notify':await hub.notify(pid,data)
            else:await hub.command(pid,call.service,data)
        except ValueError as err:raise HomeAssistantError(translation_domain=DOMAIN,translation_key='panel_command_failed',translation_placeholders={'error':plain(err)}) from err
    for name in ['push_config','wake','page','notify','screen','start_timer','cancel_timer']:
        hass.services.async_register(DOMAIN,name,handle,schema=vol.Schema({vol.Required('panel_id'):str},extra=vol.ALLOW_EXTRA))
    from .adb import SERVICE_OPERATIONS,async_service
    async def handle_adb(call):
        hub=hass.data[DOMAIN]['hub']
        try:await async_service(hub,dict(call.data))
        except ValueError as err:raise HomeAssistantError(translation_domain=DOMAIN,translation_key='adb_failed',translation_placeholders={'error':plain(err)}) from err
    hass.services.async_register(DOMAIN,'adb_command',handle_adb,schema=vol.Schema({
        vol.Required('panel_id'):str,vol.Required('operation'):vol.In(SERVICE_OPERATIONS),
        vol.Optional('host'):str,vol.Optional('port'):vol.All(vol.Coerce(int),vol.Range(min=1,max=65535))}))
