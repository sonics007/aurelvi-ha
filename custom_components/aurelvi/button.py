from homeassistant.components.button import ButtonEntity
from .entity import AurelviEntity,add_dynamic
class PanelButton(AurelviEntity,ButtonEntity):
    def __init__(self,h,p,cmd,name):super().__init__(h,p,cmd,name);self.cmd=cmd
    async def async_press(self):
        if self.cmd=='cancel_timer':await self.hub.cancel_timer(self.pid)
        else:await self.hub.command(self.pid,self.cmd)
class AdbRebootButton(AurelviEntity,ButtonEntity):
    """Reboots over ADB (LAN), so it stays usable while the panel is offline over MQTT."""
    def __init__(self,h,p):super().__init__(h,p,'adb_reboot','Reštartovať (ADB)')
    @property
    def available(self):
        from .adb import has_endpoint
        return has_endpoint(self.hub,self.pid)
    async def async_press(self):
        from .adb import async_service
        from homeassistant.exceptions import HomeAssistantError
        try:await async_service(self.hub,{'panel_id':self.pid,'operation':'reboot'})
        except ValueError as err:raise HomeAssistantError(str(err)) from err
async def async_setup_entry(hass,entry,async_add_entities):await add_dynamic(hass,entry,async_add_entities,lambda h,p:[PanelButton(h,p,'wake','Prebudiť'),PanelButton(h,p,'info','Obnoviť informácie'),PanelButton(h,p,'cancel_timer','Zrušiť časovač'),AdbRebootButton(h,p)])
