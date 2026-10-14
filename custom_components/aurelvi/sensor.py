from homeassistant.components.sensor import SensorEntity
from .entity import AurelviEntity,add_dynamic

class PanelSensor(AurelviEntity,SensorEntity):
    def __init__(self,hub,pid,key,name,unit=None):
        super().__init__(hub,pid,key,name);self.key=key;self._attr_native_unit_of_measurement=unit
    @property
    def native_value(self):
        if self.key=='timer':
            import time
            timer=self.hub.timers.get(self.pid)
            return max(0,round(timer['deadline']-time.time())) if timer else 0
        return self.hub.status.get(self.pid,{}).get('info',{}).get(self.key)
    @property
    def extra_state_attributes(self):
        if self.key=='version':return {'ip':self.hub.status.get(self.pid,{}).get('info',{}).get('ip'),'last_seen':self.hub.status.get(self.pid,{}).get('lastSeen')}
        return None

async def async_setup_entry(hass,entry,async_add_entities):
    await add_dynamic(hass,entry,async_add_entities,lambda h,p:[PanelSensor(h,p,'version','Verzia'),PanelSensor(h,p,'rssi','Wi-Fi signál','dBm'),PanelSensor(h,p,'freeMemMB','Voľná pamäť','MB'),PanelSensor(h,p,'uptimeS','Čas od štartu','s'),PanelSensor(h,p,'timer','Časovač','s')])
