"""Real Aurelvi bridge exercised with isolated Home Assistant service/MQTT adapters."""
import asyncio,copy,importlib.util,json,sys,types,time,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
PKG=ROOT/'custom_components/aurelvi'
# Minimal HA adapters; actual bridge/validation files are imported unchanged.
def module(name):
 m=types.ModuleType(name);m.__path__=[];sys.modules[name]=m;return m
for name in ['homeassistant','homeassistant.components','homeassistant.core','homeassistant.helpers','homeassistant.helpers.device_registry','homeassistant.helpers.aiohttp_client','homeassistant.helpers.dispatcher','homeassistant.helpers.event','homeassistant.helpers.network','homeassistant.helpers.storage','homeassistant.components.mqtt']:module(name)
core=sys.modules['homeassistant.core'];core.callback=lambda fn:fn;core.Context=object
mqtt=sys.modules['homeassistant.components.mqtt']
async def publish(hass,topic,payload,**kwargs):hass.mqtt.append((topic,json.loads(payload) if payload.startswith(('{','[')) else payload,kwargs))
async def subscribe(hass,topic,fn,qos):hass.subscriptions.append((topic,fn));return lambda:None
mqtt.is_connected=lambda hass:True
mqtt.async_publish=publish;mqtt.async_subscribe=subscribe
sys.modules['homeassistant.helpers.device_registry'].async_get=lambda hass:types.SimpleNamespace(async_get_or_create=lambda **kw:hass.devices.append(kw))
sys.modules['homeassistant.helpers.aiohttp_client'].async_get_clientsession=lambda hass:None
sys.modules['homeassistant.helpers.dispatcher'].async_dispatcher_send=lambda *a:None
sys.modules['homeassistant.helpers.network'].get_url=lambda *a,**k:'http://ha.test:8123'
sys.modules['homeassistant.helpers.event'].async_track_time_interval=lambda *a:lambda:None
jobs=[]
def later(hass,delay,fn):
 record={'delay':delay,'callback':fn,'cancelled':False};jobs.append(record)
 return lambda:record.update(cancelled=True)
sys.modules['homeassistant.helpers.event'].async_call_later=later
class Store:
 def __init__(self,*a):self.saved={}
 async def async_load(self):return copy.deepcopy(self.saved)
 async def async_save(self,data):self.saved=copy.deepcopy(data)
sys.modules['homeassistant.helpers.storage'].Store=Store
package=module('aurelvi_test');package.__path__=[str(PKG)]
from aurelvi_test.models import validate_config,fan_page,mirror,validate_device,entities
from aurelvi_test.hub import Hub
class State:
 def __init__(self,entity_id,state='on',**attributes):self.entity_id=entity_id;self.state=state;self.attributes=attributes
class Hass:
 def __init__(self):
  self.mqtt=[];self.calls=[];self.subscriptions=[];self.devices=[];self.values={};self.fail=False
  self.states=types.SimpleNamespace(get=self.values.get)
  self.bus=types.SimpleNamespace(async_listen=lambda *a:lambda:None,async_fire=lambda *a:None)
  self.services=types.SimpleNamespace(async_call=self.call)
 async def call(self,domain,service,data,**kwargs):
  if self.fail:raise ValueError('service failed')
  self.calls.append((domain,service,data,kwargs))
  if domain=='weather':return {'weather.home':{'forecast':[{'datetime':'2026-10-14','temperature':23}]}}
 def async_create_task(self,coro):return asyncio.create_task(coro)
