from homeassistant.components import mqtt
from homeassistant.core import callback
from homeassistant.helpers.entity import Entity, DeviceInfo
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from .const import DOMAIN, SIGNAL

class AurelviEntity(Entity):
    _attr_should_poll=False
    _attr_has_entity_name=True
    def __init__(self,hub,pid,key,name):
        self.hub=hub;self.pid=pid;self._attr_unique_id=pid+'_'+key;self._attr_translation_key=key
        self._attr_device_info=DeviceInfo(identifiers={(DOMAIN,pid)})
    @property
    def available(self):return mqtt.is_connected(self.hass) and self.hub.status.get(self.pid,{}).get('online',False)
    @property
    def status(self):return self.hub.status.get(self.pid,{}).get('sys',{})
    @callback
    def _handle_signal(self,pid=None):
        if pid is None or pid==self.pid:self.async_write_ha_state()
    async def async_added_to_hass(self):
        self.async_on_remove(async_dispatcher_connect(self.hass,SIGNAL,self._handle_signal))

async def add_dynamic(hass,entry,async_add_entities,factory):
    added=set();hub=entry.runtime_data
    def discover(_pid=None):
        for pid,p in hub.panels.items():
            if p.get('paired') and pid not in added:
                added.add(pid);async_add_entities(factory(hub,pid))
    discover();entry.async_on_unload(async_dispatcher_connect(hass,SIGNAL,discover))
