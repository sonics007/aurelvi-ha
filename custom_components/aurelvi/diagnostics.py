"""Standard HA diagnostics download for the hub and individual panels."""
from .const import DOMAIN
from .health import diagnostics

async def async_get_config_entry_diagnostics(hass, entry):
    return diagnostics(entry.runtime_data)

async def async_get_device_diagnostics(hass, entry, device):
    pid = next((identifier for domain, identifier in device.identifiers if domain == DOMAIN), None)
    if pid is None:
        return {'error': 'unknown_device'}
    return diagnostics(entry.runtime_data, pid)