class Validation(unittest.TestCase):
 def test_six_speed_template(self):validate_config({'pages':[fan_page()]})
 def test_custom_preset_and_action(self):
  p=fan_page();p['fan']['speeds']=[{'preset_mode':'quiet'},{'actions':[{'service':'script.turn_on','target':{'entity_id':'script.breeze'}}]}];validate_config({'pages':[p]})
 def test_reject_invalid_speed(self):
  p=fan_page();p['fan']['speeds'][0]['percentage']=101
  with self.assertRaises(ValueError):validate_config({'pages':[p]})
 def test_reject_duplicate_pages(self):
  with self.assertRaises(ValueError):validate_config({'pages':[fan_page(),fan_page()]})
 def test_reject_overlapping_grid(self):
  with self.assertRaises(ValueError):validate_config({'pages':[{'id':'grid','type':'grid','grid':{'columns':1,'rows':1},'tiles':[{'id':'a','type':'button','row':1,'col':1},{'id':'b','type':'button','row':1,'col':1}]}]})
 def test_light_and_fan_attributes(self):
  self.assertEqual(mirror(State('light.test',brightness=128))['brightness'],.502)
  self.assertEqual(mirror(State('fan.test',percentage=50,direction='reverse'))['percentage'],50)
 def test_unavailable_has_no_green(self):self.assertEqual(mirror(State('fan.test','unavailable'))['on'],False)
 def test_device_bounds(self):
  with self.assertRaises(ValueError):validate_device({'screensaver':{'after':-1}},2)
 def test_custom_actions_index_entities(self):
  p=fan_page();p['fan']['extras']=[{'id':'scene','actions':[{'service':'scene.turn_on','target':{'entity_id':'scene.reading'}}]}]
  self.assertIn('scene.reading',entities({'pages':[p]}))
