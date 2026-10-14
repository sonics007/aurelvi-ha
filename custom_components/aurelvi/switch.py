from homeassistant.components.switch import SwitchEntity
from .entity import AurelviEntity,add_dynamic
class PanelScreen(AurelviEntity,SwitchEntity):
    def __init__(self,h,p):super().__init__(h,p,'screen','Obrazovka')
    @property
    def is_on(self):return self.status.get('awake',{}).get('awake',True)
    async def async_turn_on(self,**kwargs):await self.hub.command(self.pid,'wake')
    async def async_turn_off(self,**kwargs):await self.hub.command(self.pid,'screen',{'action':'off'})
async def async_setup_entry(hass,entry,async_add_entities):await add_dynamic(hass,entry,async_add_entities,lambda h,p:[PanelScreen(h,p)])
