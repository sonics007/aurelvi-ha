# Validation — Aurelvi 0.3.11

- GitHub Chromium website checks passed on desktop and mobile: dark mode, gallery filtering, language selection, image dialogs and overflow checks.
- All 80 skins were rendered using the actual app frontend; gallery and Studio images were regenerated from those captures. Aluminium, oak and marble captures were visually inspected.
- Home Assistant bridge: 40 tests; state projection: 8; settings: 13; health: 10. Existing Studio checks: 20. Room, fan, ADB UI, locale, website-dialog and intercom regression suites passed.
- Android protocol: 14 checks; panel controls: 18; additional features: 18. SIP UI/signalling tests cover selecting one phone, busy rejection, explicit incoming acceptance, mute/hangup, microphone denial and local-only credential storage.
- Native Java and IntercomConfig validation compiled successfully. The APK was built for Android API 26+, signed with the existing certificate, and every packaged asset was compared with the final source assets.
- No private signing or licence issuer keys were uploaded to GitHub.
- Limits: no physical panel/phone call, mobile push delivery or SIP provider account was available for end-to-end testing. Intercom is a preview requiring a compatible provider and phone app.
- Language coverage: 26 offline core packs, 40 shared labels per pack; advanced untranslated copy uses English fallback.
