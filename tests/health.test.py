"""Checks use the real hub with isolated HA adapters from the bridge suite."""
import importlib.util, json, types, unittest
from pathlib import Path
spec=importlib.util.spec_from_file_location('bridge_checks',Path(__file__).with_name('integration.test.py'))
b=importlib.util.module_from_spec(spec);spec.loader.exec_module(b)
from aurelvi_test.health import panel_health, diagnostics
from aurelvi_test.diagnostics import async_get_config_entry_diagnostics, async_get_device_diagnostics
class Health(unittest.IsolatedAsyncioTestCase):
 async def asyncSetUp(self):
  self.hass=b.Hass();self.entry=types.SimpleNamespace(entry_id='entry');self.hub=b.Hub(self.hass,self.entry);self.entry.runtime_data=self.hub
  self.hub.panels={'room':{'name':'Personal room','paired':True,'config':{'pages':[b.fan_page('fan.room','light.room')]},'device':{},'revision':2,'history':[]}}
  self.hub.status={'room':{'online':True,'info':{'version':'Aurelvi 0.3.0','android':'8.1.0'},'sys':{}}}
  self.hass.values={'fan.room':b.State('fan.room'),'light.room':b.State('light.room')};self.hass.states.get=self.hass.values.get
 async def test_healthy(self):self.assertTrue(panel_health(self.hub,'room')['ok'])
 async def test_missing_entity(self):
  del self.hass.values['fan.room'];health=panel_health(self.hub,'room');self.assertEqual(health['issues'][0]['entities'],['fan.room']);self.assertEqual(health['missingCount'],1)
 async def test_unavailable_not_missing(self):
  self.hass.values['light.room'].state='unavailable';health=panel_health(self.hub,'room');self.assertEqual(health['missingCount'],0);self.assertEqual(health['unavailableCount'],1)
 async def test_mqtt_disconnected(self):
  old=b.mqtt.is_connected;b.mqtt.is_connected=lambda _:False
  try:self.assertEqual(panel_health(self.hub,'room')['issues'][0]['code'],'mqtt_disconnected')
  finally:b.mqtt.is_connected=old
 async def test_panel_offline(self):
  self.hub.status['room']['online']=False;self.assertEqual(panel_health(self.hub,'room')['issues'][0]['code'],'panel_offline')
 async def test_unpaired(self):
  self.hub.panels['room']['paired']=False;self.assertEqual(panel_health(self.hub,'room')['issues'][0]['code'],'not_paired')
 async def test_private_diagnostics(self):
  self.hub.settings={'haUrl':'http://private-secret:8123','githubRepo':'secret-owner/repo'}
  self.hub.status['room']['screenshot']='secret-photo';self.hub.status['room']['info']['ip']='192.0.2.10'
  self.hub.status['room']['info']['version']='secret-version';self.hub.logs=[{'panel':'room','level':'error','message':'secret-pin:1234'}]
  self.hub.panels['room']['history']=[{'password':'secret-password'}]
  self.hub.panels['room']['config']['pages'][0]['fan']['extras']=[{'id':'arm','actions':[{'service':'script.turn_on','data':{'code':'secret-code'}}]}]
  raw=json.dumps(await async_get_config_entry_diagnostics(self.hass,self.entry))
  for secret in ['secret','Personal room','fan.room','light.room','192.0.2.10']:self.assertNotIn(secret,raw)
  self.assertIsNone(diagnostics(self.hub)['panels'][0]['app_version'])
 async def test_device_scope_and_unknown_device(self):
  self.hub.panels['second']=dict(self.hub.panels['room']);d=await async_get_device_diagnostics(self.hass,self.entry,types.SimpleNamespace(identifiers={('aurelvi','room')}));self.assertEqual(d['panel_count'],1)
  self.assertEqual(diagnostics(self.hub,'unknown')['panel_count'],0)
 async def test_rename_persists_without_configuration_change(self):
  await self.hub.rename('room','  Bedroom  ');self.assertEqual(self.hub.store.saved['panels']['room']['name'],'Bedroom');self.assertEqual(self.hub.panels['room']['revision'],2);self.assertEqual(self.hass.mqtt,[])
 async def test_invalid_name_rejected(self):
  for name in ['', '   ', 'a'*81, None]:
   with self.assertRaises(ValueError):await self.hub.rename('room',name)
  self.assertEqual(self.hub.panels['room']['name'],'Personal room')
if __name__=='__main__':unittest.main(verbosity=2)
