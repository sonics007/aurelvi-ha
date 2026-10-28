import re
from homeassistant.exceptions import HomeAssistantError
from homeassistant.components.update import UpdateEntity,UpdateEntityFeature
from .const import DOMAIN
from .entity import AurelviEntity,add_dynamic
class PanelUpdate(AurelviEntity,UpdateEntity):
    _attr_supported_features=UpdateEntityFeature.INSTALL|UpdateEntityFeature.RELEASE_NOTES
    _attr_title='Aurelvi Panel'
    def __init__(self,h,p):super().__init__(h,p,'update','Aktualizácia aplikácie')
    @property
    def installed_version(self):
        value=self.hub.status.get(self.pid,{}).get('info',{}).get('version','')
        match=re.search(r'\d+\.\d+\.\d+',value)
        return match.group(0) if match else None
    @property
    def latest_version(self):return self.hub.latest.get('version') or self.installed_version
    @property
    def release_url(self):return self.hub.latest.get('release_url')
    async def async_release_notes(self):return self.hub.latest.get('summary','')
    async def async_install(self,version=None,backup=False,**kwargs):
        if not self.hub.latest.get('url'):raise HomeAssistantError(translation_domain=DOMAIN,translation_key='github_not_configured')
        await self.hub.command(self.pid,'update',{'url':self.hub.latest['url']})
async def async_setup_entry(hass,entry,async_add_entities):await add_dynamic(hass,entry,async_add_entities,lambda h,p:[PanelUpdate(h,p)])