class Integration(unittest.IsolatedAsyncioTestCase):
 async def asyncSetUp(self):
  self.hass=Hass();self.hub=Hub(self.hass,types.SimpleNamespace(entry_id='entry'));self.hub.panels={'test':{'name':'Room','paired':True,'config':{'v':1,'theme':'cream','pages':[fan_page('fan.ceiling','light.ceiling')]},'device':{},'revision':0,'history':[]}};self.hub.status={'test':{'online':True,'info':{},'sys':{}}}
  self.hass.values['fan.ceiling']=State('fan.ceiling',percentage=50,direction='forward');self.hass.values['light.ceiling']=State('light.ceiling',brightness=128,color_temp_kelvin=3000,min_color_temp_kelvin=2200,max_color_temp_kelvin=6500)
 async def event(self,button,value=None,event_id='e1',retain=False):
  await self.hub.receive(types.SimpleNamespace(topic='aurelvi/panel/test/event',payload=json.dumps({'page':'fan','button':button,'action':'press','value':value,'eventId':event_id}),retain=retain))
 def call_data(self):return self.hass.calls[-1][:3]
 async def test_startup_and_updates_with_nullable_light_attributes(self):
  self.hass.values['light.ceiling']=State('light.ceiling','off',brightness=None,color_temp_kelvin=None,color_temp=None)
  self.hub.store.saved={'panels':copy.deepcopy(self.hub.panels)}
  await self.hub.start()
  light=[doc for topic,doc,options in self.hass.mqtt if topic.endswith('/state/light_ceiling')]
  self.assertTrue(light);self.assertNotIn('brightness',light[-1]);self.assertFalse(light[-1]['on'])
  self.hass.values['light.ceiling']=State('light.ceiling','on',brightness=128,color_temp_kelvin=3000)
  await self.hub.publish_state('test','light.ceiling')
  self.assertEqual(self.hass.mqtt[-1][1]['brightness'],.502)
  self.hass.values['light.ceiling']=State('light.ceiling','unavailable',brightness=None)
  await self.hub.publish_state('test','light.ceiling')
  self.assertFalse(self.hass.mqtt[-1][1]['available'])
  await self.hub.close()
 async def test_speed6(self):
  await self.event('fan.speed.6');self.assertEqual(self.call_data(),('fan','set_percentage',{'percentage':100,'entity_id':'fan.ceiling'}));self.assertTrue(self.hass.mqtt[-1][1]['ok'])
 async def test_direction_reads_real_state(self):
  await self.event('fan.direction');self.assertEqual(self.call_data()[2]['direction'],'reverse')
 async def test_brightness(self):
  await self.event('fan.brightness',.42);self.assertEqual(self.call_data()[2]['brightness_pct'],42)
 async def test_kelvin_bounds(self):
  await self.event('fan.temperature',7000);self.assertFalse(self.hass.mqtt[-1][1]['ok']);self.assertEqual(self.hass.calls,[])
 async def test_all_off(self):
  await self.event('fan.all_off');self.assertEqual(len(self.hass.calls),2);self.assertEqual(self.call_data()[0],'light')
 async def test_unknown_button_no_service(self):
  await self.event('fan.secret');self.assertEqual(self.hass.calls,[]);self.assertFalse(self.hass.mqtt[-1][1]['ok'])
 async def test_retained_command_ignored(self):
  await self.event('fan.speed.6',retain=True);self.assertEqual(self.hass.calls,[])
 async def test_qos_duplicate_not_executed_twice(self):
  await self.event('fan.speed.6');await self.event('fan.speed.6');self.assertEqual(len(self.hass.calls),1)
 async def test_pending_discovery_cannot_control(self):
  self.hub.panels['test']['paired']=False;await self.event('fan.speed.6');self.assertEqual(self.hass.calls,[])
 async def test_offline_cannot_control(self):
  self.hub.status['test']['online']=False;await self.event('fan.speed.6');self.assertEqual(self.hass.calls,[])
 async def test_service_failure_negative_ack(self):
  self.hass.fail=True;await self.event('fan.speed.6');self.assertFalse(self.hass.mqtt[-1][1]['ok'])
 async def test_timer_persists_and_executes(self):
  await self.event('fan.timer',120);self.assertIn('test',self.hub.store.saved['timers']);job=jobs[-1];self.assertAlmostEqual(job['delay'],7200,delta=1);await job['callback'](None);self.assertEqual(self.call_data()[:2],('fan','turn_off'));self.assertNotIn('test',self.hub.timers)
 async def test_timer_cancelled_and_restored_after_restart(self):
  await self.hub.set_timer('test','fan.ceiling',60);old=jobs[-1];saved=self.hub.store.saved
  h=Hub(self.hass,types.SimpleNamespace(entry_id='entry'));h.store.saved=saved;await h.start();self.assertIn('test',h.timers);self.assertLessEqual(jobs[-1]['delay'],60);await h.cancel_timer('test');self.assertTrue(jobs[-1]['cancelled']);await h.close()
 async def test_revision_conflict_no_overwrite(self):
  with self.assertRaises(ValueError):await self.hub.save('test',self.hub.panels['test']['config'],{},9)
  self.assertEqual(self.hub.panels['test']['revision'],0)
 async def test_history_restore(self):
  config=copy.deepcopy(self.hub.panels['test']['config']);config['theme']='night';await self.hub.save('test',config,{},0);await self.hub.restore('test',1);self.assertEqual(self.hub.panels['test']['config']['theme'],'cream');self.assertEqual(self.hub.panels['test']['revision'],2)
 async def test_camera_uses_local_signed_url(self):
  self.hass.values['camera.front']=State('camera.front',access_token='temporary-token');await self.hub.publish_state('test','camera.front');self.assertEqual(self.hass.mqtt[-1][1]['stream'],'http://ha.test:8123/api/camera_proxy_stream/camera.front?token=temporary-token')
 async def test_weather_first_request_after_host_start(self):
  from unittest.mock import patch
  self.hass.values['weather.home']=State('weather.home','sunny',temperature=21)
  with patch('aurelvi_test.hub.time.monotonic',return_value=30):
   await self.hub.weather('test',{'weather':{'entity':'weather.home'}})
   self.assertEqual(len(self.hass.mqtt),1)
   await self.hub.weather('test',{'weather':{'entity':'weather.home'}})
   self.assertEqual(len(self.hass.mqtt),1)
 async def test_weather_forecast(self):
  self.hass.values['weather.home']=State('weather.home','sunny',temperature=21,temperature_unit='°C');await self.hub.weather('test',{'type':'weather','weather':{'entity':'weather.home'}});self.assertEqual(self.hass.mqtt[-1][1]['forecast'][0]['temperature'],23)
 async def test_custom_scene_action(self):
  self.hub.panels['test']['config']['pages'][0]['fan']['extras']=[{'id':'reading','actions':[{'service':'scene.turn_on','target':{'entity_id':'scene.reading'}}]}];await self.event('fan.extra.reading');self.assertEqual(self.call_data()[:2],('scene','turn_on'))
 async def test_notification_action_is_integration_owned(self):
  await self.hub.notify('test',{'id':'notify1','actions':[{'id':'open','on_press':{'service':'cover.open_cover','target':{'entity_id':'cover.gate'}}}]});self.assertNotIn('on_press',self.hass.mqtt[-1][1]['actions'][0]);await self.hub.receive(types.SimpleNamespace(topic='aurelvi/panel/test/sys/notification',payload=json.dumps({'id':'notify1','actionId':'open','status':'action'}),retain=False));self.assertEqual(self.call_data()[:2],('cover','open_cover'))
 async def test_grid_scoped_binding(self):
  self.hub.panels['test']['config']={'pages':[{'id':'grid','type':'grid','tiles':[{'id':'light','entity':'light.ceiling','type':'button','behavior':'toggle'}]}]};await self.hub.handle_event('test',{'page':'grid','button':'light','action':'toggle','eventId':'grid1'});self.assertEqual(self.call_data()[:2],('homeassistant','toggle'))
