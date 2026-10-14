from homeassistant.components.media_player import MediaPlayerEntity,MediaPlayerEntityFeature,MediaPlayerState
from .entity import AurelviEntity,add_dynamic
class PanelSpeaker(AurelviEntity,MediaPlayerEntity):
    _attr_supported_features=MediaPlayerEntityFeature.PLAY_MEDIA|MediaPlayerEntityFeature.PLAY|MediaPlayerEntityFeature.PAUSE|MediaPlayerEntityFeature.STOP|MediaPlayerEntityFeature.VOLUME_SET|MediaPlayerEntityFeature.VOLUME_MUTE
    def __init__(self,h,p):super().__init__(h,p,'speaker','Reproduktor')
    @property
    def state(self):return {'playing':MediaPlayerState.PLAYING,'paused':MediaPlayerState.PAUSED,'buffering':MediaPlayerState.BUFFERING}.get(self.status.get('media',{}).get('state'),MediaPlayerState.IDLE)
    @property
    def volume_level(self):return self.status.get('media',{}).get('volume',1)
    @property
    def is_volume_muted(self):return self.status.get('media',{}).get('muted',False)
    @property
    def media_title(self):return self.status.get('media',{}).get('title')
    async def async_media_play(self):await self.hub.command(self.pid,'media',{'action':'resume'})
    async def async_media_pause(self):await self.hub.command(self.pid,'media',{'action':'pause'})
    async def async_media_stop(self):await self.hub.command(self.pid,'media',{'action':'stop'})
    async def async_set_volume_level(self,volume):await self.hub.command(self.pid,'media',{'action':'volume','volume':volume})
    async def async_mute_volume(self,mute):await self.hub.command(self.pid,'media',{'action':'mute','muted':mute})
    async def async_play_media(self,media_type,media_id,**kwargs):
        from homeassistant.components import media_source
        from homeassistant.components.media_player import async_process_play_media_url
        url=media_id
        if media_source.is_media_source_id(media_id):
            resolved=await media_source.async_resolve_media(self.hass,media_id,self.entity_id);url=resolved.url
        url=async_process_play_media_url(self.hass,url)
        await self.hub.command(self.pid,'media',{'action':'play','url':url,'title':kwargs.get('extra',{}).get('title','')})
async def async_setup_entry(hass,entry,async_add_entities):await add_dynamic(hass,entry,async_add_entities,lambda h,p:[PanelSpeaker(h,p)])
