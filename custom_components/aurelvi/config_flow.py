from homeassistant import config_entries
from homeassistant.components import mqtt
import voluptuous as vol
from .const import DOMAIN

class AurelviConfigFlow(config_entries.ConfigFlow,domain=DOMAIN):
    VERSION=1
    async def async_step_user(self,user_input=None):
        errors={}
        if self._async_current_entries():return self.async_abort(reason='single_instance_allowed')
        if user_input is not None:
            if not self.hass.config_entries.async_entries('mqtt'):errors['base']='mqtt_missing'
            elif not mqtt.is_connected(self.hass):errors['base']='mqtt_disconnected'
            else:
                await self.async_set_unique_id(DOMAIN);self._abort_if_unique_id_configured()
                return self.async_create_entry(title='Aurelvi',data={})
        return self.async_show_form(step_id='user',data_schema=vol.Schema({}),errors=errors)
