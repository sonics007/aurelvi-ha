"""Lifecycle/config-flow endpoints with isolated HA adapters and real module code."""
import asyncio,importlib.util,sys,types,unittest
from enum import Enum
from pathlib import Path
sys.path.insert(0,str(Path(__file__).parent))
import importlib
bridge=importlib.import_module('integration.test') if False else None
# Reuse the bridge adapter module without running its unittest main.
spec=importlib.util.spec_from_file_location('aurelvi_test_adapters',Path(__file__).with_name('integration.test.py'));ad=importlib.util.module_from_spec(spec);spec.loader.exec_module(ad)
def module(name):return ad.module(name)
frontend=module('homeassistant.components.frontend');panel=module('homeassistant.components.panel_custom');websocket=module('homeassistant.components.websocket_api');http=module('homeassistant.components.http');const=module('homeassistant.const');ce=module('homeassistant.config_entries')
const.Platform=Enum('Platform',{name.upper():name for name in ['sensor','binary_sensor','button','number','switch','media_player','update']})
http.StaticPathConfig=lambda *args:args
for name in ['require_admin','async_response']:setattr(websocket,name,lambda fn:fn)
websocket.websocket_command=lambda schema:lambda fn:fn
websocket.async_register_command=lambda *args:None
frontend.async_remove_panel=lambda hass,path:hass.removed.append(path)
async def register(hass,**kwargs):hass.panel=kwargs
panel.async_register_panel=register
class FakeFlow:
 def __init_subclass__(cls,domain=None,**kwargs):cls.domain=domain
 def _async_current_entries(self):return self.existing
 def async_abort(self,reason):return {'type':'abort','reason':reason}
 def async_show_form(self,**kwargs):return {'type':'form',**kwargs}
 def async_create_entry(self,**kwargs):return {'type':'create_entry',**kwargs}
 async def async_set_unique_id(self,id):self.unique=id
 def _abort_if_unique_id_configured(self):pass
ce.ConfigFlow=FakeFlow
root=ad.PKG
spec=importlib.util.spec_from_file_location('aurelvi_live',root/'__init__.py',submodule_search_locations=[str(root)]);integration=importlib.util.module_from_spec(spec);sys.modules['aurelvi_live']=integration;spec.loader.exec_module(integration)
flow_spec=importlib.util.spec_from_file_location('aurelvi_live.config_flow',root/'config_flow.py');flow=importlib.util.module_from_spec(flow_spec);flow_spec.loader.exec_module(flow)
class Connection:
 def __init__(self):self.results=[];self.errors=[]
 def send_result(self,id,data):self.results.append((id,data))
 def send_error(self,*args):self.errors.append(args)
class Lifecycle(unittest.IsolatedAsyncioTestCase):
 async def asyncSetUp(self):
  self.hass=ad.Hass();self.hass.data={};self.hass.removed=[];self.hass.panel=None;self.hass.services.async_register=lambda *args,**kwargs:None;self.hass.services.async_remove=lambda *args:None
  async def static(paths):self.hass.static=paths
  async def forward(*args):self.hass.forwarded=args
  async def unload(*args):return True
  self.hass.http=types.SimpleNamespace(async_register_static_paths=static);self.hass.config_entries=types.SimpleNamespace(async_forward_entry_setups=forward,async_unload_platforms=unload,async_entries=lambda domain:[{}]);self.entry=types.SimpleNamespace(entry_id='entry')
 async def test_setup_and_unload(self):
  self.assertTrue(await integration.async_setup(self.hass,{}));self.assertTrue(await integration.async_setup_entry(self.hass,self.entry));self.assertEqual(self.hass.panel['webcomponent_name'],'aurelvi-studio');self.assertTrue(self.hass.panel['require_admin']);self.assertTrue(await integration.async_unload_entry(self.hass,self.entry));self.assertIn('aurelvi',self.hass.removed)
 async def test_websocket_config_operations(self):
  await integration.async_setup(self.hass,{});await integration.async_setup_entry(self.hass,self.entry);c=Connection();await integration.ws_command(self.hass,c,{'id':1,'action':'add','panel_id':'room','data':{'name':'Room'}});self.assertTrue(c.results);await integration.ws_command(self.hass,c,{'id':2,'action':'save','panel_id':'room','data':{'config':{'pages':[ad.fan_page()]},'device':{},'revision':0}});self.assertEqual(c.results[-1][1]['revision'],1);await integration.async_unload_entry(self.hass,self.entry)
 async def test_reject_unknown_command(self):
  await integration.async_setup(self.hass,{});await integration.async_setup_entry(self.hass,self.entry);c=Connection();await integration.ws_command(self.hass,c,{'id':1,'action':'command','panel_id':'room','data':{'name':'arbitrary_install'}});self.assertEqual(c.errors[0][1],'invalid_request');await integration.async_unload_entry(self.hass,self.entry)
 async def test_flow_reuses_existing_mqtt(self):
  f=flow.AurelviConfigFlow();f.hass=self.hass;f.existing=[];self.assertEqual((await f.async_step_user())['type'],'form');self.assertEqual((await f.async_step_user({}))['type'],'create_entry');self.assertEqual(f.unique,'aurelvi')
 async def test_flow_mqtt_required(self):
  f=flow.AurelviConfigFlow();f.hass=self.hass;f.existing=[];self.hass.config_entries.async_entries=lambda domain:[];self.assertEqual((await f.async_step_user({}))['errors']['base'],'mqtt_missing')
 async def test_flow_single_hub(self):
  f=flow.AurelviConfigFlow();f.hass=self.hass;f.existing=[{}];self.assertEqual((await f.async_step_user())['reason'],'single_instance_allowed')
if __name__=='__main__':unittest.main(verbosity=2)
