"""Standard HA notify entity for each paired Aurelvi panel."""
from homeassistant.components.notify import NotifyEntity, NotifyEntityFeature
from .entity import AurelviEntity,add_dynamic

class PanelNotify(AurelviEntity,NotifyEntity):
    _attr_supported_features=NotifyEntityFeature.TITLE
    def __init__(self,h,p):super().__init__(h,p,'notification','Notification')
    async def async_send_message(self,message,title=None):
        data={'message':message}
        if title is not None:data['title']=title
        await self.hub.notify(self.pid,data)

async def async_setup_entry(hass,entry,async_add_entities):
    await add_dynamic(hass,entry,async_add_entities,lambda h,p:[PanelNotify(h,p)])
