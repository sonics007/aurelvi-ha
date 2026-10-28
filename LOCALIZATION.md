# Localization

All user-visible text lives in `locale/<code>.json`. **`locale/sk.json` is the master**: it contains every key. Other languages contain the same keys translated; a missing key falls back to English, then Slovak.

Never edit the generated files by hand. After changing `locale/`, run:

```
python3 tools/build_locales.py           # regenerate
python3 tools/build_locales.py --check   # CI: fail if generated files are stale
python3 tools/build_locales.py --strict  # also fail if a language misses keys
```

## Keys

Flat, dotted, lowercase snake case: `<area>.<section>.<name>`, e.g. `studio.adb.reboot`, `panel.fan.cancel_timer`.

| Prefix | Used by | Generated into |
|---|---|---|
| `language.name` | language picker | everywhere |
| `common.*` | shared short labels (Save, Cancel, …) | everywhere |
| `panel.*` | wall panel UI | `custom_components/aurelvi/frontend/i18n.js` (embedded, works offline) |
| `studio.*`, `backend.*` | Aurelvi Studio in HA, backend error messages shown in Studio | `custom_components/aurelvi/frontend/locale/<code>.json` (fetched by Studio) |
| `web.*` | public website | `website/assets/i18n.js` |
| `ha.*` | HA integration strings (entity names, config flow, services, exceptions) | `custom_components/aurelvi/translations/<code>.json`, `strings.json` |

`ha.*` keys mirror HA's nested translation format, e.g. `ha.entity.button.adb_reboot.name`.

## Placeholders

Use `{name}`: `"studio.panel.saved": "Uložené na panel {panel}"`. Every translation must keep exactly the same placeholders. Never build sentences by concatenating translated fragments.

## Runtime API (`window.AurelviI18n`)

- `t(key, vars?, lang?)` returns the text in the current language.
- `has(key)` checks whether a key exists.
- `load(baseUrl, lang)` returns a promise that fetches `<baseUrl>/<lang>.json` plus English and Slovak. Studio uses it with `/aurelvi-static/locale`.
- `setLanguage(code)`, `getLanguage()`, `normalize(code)`, `names`.
- `apply(root)` fills elements marked with `data-i18n="key"` and `data-i18n-attr="title=key;aria-label=key"`. The panel re-applies this automatically on DOM changes and language change.
- The `aurelvi-language-changed` event fires on `document` after a language switch.

## Backend messages

Python code raises `ValueError(msg("backend.some_key", panel="x"))` using `custom_components/aurelvi/i18n.py`. `msg()` encodes the message as `backend.some_key` or `backend.some_key|{"panel":"x"}`. Studio splits at the first `|`, parses the JSON parameters and shows `t(key, params)`. A message that is not a known key is shown unchanged.
