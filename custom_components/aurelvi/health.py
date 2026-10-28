"""Connection and entity checks; diagnostic exports contain only safe summaries."""
from __future__ import annotations
import time
from collections import Counter
from homeassistant.components import mqtt
from .const import VERSION
from .i18n import msg
from .models import entities


def panel_health(hub, pid):
    """Read current local state without sending commands or changing configuration."""
    panel = hub.panels[pid]
    status = hub.status.get(pid, {})
    connected = mqtt.is_connected(hub.hass)
    issues = []
    if not connected:
        issues.append({'code': 'mqtt_disconnected', 'level': 'error', 'message': msg('backend.health.mqtt_disconnected'), 'hint': msg('backend.health.mqtt_disconnected_hint')})
    if not panel.get('paired'):
        issues.append({'code': 'not_paired', 'level': 'warning', 'message': msg('backend.health.not_paired'), 'hint': msg('backend.health.not_paired_hint')})
    elif not status.get('online'):
        issues.append({'code': 'panel_offline', 'level': 'error', 'message': msg('backend.health.panel_offline'), 'hint': msg('backend.health.panel_offline_hint')})
    referenced = sorted(entities(panel.get('config', {})))
    missing, unavailable = [], []
    for entity in referenced:
        state = hub.hass.states.get(entity)
        if state is None:
            missing.append(entity)
        elif state.state in {'unavailable', 'unknown'}:
            unavailable.append(entity)
    for code, values, message in [('missing_entities', missing, msg('backend.health.missing_entities')), ('unavailable_entities', unavailable, msg('backend.health.unavailable_entities'))]:
        if values:
            issues.append({'code': code, 'level': 'warning', 'message': message, 'entities': values, 'hint': msg('backend.health.entities_hint')})
    return {'mqttConnected': connected, 'panelOnline': bool(status.get('online')), 'paired': bool(panel.get('paired')), 'lastSeen': status.get('lastSeen'), 'entityCount': len(referenced), 'missingCount': len(missing), 'unavailableCount': len(unavailable), 'ok': not issues, 'issues': issues}


def diagnostics(hub, pid=None):
    """Allowlist summary: omit names, identifiers, URLs, screenshots and custom data.

    Even action data and exception text may contain passwords or alarm PINs.
    Do not export raw configuration, telemetry, settings, history or log messages.
    """
    ids = [pid] if pid is not None and pid in hub.panels else ([] if pid is not None else list(hub.panels))
    reports = []
    for key in ids:
        p = hub.panels[key]
        health = panel_health(hub, key)
        info = hub.status.get(key, {}).get('info', {})
        last = health.get('lastSeen')
        counts = Counter(page.get('type', 'unknown') for page in p.get('config', {}).get('pages', []))
        types = {kind: count for kind, count in counts.items() if kind in {'fan', 'grid', 'clock', 'weather', 'camera', 'alarm', 'music'}}
        reports.append({'paired': health['paired'], 'online': health['panelOnline'], 'revision': p.get('revision', 0), 'pages': types, 'entity_count': health['entityCount'], 'missing_count': health['missingCount'], 'unavailable_count': health['unavailableCount'], 'issue_codes': [i['code'] for i in health['issues']], 'seconds_since_message': max(0, round(time.time()-last/1000)) if isinstance(last, (int, float)) else None, 'history_count': len(p.get('history', [])), 'timer_active': key in hub.timers, 'app_version': _version(info.get('version')), 'android_version': _version(info.get('android'))})
    return {'integration_version': VERSION, 'mqtt_connected': mqtt.is_connected(hub.hass), 'github_configured': bool(hub.settings.get('githubRepo')), 'panel_count': len(reports), 'panels': reports, 'log_counts': {level: sum(1 for row in hub.logs if row.get('level') == level and (pid is None or row.get('panel') == pid)) for level in ['info', 'warning', 'error']}}


def _version(value):
    import re
    match = re.fullmatch(r'(?:Aurelvi |OpenPanel )?(\d{1,3}(?:\.\d{1,3}){1,3})', str(value or ''))
    return match.group(1) if match else None
