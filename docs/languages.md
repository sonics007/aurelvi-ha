# European languages

26 offline **core UI** packs: English, Slovak, Bulgarian, Czech, Danish, German, Greek, Spanish, Estonian, Finnish, French, Irish, Croatian, Hungarian, Italian, Lithuanian, Latvian, Maltese, Dutch, Polish, Portuguese, Romanian, Slovenian, Swedish, Norwegian Bokmål and Ukrainian.

The website has a persistent language selector. Studio follows the Home Assistant locale. The panel has a local Interface language selector in Settings; its choice persists on that panel. Regional locales resolve to the base language, and unsupported languages fall back to English.

Coverage is deliberately explicit: each pack translates 40 shared core labels. Existing English/Slovak descriptions remain available. Most advanced prose, diagnostic messages and intercom setup instructions currently use English fallback in the additional languages. These are not complete, professionally reviewed translations of every screen.

All texts live in `locale/<code>.json` (master `locale/sk.json`, see LOCALIZATION.md); `tools/build_locales.py` generates the bundled `i18n.js` and the other runtime files. HA translation JSON files preserve the English fallback text for untranslated entries. No translation server is contacted at runtime. Device/entity names, SIP addresses, user labels and technical values are not translated.
