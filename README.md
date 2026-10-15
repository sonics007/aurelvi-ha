<p align="center"><img src="custom_components/aurelvi/brand/logo.png" alt="Aurelvi" width="384"></p>

# Aurelvi for Home Assistant

## Version 0.3.11

Enlarged website images, eight material textures, 26 European core UI packs and an audio-only SIP/WebRTC intercom preview. Use APK **0.3.11** for the new panel surfaces, local language selector and intercom. The intercom requires a compatible SIP/WSS service and phone app; locked-screen ringing additionally requires provider push support. No hosted calling service is included, and a real phone call still needs device verification.

Additional language packs currently cover core controls; advanced untranslated descriptions fall back to English.


Local MQTT integration and Aurelvi Studio for Android wall panels. Studio follows your Home Assistant language, with 26 core UI packs and English fallback for untranslated advanced descriptions. Android source code is maintained in a separate private repository.

## Install or update

1. Download **aurelvi.zip** from [the latest release](https://github.com/sonics007/aurelvi-ha/releases/latest).
2. Extract it and copy the **aurelvi** folder to **/config/custom_components/aurelvi**. Always keep this folder name; version numbers belong in the manifest and release tag.
3. Restart Home Assistant. For an update, keep the existing integration entry.
4. For a first installation, use Settings → Devices & services → Add integration → Aurelvi.
5. Open Aurelvi Studio in the sidebar.

MQTT must already be configured in Home Assistant. Connect the panel to the same broker using WebSockets and select **Aurelvi** mode. Local integration icons/logos require Home Assistant **2026.3 or newer**.

HACS: add `https://github.com/sonics007/aurelvi-ha` as a custom repository of type **Integration**. This is not a listing in the default HACS catalog.

## Version 0.3.10 — Fan and light settings

**Build room** now keeps every available fan wind preset (natural, breeze, sleep, etc.) alongside percentage speeds. It adds oscillation and linked light effect controls when those capabilities are exposed by Home Assistant. Related switches, selects and numeric entities in the selected room are included: every select option is available, and number settings have a confirmed value plus −/+ controls using the entity's current step and limits.

After updating, restart HA, refresh Studio, **Build room** again and **Save to panel**. Existing APK **0.3.7** works; no APK update is required. Only capabilities actually exposed by the device integration can be detected. Enable disabled entities in HA first, and select hidden settings in the room inventory if needed. Room generation changes the draft only; check its controls before saving.

## Version 0.3.8 — Older room layouts

Remove room also offers **Older / manually created pages**. Select the exact pages to remove when a layout predates room metadata. Nothing in the HA area/entity registries is removed. Room creation preserves unrelated empty/manual pages. Use with APK 0.3.7.

## Version 0.3.7 — Design atelier and room inventories

80 original skins include Art Deco ornamental frames, Hi-Fi rotary controls and a fan-output meter, Ceramic, Japandi, Glass and Neon. The gallery uses actual app captures and is also available on the [Aurelvi website](https://sonics007.github.io/aurelvi-ha/).

**Build room** now lists every entity assigned directly or through a device to the chosen HA area. Choose what to show, group two lights/switches on a shared plate, then review and save. Outdoor covers use their normal cover entity. Remaining domains are safe readouts when no dedicated widget is available. Rebuilding replaces generated drafts for the same room; **Remove room** removes those pages from the panel draft, with Undo, and never deletes HA areas or entities. Manually created unrelated pages remain.

Use APK **0.3.7** for new material treatments and the activation screen in Settings. The HA Manage tab can send a signed licence for native verification. No token is put in a retained MQTT config or a layout backup. Live purchases, renewal and cancellation are not enabled; all 80 skins remain available in open preview. Existing control features stay free.

## Version 0.3.5 — ADB setup / update

Open **Setup / Update** in the Studio header, including before the first panel is paired. Enter the panel's local IP address and ADB port (usually 5555), enable network debugging on Android, click **Connect / test ADB**, and accept the authorization prompt on the panel. Home Assistant must be able to reach this address.

Install the latest stable official Aurelvi APK, open Aurelvi, set it as Home, restore another installed Android launcher, wake/sleep, Back, Home, notifications, memory information, reboot, or send basic Latin text. ADB commands run directly from HA using `adb-shell`; no add-on or terminal is required. APK installation verifies GitHub's SHA-256 digest, preserves data (`pm install -r`) and opens Aurelvi afterwards. Android/OEM restrictions may reject a command; the output is shown in the dialog.

The RSA authorization key stays in HA's `.storage/aurelvi_adbkey`; it is not exposed in Studio, diagnostics or panel configuration. Only HA administrators can run these actions. Each action closes its ADB transport afterwards. **0.3.5 updates only the integration; APK 0.3.4 remains current.** Restart HA and check **Studio 0.3.5**; hard-refresh if needed.

## Version 0.3.4

Studio now has a left page list, central preview and right inspector. The **Build room** helper is shown prominently. **Appearance and wallpaper** includes 32 skin cards, five procedural backgrounds, no-wallpaper mode and a custom image upload. Images are resized in your browser and stored in your HA panel configuration, not uploaded to GitHub.

After updating the integration, restart HA and open **Aurelvi Studio** from the sidebar. Check **Studio 0.3.4** in its header. If the old editor remains, hard-refresh the browser.

APK 0.3.4 adds four alarm tones, preview, volume and optional fade-in. Its bird tone is an original Aurelvi recording generated in code, not an Apple audio asset.

## Version 0.3.2

- Local integration icons and light/dark logos, included directly in the integration.
- English default setup, service descriptions, entity names and Studio; Slovak translations follow HA language.
- Initial import of panel pages, display settings and public application settings. Requires **APK 0.3.2**. Credentials remain on the panel.
- Adding a panel waits for its settings snapshot instead of immediately overwriting it with an empty layout. Later Studio revisions remain authoritative.
- **Build room** wizard: generate a draft from a Home Assistant area, infer fan controls and link a light only when it shares the fan device. Review and save before publishing.
- Dedicated notification tab, advanced JSON draft editor and detailed clock/sensor controls.
- 32 original Aurelvi skins, with light/dark palettes and procedural material treatments.
- Label size, vertical label offset and icon size controls with preview.
- Cover rocker with open/stop/close controls; standard notification entity and illuminance sensor.
- `aurelvi_notification` events for `shown`, `dismissed`, `expired` and `action` status.

APK: [public signed releases](https://github.com/sonics007/aurelvi-apk/releases/latest).

## Moving from compatibility mode

Install APK 0.3.2 with `adb install -r` and keep the same device ID. In the panel settings, select **Aurelvi**, save and reconnect. Switching mode with the same ID now preserves the local layout cache. In Studio, add the discovered panel. Public GitHub settings seed empty HA update settings; existing HA choices and later Studio edits are preserved. Passwords, HA tokens, Music Assistant tokens and broker credentials are not imported.

If an older version has already overwritten a layout, restore a saved backup; the new snapshot cannot recreate data that no longer exists. Existing Studio revisions are never silently replaced by a panel snapshot.

## Validation

Run `tests/integration.test.py`, `tests/settings.test.py`, `tests/health.test.py` and `tests/lifecycle.test.py` with Python, plus `tests/studio.test.cjs` with Node and jsdom. These use isolated Home Assistant adapters; installation and behavior on real hardware still require verification.

See [FEATURES.md](FEATURES.md) for the feature comparison and scope. The project is independent of SONOFF and eWeLink. Own-code and third-party licenses are included in this repository.

Details: [Intercom setup](docs/intercom.md) · [Language coverage](docs/languages.md).
