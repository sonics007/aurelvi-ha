"""Initial snapshot, conflict protection and public-settings regression tests."""
import importlib.util, unittest, types, copy
from pathlib import Path
spec=importlib.util.spec_from_file_location('bridge_checks',Path(__file__).with_name('integration.test.py'))
b=importlib.util.module_from_spec(spec);spec.loader.exec_module(b)
from aurelvi_test.panel_settings import public_settings, public_device
class Settings(unittest.IsolatedAsyncioTestCase):
 async def asyncSetUp(self):
  self.hass=b.Hass();self.hub=b.Hub(self.hass,types.SimpleNamespace(entry_id='entry'))
  self.hub.panels={'test':{'name':'Room','paired':True,'config':b.default_config() if hasattr(b,'default_config') else {'pages':[{'id':'clock','type':'clock'}]},'device':{},'revision':0,'history':[],'configSource':'pending'}}
  self.hub.status={'test':{'online':True,'info':{},'sys':{}}}
  async def releases():pass
  self.hub.check_releases=releases
 def snapshot(self):return {'settings':{'githubRepo':'sonics007/aurelvi-apk','githubAsset':'','haToken':'secret','password':'secret','haUrl':'http://ha.test:8123'},'config':{'pages':[b.fan_page()]},'device':{'iconSize':48,'clockFace':'analog','screensaver':{'after':60,'password':'secret'}}}
 async def test_initial_snapshot_adopts_existing_pages_and_public_settings(self):
  await self.hub.import_panel_settings('test',self.snapshot());p=self.hub.panels['test'];self.assertEqual(p['config']['pages'][0]['type'],'fan');self.assertEqual(p['device']['iconSize'],48);self.assertEqual(p['device']['clockFace'],'analog');self.assertEqual(self.hub.settings['githubRepo'],'sonics007/aurelvi-apk');self.assertNotIn('haToken',str(p));self.assertNotIn('secret',str(p));self.assertEqual(p['configSource'],'panel')
 async def test_new_pair_does_not_send_empty_default_configuration(self):
  self.hub.panels['test'].pop('configSource');self.hub.panels['test']['paired']=False
  await self.hub.add('test','Room');self.assertFalse(any('/config/' in topic for topic,_,_ in self.hass.mqtt));self.assertTrue(any(topic.endswith('/cmd/info') for topic,_,_ in self.hass.mqtt))
 async def test_snapshot_cannot_overwrite_studio_revision(self):
  p=self.hub.panels['test'];p['revision']=2;p['configSource']='studio';before=copy.deepcopy(p['config']);await self.hub.import_panel_settings('test',self.snapshot());self.assertEqual(p['config'],before)
 async def test_later_panel_cannot_change_existing_update_settings(self):
  self.hub.settings={'githubRepo':'owner/chosen'};await self.hub.import_panel_settings('test',self.snapshot());self.assertEqual(self.hub.settings['githubRepo'],'owner/chosen')
 async def test_blank_explicit_settings_are_not_automatically_replaced(self):
  self.hub.settings={'configured':True,'githubRepo':''};await self.hub.import_panel_settings('test',self.snapshot());self.assertEqual(self.hub.settings['githubRepo'],'')
 def test_url_query_and_credentials_are_rejected(self):
  self.assertEqual(public_settings({'haUrl':'http://u:password@ha/','maUrl':'http://ma/?token=secret','haToken':'secret'}),{})
 def test_display_limits(self):
  for key,value in [('labelSize',80),('iconSize',1000),('labelOffsetY',100)]:
   with self.assertRaises(ValueError):public_device({key:value},1)
 async def test_repeat_snapshot_does_not_reset_page_or_repush_configuration(self):
  await self.hub.import_panel_settings('test',self.snapshot());self.hass.mqtt.clear();await self.hub.import_panel_settings('test',self.snapshot());self.assertFalse(any('/config/' in topic for topic,_,_ in self.hass.mqtt))
 async def test_cover_actions_use_cover_services(self):
  page={'id':'covers','type':'grid','grid':{'rows':1,'columns':1},'tiles':[{'id':'blind','type':'rocker','entity':'cover.blind','row':1,'col':1}]}
  await self.hub.grid_event('test',page,{'button':'blind','action':'open'});self.assertEqual(self.hass.calls[-1][:3],('cover','open_cover',{'entity_id':'cover.blind'}))
 async def test_notification_status_fires_scoped_event(self):
  import json
  events=[];self.hass.bus.async_fire=lambda event,data:events.append((event,data))
  await self.hub.receive(types.SimpleNamespace(topic='aurelvi/panel/test/sys/notification',payload=json.dumps({'id':'n1','status':'shown'}),retain=False))
  self.assertEqual(events[0],('aurelvi_notification',{'panel_id':'test','id':'n1','status':'shown','action_id':''}))
 async def test_legacy_layout_sentity_and_press_toggle_are_migrated(self):
  doc=self.snapshot();doc['config']={'pages':[{'id':'home','type':'grid','grid':{'rows':1,'columns':1},'tiles':[{'id':'lamp','type':'button','sentity':'light.room','behavior':'toggle','row':1,'col':1,'bindings':{'press':{'action':'toggle'}}}]}]}
  await self.hub.import_panel_settings('test',doc);page=self.hub.panels['test']['config']['pages'][0]
  await self.hub.grid_event('test',page,{'button':'lamp','action':'toggle'});self.assertEqual(self.hass.calls[-1][:3],('homeassistant','toggle',{'entity_id':'light.room'}))
 async def test_legacy_none_does_not_fall_back_to_toggle(self):
  doc=self.snapshot();doc['config']={'pages':[{'id':'home','type':'grid','grid':{'rows':1,'columns':1},'tiles':[{'id':'lamp','type':'button','entity':'light.room','row':1,'col':1,'bindings':{'press':{'action':'none'}}}]}]}
  await self.hub.import_panel_settings('test',doc);await self.hub.grid_event('test',self.hub.panels['test']['config']['pages'][0],{'button':'lamp','action':'toggle'});self.assertFalse(self.hass.calls)
 def test_wallpaper_rejects_urls_and_accepts_inline_image(self):
  self.assertEqual(public_device({'wallpaper':{'id':'custom','image':'data:image/jpeg;base64,YWJj','dim':20}},1)['wallpaper']['id'],'custom')
  for image in ['javascript:alert(1)','https://host/image.png','data:image/svg+xml;base64,YWJj']:
   with self.assertRaises(ValueError):public_device({'wallpaper':{'id':'custom','image':image}},1)
if __name__=='__main__':unittest.main(verbosity=2)
