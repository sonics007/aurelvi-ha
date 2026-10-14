from homeassistant.components.number import NumberEntity,NumberMode
from .entity import AurelviEntity,add_dynamic
class PanelBrightness(AurelviEntity,NumberEntity):
    _attr_native_min_value=5;_attr_native_max_value=100;_attr_native_step=1;_attr_native_unit_of_measurement='%';_attr_mode=NumberMode.SLIDER
    def __init__(self,h,p):super().__init__(h,p,'brightness','Jas displeja')
    @property
    def native_value(self):return self.status.get('screen',{}).get('brightness',1)*100
    async def async_set_native_value(self,value):await self.hub.command(self.pid,'screen',{'action':'dim','brightness':value/100})
async def async_setup_entry(hass,entry,async_add_entities):await add_dynamic(hass,entry,async_add_entities,lambda h,p:[PanelBrightness(h,p)])
