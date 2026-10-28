"""Backend message keys. Studio translates them with locale/<code>.json (see LOCALIZATION.md)."""
import json


def msg(key, **params):
    """Encode a translatable message: 'backend.key' or 'backend.key|{"name":"value"}'."""
    if not params:
        return key
    return key + "|" + json.dumps({k: str(v) for k, v in params.items()}, ensure_ascii=False, separators=(",", ":"))
