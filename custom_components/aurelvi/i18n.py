"""Backend message keys. Studio and the panel translate them with locale/<code>.json (see LOCALIZATION.md)."""
import json
from pathlib import Path
import re

LOCALE_DIR = Path(__file__).parent / "frontend" / "locale"
PLACEHOLDER = re.compile(r"\{([a-zA-Z0-9_]+)\}")
_STRINGS = {}


def msg(key, **params):
    """Encode a translatable message: 'backend.key' or 'backend.key|{"name":"value"}'."""
    if not params:
        return key
    return key + "|" + json.dumps({k: str(v) for k, v in params.items()}, ensure_ascii=False, separators=(",", ":"))


def _read(lang):
    try:
        return json.loads((LOCALE_DIR / f"{lang}.json").read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {}


def _read_all():
    return {path.stem: _read(path.stem) for path in sorted(LOCALE_DIR.glob("*.json"))}


async def async_preload(hass):
    """Read every locale file in the executor so plain() never does file I/O in the event loop."""
    if not _STRINGS:
        _STRINGS.update(await hass.async_add_executor_job(_read_all))


def language(code, fallback="en"):
    """Map 'sk-SK', 'no', 'de' ... to a shipped locale code."""
    code = str(code or "").replace("_", "-").split("-")[0].lower()
    if code == "no":
        code = "nb"
    if not _STRINGS:
        _STRINGS.update(_read_all())  # fallback only; async_preload normally filled the cache
    return code if code in _STRINGS else fallback


def plain(text, lang="en", _depth=0):
    """Render an encoded message as plain text (language lang, then English, then Slovak).

    Used for logs, Home Assistant exception placeholders and panels whose APK cannot translate keys.
    Parameters that are themselves encoded messages are rendered too. Unknown text is returned unchanged.
    """
    text = str(text)
    if not text.startswith("backend."):
        return text
    key, _, raw = text.partition("|")
    if not _STRINGS:
        _STRINGS.update(_read_all())
    template = next((_STRINGS.get(code, {}).get(key) for code in (lang, "en", "sk") if _STRINGS.get(code, {}).get(key)), None)
    if template is None:
        return text
    try:
        params = json.loads(raw) if raw else {}
    except ValueError:
        params = {}
    if not isinstance(params, dict):
        params = {}
    if _depth < 3:
        params = {name: plain(value, lang, _depth + 1) for name, value in params.items()}
    return PLACEHOLDER.sub(lambda m: str(params.get(m.group(1), m.group(0))), template)
