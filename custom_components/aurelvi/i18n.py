"""Backend message keys. Studio translates them with locale/<code>.json (see LOCALIZATION.md)."""
import json


def msg(key, **params):
    """Encode a translatable message: 'backend.key' or 'backend.key|{"name":"value"}'."""
    if not params:
        return key
    return key + "|" + json.dumps({k: str(v) for k, v in params.items()}, ensure_ascii=False, separators=(",", ":"))


_STRINGS = {}


def _read(lang):
    from pathlib import Path
    try:
        return json.loads((Path(__file__).parent / "frontend" / "locale" / f"{lang}.json").read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {}


async def async_preload(hass, lang="en"):
    """Read the locale file in the executor so plain() never does file I/O in the event loop."""
    if lang not in _STRINGS:
        _STRINGS[lang] = await hass.async_add_executor_job(_read, lang)


def plain(text, lang="en"):
    """Render an encoded message as plain text for logs and Home Assistant exception placeholders.

    Uses the generated frontend/locale/<lang>.json; anything unknown is returned unchanged.
    """
    text = str(text)
    if not text.startswith("backend."):
        return text
    key, _, raw = text.partition("|")
    if lang not in _STRINGS:
        _STRINGS[lang] = _read(lang)  # fallback only; async_preload normally filled the cache
    template = _STRINGS[lang].get(key)
    if template is None:
        return text
    try:
        params = json.loads(raw) if raw else {}
        return template.format(**params)
    except (ValueError, KeyError, IndexError, AttributeError):
        return text