class Releases(unittest.IsolatedAsyncioTestCase):
 async def asyncSetUp(self):
  self.hass=Hass();self.hub=Hub(self.hass,types.SimpleNamespace(entry_id='entry'));self.hub.settings={'githubRepo':'Owner/project'}
  self.doc={'tag_name':'v0.3.1','assets':[{'name':'Aurelvi.apk','browser_download_url':'https://github.com/owner/project/releases/download/v0.3.1/Aurelvi.apk'}],'body':'Updates','html_url':'https://github.com/owner/project/releases/tag/v0.3.1'};self.code=200
  test=self
  class Response:
   @property
   def status(self):return test.code
   content_length=None
   async def __aenter__(self):return self
   async def __aexit__(self,*args):return False
   @property
   def content(self):return self
   async def read(self,size):return json.dumps(test.doc).encode()
  class Session:
   def get(self,*args,**kwargs):return Response()
  self.original=sys.modules['aurelvi_test.hub'].async_get_clientsession
  sys.modules['aurelvi_test.hub'].async_get_clientsession=lambda hass:Session()
 async def asyncTearDown(self):sys.modules['aurelvi_test.hub'].async_get_clientsession=self.original
 async def test_github_asset_case_and_version(self):
  await self.hub.check_releases();self.assertEqual(self.hub.latest['version'],'0.3.1');self.assertTrue(self.hub.latest['url'].endswith('Aurelvi.apk'))
 async def test_github_multiple_assets(self):
  self.doc['assets'].append(dict(self.doc['assets'][0],name='Aurelvi-debug.apk'));await self.hub.check_releases();self.assertFalse(self.hub.latest);self.assertTrue(self.hub.logs)
 async def test_github_wrong_host(self):
  self.doc['assets'][0]['browser_download_url']='https://evil.test/owner/project/releases/download/v0.3.1/Aurelvi.apk';await self.hub.check_releases();self.assertFalse(self.hub.latest)
 async def test_github_draft_and_unknown_tag(self):
  self.doc['draft']=True;await self.hub.check_releases();self.assertFalse(self.hub.latest);self.doc.pop('draft');self.doc['tag_name']='nightly';await self.hub.check_releases();self.assertFalse(self.hub.latest)
 async def test_github_missing_release(self):
  self.code=404;await self.hub.check_releases();self.assertFalse(self.hub.latest);self.assertIn('404',self.hub.logs[-1]['message'])
if __name__=='__main__':unittest.main(verbosity=2)
