
## 0.3.2 validation — 2026-10-14

130 checks passed across bridge (35), settings/migration (12), lifecycle (6), health (10), Studio (19), Aurelvi renderer (16), general feature renderer (18), and MQTT protocol (14).

Coverage includes snapshot adoption, no empty-layout push on first pairing, Studio revision protection, repeat snapshots not resetting the panel, secret rejection, English fallback/Slovak switching, all 32 skin definitions, dedicated midnight alarm editing, cover commands, notification status events, clock settings, notification/JSON drafts, and the area-based room builder.

APK 0.3.2 / versionCode 6 compiled with pinned official Android tools. Signature verification passed and the certificate matches APK 0.3.0. Packaged assets match source files byte-for-byte. No live panel or actual HA instance was available. Browser visual QA could not run because the browser download was invalid; DOM and protocol tests do not establish visual correctness on hardware. Native TTS/sensor functionality requires device testing.

## 0.3.4 validation — 2026-10-14

Bridge 35, lifecycle 6, health 10, settings/migration 13, Studio 20, APK UI 18, general feature UI 18, and alarm-tone policy 10 checks passed (130 checks). Rebuilt APK and verified unchanged signing certificate and byte-identical packaged source/audio assets.

Chromium browser QA rendered the new three-column Studio workspace, opened the room wizard, uploaded a custom image and verified it appeared in the iframe preview. No browser script errors were reported. The visual screenshot was reviewed. Native playback/fade-in and hardware volume remain to be verified on an actual panel.
