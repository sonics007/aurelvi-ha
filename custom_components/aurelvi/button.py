from homeassistant.components.button import ButtonEntity
from .entity import AurelviEntity,add_dynamic
class PanelButton(AurelviEntity,ButtonEntity):
    def __init__(self,h,p,cmd,name):super().__init__(h,p,cmd,name);self.cmd=cmd
    async def async_press(self):
        if self.cmd=='cancel_timer':await self.hub.cancel_timer(self.pid)
        else:await self.hub.command(self.pid,self.cmd)
async def async_setup_entry(hass,entry,async_add_entities):await add_dynamic(hass,entry,async_add_entities,lambda h,p:[PanelButton(h,p,'wake','Prebudiť'),PanelButton(h,p,'info','Obnoviť informácie'),PanelButton(h,p,'cancel_timer','Zrušiť časovač')])
