"""Allowlisted application settings reported by a panel; never import credentials."""
import re
from .i18n import msg
from urllib.parse import urlsplit


def public_settings(raw):
    if not isinstance(raw, dict):
        return {}
    out = {}
    repo = raw.get('githubRepo')
    if isinstance(repo, str) and re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9-]{0,38}/[A-Za-z0-9_.-]{1,100}', repo):
        out['githubRepo'] = repo
    asset = raw.get('githubAsset')
    if isinstance(asset, str) and (not asset or re.fullmatch(r'[^/\\\x00-\x1f]{1,180}\.apk', asset, re.I)):
        out['githubAsset'] = asset
    if isinstance(raw.get('githubAutoCheck'), bool):
        out['githubAutoCheck'] = raw['githubAutoCheck']
    for key in ['haUrl', 'maUrl']:
        value = raw.get(key)
        if not isinstance(value, str) or len(value) > 512:
            continue
        try:
            u = urlsplit(value)
            if u.scheme in {'http', 'https'} and u.hostname and not (u.username or u.password or u.query or u.fragment):
                out[key] = value.rstrip('/')
        except ValueError:
            pass
    entity = raw.get('weatherEntity')
    if isinstance(entity, str) and re.fullmatch(r'weather\.[a-z0-9_]+', entity):
        out['weatherEntity'] = entity
    return out


def public_device(raw, page_count):
    from .models import validate_device
    if not isinstance(raw, dict):
        return {}
    keys = {'wallpaper','theme','defaultPage','inactivityTimeout','screensaver','nightMode','autoBrightness','motion','sysInfoIntervalS','clock','clockFace','clockFormat24h','clockTheme','clockAccent','clockLanguage','clockDateSize','screensaverTheme','proximity','labelSize','labelOffsetY','iconSize'}
    # Nested device values may contain arbitrary keys; drop sensitive names recursively.
    def clean(value):
        if isinstance(value, dict):
            return {k:clean(v) for k,v in value.items() if not any(s in k.lower() for s in ['token','password','secret','credential','username','url'])}
        if isinstance(value, list):
            return [clean(v) for v in value]
        return value
    return validate_device(clean({k:v for k,v in raw.items() if k in keys}), page_count)


def normalize_panel_config(raw):
    """Convert documented legacy action shorthands into explicit HA service bindings."""
    import copy
    from .models import validate_config
    doc = copy.deepcopy(raw)
    def binding(value, entity=None):
        if isinstance(value, list):
            return [binding(v, entity) for v in value]
        if isinstance(value, str):
            domain = value.split('.')[0]
            return {'service': domain + ('.press' if domain == 'button' else '.turn_on'), 'target': {'entity_id': value}}
        if not isinstance(value, dict):
            raise ValueError(msg('backend.settings.legacy_unsupported'))
        if value.get('service'):
            value.pop('action', None)
            return value
        kind = value.get('action')
        if kind == 'none':
            return {'noop': True}
        services = {'toggle': 'homeassistant.toggle', 'turn_on': 'homeassistant.turn_on', 'turn_off': 'homeassistant.turn_off', 'brightness': 'light.turn_on', 'scene': 'scene.turn_on', 'script': 'script.turn_on'}
        if kind not in services:
            raise ValueError(msg('backend.settings.legacy_unsupported_kind', kind=kind))
        target = value.get('entity_id') or entity
        if not target:
            raise ValueError(msg('backend.settings.legacy_no_target'))
        out = {'service': services[kind], 'target': {'entity_id': target}, 'data': value.get('data', {})}
        if kind == 'brightness':
            out['dynamic'] = 'brightness_pct'
        return out
    for page in doc.get('pages', []):
        for tile in page.get('tiles', []):
            entity = tile.get('entity') or tile.get('sentity')
            if entity and not tile.get('entity'):
                tile['entity'] = entity
            if 'bindings' in tile:
                tile['bindings'] = {k:binding(v, entity) for k,v in tile['bindings'].items()}
            if tile.get('type')=='button' and tile.get('bindings',{}).get('press') and tile.get('behavior') not in {'push','state'}:
                tile['bindings'].setdefault('toggle',copy.deepcopy(tile['bindings']['press']))
            if tile.get('behavior')=='press':tile['behavior']='push'
            for segment in tile.get('buttons', []):
                if 'bindings' in segment:
                    segment['bindings'] = {k:binding(v,segment.get('entity') or segment.get('sentity') or entity) for k,v in segment['bindings'].items()}
        for camera in page.get('camera', {}).get('cameras', []):
            if 'ptz' in camera:
                camera['ptz'] = {k:binding(v) for k,v in camera['ptz'].items()}
    return validate_config(doc)
