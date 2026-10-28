"""Security regressions: camera stream tokens are not retained, unpaired panel auto-create is capped."""
import asyncio,copy,json,sys,types,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
PKG=ROOT/'custom_components/aurelvi'
# Minimal HA adapters, same approach as integration.test.py.
def module(name):
 m=types.ModuleType(name);m.__path__=[];sys.modules[name]=m;return m
for name in ['homeassistant','homeassistant.components','homeassistant.core','homeassistant.helpers','homeassistant.helpers.device_registry','homeassistant.helpers.aiohttp_client','homeassistant.helpers.dispatcher','homeassistant.helpers.event','homeassistant.helpers.network','homeassistant.helpers.storage','homeassistant.components.mqtt']:module(name)
core=sys.modules['homeassistant.core'];core.callback=lambda fn:fn;core.Context=object
mqtt=sys.modules['homeassistant.components.mqtt']
async def publish(hass,topic,payload,**kwargs):hass.mqtt.append((topic,json.loads(payload) if payload.startswith(('{','[')) else payload,kwargs))
async def subscribe(hass,topic,fn,qos):return lambda:None
mqtt.is_connected=lambda hass:True
mqtt.async_publish=publish;mqtt.async_subscribe=subscribe
sys.modules['homeassistant.helpers.device_registry'].async_get=lambda hass:types.SimpleNamespace(async_get_or_create=lambda **kw:None)
sys.modules['homeassistant.helpers.aiohttp_client'].async_get_clientsession=lambda hass:None
sys.modules['homeassistant.helpers.dispatcher'].async_dispatcher_send=lambda *a:None
sys.modules['homeassistant.helpers.network'].get_url=lambda *a,**k:'http://ha.test:8123'
sys.modules['homeassistant.helpers.event'].async_track_time_interval=lambda *a:lambda:None
sys.modules['homeassistant.helpers.event'].async_call_later=lambda hass,delay,fn:lambda:None
class Store:
 def __init__(self,*a):self.saved={}
 async def async_load(self):return copy.deepcopy(self.saved)
 async def async_save(self,data):self.saved=copy.deepcopy(data)
sys.modules['homeassistant.helpers.storage'].Store=Store
package=module('aurelvi_security');package.__path__=[str(PKG)]
from aurelvi_security.models import fan_page
from aurelvi_security.hub import Hub
MAX_UNPAIRED=10
class State:
 def __init__(self,entity_id,state='on',**attributes):self.entity_id=entity_id;self.state=state;self.attributes=attributes
class Hass:
 def __init__(self):
  self.mqtt=[];self.values={}
  self.states=types.SimpleNamespace(get=self.values.get)
  self.bus=types.SimpleNamespace(async_listen=lambda *a:lambda:None,async_fire=lambda *a:None)
  self.services=types.SimpleNamespace(async_call=lambda *a,**k:None)
 def async_create_task(self,coro):return asyncio.create_task(coro)
def msg(topic,payload='online',retain=False):return types.SimpleNamespace(topic=topic,payload=payload,retain=retain)
class CameraRetention(unittest.IsolatedAsyncioTestCase):
 async def asyncSetUp(self):
  self.hass=Hass();self.hub=Hub(self.hass,types.SimpleNamespace(entry_id='entry'))
  self.hub.settings={'haUrl':'http://ha.test:8123'}
  self.hub.panels={'test':{'name':'Room','paired':True,'config':{'v':1,'theme':'cream','pages':[fan_page('fan.ceiling','light.ceiling')]},'device':{},'revision':0,'history':[]}}
  self.hub.status={'test':{'online':True,'info':{},'sys':{}}}
  self.hass.values['light.ceiling']=State('light.ceiling',brightness=128)
  self.hass.values['camera.front']=State('camera.front',access_token='token-1')
 async def test_camera_state_not_retained_and_keeps_stream(self):
  await self.hub.publish_state('test','camera.front')
  topic,doc,flags=self.hass.mqtt[-1]
  self.assertTrue(topic.endswith('/state/camera_front'))
  self.assertIs(flags['retain'],False)
  self.assertIn('token=token-1',doc['stream'])
 async def test_camera_token_rotation_republishes_non_retained(self):
  await self.hub.publish_state('test','camera.front')
  self.hass.values['camera.front']=State('camera.front',access_token='token-2')
  await self.hub.publish_state('test','camera.front')
  topic,doc,flags=self.hass.mqtt[-1]
  self.assertIn('token=token-2',doc['stream']);self.assertIs(flags['retain'],False)
 async def test_non_camera_state_still_retained(self):
  await self.hub.publish_state('test','light.ceiling')
  topic,doc,flags=self.hass.mqtt[-1]
  self.assertTrue(topic.endswith('/state/light_ceiling'))
  self.assertIs(flags['retain'],True)
class UnpairedCap(unittest.IsolatedAsyncioTestCase):
 async def asyncSetUp(self):
  self.hass=Hass();self.hub=Hub(self.hass,types.SimpleNamespace(entry_id='entry'))
  self.hub.store.saved={}
 async def announce(self,i):
  await self.hub.receive(msg('aurelvi/panel/unpaired%d/avail'%i))
 async def test_eleventh_unpaired_panel_ignored(self):
  for i in range(MAX_UNPAIRED):await self.announce(i)
  self.assertEqual(len(self.hub.panels),MAX_UNPAIRED)
  await self.announce(MAX_UNPAIRED)
  self.assertNotIn('unpaired%d'%MAX_UNPAIRED,self.hub.panels)
  self.assertEqual(len(self.hub.panels),MAX_UNPAIRED)
  self.assertNotIn('unpaired%d'%MAX_UNPAIRED,self.hub.status)
 async def test_paired_panels_do_not_count_toward_cap(self):
  self.hub.panels={'home':{'name':'Home','paired':True,'config':{},'device':{},'revision':0,'history':[]}}
  for i in range(MAX_UNPAIRED):await self.announce(i)
  self.assertIn('home',self.hub.panels);self.assertEqual(len(self.hub.panels),MAX_UNPAIRED+1)
 async def test_existing_unpaired_panel_still_updates(self):
  for i in range(MAX_UNPAIRED):await self.announce(i)
  await self.announce(0)
  self.assertTrue(self.hub.status['unpaired0']['online'])
if __name__=='__main__':unittest.main(verbosity=2)
