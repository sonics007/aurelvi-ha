<p align="center"><img src="custom_components/aurelvi/brand/logo.png" alt="Aurelvi" width="384"></p>

# Aurelvi for Home Assistant

Local MQTT integration and Aurelvi Studio for Android wall panels. The interface follows your Home Assistant language: Slovak for `sk`, English for every other language. Android source code is maintained in a separate private repository.

## Install or update

1. Download **aurelvi.zip** from [the latest release](https://github.com/sonics007/aurelvi-ha/releases/latest).
2. Extract it and copy the **aurelvi** folder to **/config/custom_components/aurelvi**. Always keep this folder name; version numbers belong in the manifest and release tag.
3. Restart Home Assistant. For an update, keep the existing integration entry.
4. For a first installation, use Settings → Devices & services → Add integration → Aurelvi.
5. Open Aurelvi Studio in the sidebar.

MQTT must already be configured in Home Assistant. Connect the panel to the same broker using WebSockets and select **Aurelvi** mode. Local integration icons/logos require Home Assistant **2026.3 or newer**.

HACS: add `https://github.com/sonics007/aurelvi-ha` as a custom repository of type **Integration**. This is not a listing in the default HACS catalog.

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

See [FEATURES.md](FEATURES.md) for the feature comparison and scope. The project is independent of SONOFF, eWeLink and DomoDreams. Own-code and third-party licenses are included in this repository.
