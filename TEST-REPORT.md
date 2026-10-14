
## 0.3.2 validation — 2026-10-14

130 checks passed across bridge (35), settings/migration (12), lifecycle (6), health (10), Studio (19), Aurelvi renderer (16), general feature renderer (18), and MQTT protocol (14).

Coverage includes snapshot adoption, no empty-layout push on first pairing, Studio revision protection, repeat snapshots not resetting the panel, secret rejection, English fallback/Slovak switching, all 32 skin definitions, dedicated midnight alarm editing, cover commands, notification status events, clock settings, notification/JSON drafts, and the area-based room builder.

APK 0.3.2 / versionCode 6 compiled with pinned official Android tools. Signature verification passed and the certificate matches APK 0.3.0. Packaged assets match source files byte-for-byte. No live panel or actual HA instance was available. Browser visual QA could not run because the browser download was invalid; DOM and protocol tests do not establish visual correctness on hardware. Native TTS/sensor functionality requires device testing.

## 0.3.4 validation — 2026-10-14

Bridge 35, lifecycle 6, health 10, settings/migration 13, Studio 20, APK UI 18, general feature UI 18, and alarm-tone policy 10 checks passed (130 checks). Rebuilt APK and verified unchanged signing certificate and byte-identical packaged source/audio assets.

Chromium browser QA rendered the new three-column Studio workspace, opened the room wizard, uploaded a custom image and verified it appeared in the iframe preview. No browser script errors were reported. The visual screenshot was reviewed. Native playback/fade-in and hardware volume remain to be verified on an actual panel.

## 0.3.5 validation — 2026-10-14

11 ADB tests cover private key creation/persistence, local endpoint validation, text injection rejection, transport closure, alternate launcher resolution, successful and failed install, checksum failure, unknown operations and concurrency. DOM tests cover setup before pairing, busy installation, changed targets, failure recovery and Slovak localization. Existing bridge 35, lifecycle 6, health 10, settings 13 and Studio 20 checks pass. ADB uses the real adb-shell 0.4.4 key generator/signer with a fake device transport. Live authorization, Android package installation and OEM launcher commands require a real panel; no access to the user's network is available.

Chromium visual QA opened the ADB dialog before first pairing, entered a panel IP, completed a mocked connection and rendered the enabled controls without script errors. Screenshot reviewed at desktop size.

## 0.3.7 verification

Bridge 36, lifecycle 6, health 10, settings 13, nullable state projection 8 and ADB transport 11 checks passed. Studio 20 checks plus room-registry/pairing/rebuild/removal/undo and ADB UI scenarios passed. APK UI 18 and feature UI 18 checks passed. Native RSA signature tests and 10 claim scenarios passed, including wrong panel, expiry, future clock and scoped products. Seven billing tests cover payment status, refunds, disputes, amount allowlists, annual expiry and skin/pack isolation.

Chromium rendered all 80 app skins. Desktop/mobile website tests checked the dark mode, 80-skin gallery, collection filtering/search, persisted Slovak locale, disabled commerce and no horizontal overflow; final screenshots were reviewed. APK 0.3.7 versionCode 9 rebuilt with the same signing certificate as 0.3.4, with packaged assets matching source and no private issuer key present.

No live access to the user's HA/panel was available. Physical sensor/audio behavior and OEM ADB commands still need device testing. Payments remain disabled: merchant onboarding, server deployment, renewal/restore, cancellation management and commercial enforcement are not live. All 80 skins are open preview; existing controls remain free.
