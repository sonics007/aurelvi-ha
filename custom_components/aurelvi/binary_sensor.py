from homeassistant.components import mqtt
from homeassistant.components.binary_sensor import BinarySensorEntity,BinarySensorDeviceClass
from .entity import AurelviEntity,add_dynamic

class PanelOnline(AurelviEntity,BinarySensorEntity):
    _attr_device_class=BinarySensorDeviceClass.CONNECTIVITY
    def __init__(self,h,p):super().__init__(h,p,'online','Pripojenie')
    @property
    def available(self):return True
    @property
    def is_on(self):return mqtt.is_connected(self.hass) and self.hub.status.get(self.pid,{}).get('online',False)
class PanelMotion(AurelviEntity,BinarySensorEntity):
    _attr_device_class=BinarySensorDeviceClass.MOTION
    def __init__(self,h,p):super().__init__(h,p,'motion','Pohyb')
    @property
    def available(self):return super().available and self.hub.status.get(self.pid,{}).get('info',{}).get('sensors',{}).get('hasProximity',False)
    @property
    def is_on(self):return self.status.get('motion',{}).get('motion',False)
async def async_setup_entry(hass,entry,async_add_entities):await add_dynamic(hass,entry,async_add_entities,lambda h,p:[PanelOnline(h,p),PanelMotion(h,p)])
