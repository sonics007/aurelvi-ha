# Changelog

## 0.3.8

- Include older/manual pages in Remove room with an explicit checkbox selection; no page is guessed or removed automatically.
- Keep unrelated empty/manual pages when creating a room draft.
- Works with APK 0.3.7; no new APK is required for this editor refinement.

## 0.3.7

- Expand the catalogue to 80 original skins with six new Art Deco, Hi-Fi, Ceramic, Japandi, Glass and Neon collections. Show captured app previews in Studio.
- Add full room inventories using entity area overrides and device area inheritance. Supported controls, outdoor covers, readouts for all remaining entities and explicit selection are included.
- Pair two lights/switches on a shared plate. Track generated room pages, rebuild without duplicates, remove room drafts and undo changes without deleting HA areas/entities.
- Add administrator-only licence delivery and native RSA-SHA256 token application with panel/issuer/expiry/product checks. The catalogue remains open preview and live sales are disabled.
- Rework the website with a persistent dark/light switch, real panel images, collection filters/search and modular launch pricing.

## 0.3.6

- Fix integration startup and MQTT state updates when lights report `brightness: null`.
- Omit missing or invalid numeric readings, preserve zero brightness and clamp valid brightness to the supported range.
- Handle nullable Kelvin/mired color temperature, invalid numeric strings and non-finite readings without crashing.
- Add state projection and bridge startup regression tests with Python 3.13 CI validation.
- Existing ADB setup/update remains included; no APK update or configuration reset required.

## 0.3.5

- Add administrator-only direct TCP ADB setup/update to the Studio header and Manage tab.
- Install the latest stable official Aurelvi APK with size and SHA-256 validation, preserve app data and launch after installation.
- Set Aurelvi as Home or restore an installed alternate Android launcher.
- Add wake, sleep/power, navigation, notification shade, memory, reboot and safe basic text input.
- Persist the private RSA key in HA storage, serialize operations and close transports after each action.
- English default and Slovak UI; no APK update required.

## 0.3.4

- Rebuild Studio as a page sidebar, central preview and right inspector; show the loaded Studio version.
- Make Build room prominent and expose all 32 skins as selectable preview cards.
- Add five procedural wallpapers, no-wallpaper mode, local image upload and wallpaper dimming.
- Add real panel screenshot refresh beside the page list.
- Ship APK alarm tone controls in the preview: four choices, audition, volume and optional 30-second fade-in.
- Restore complete integration manifest metadata.

## 0.3.2

- Add bundled HA brand images and English/Slovak setup, entities, services and Studio.
- Import an initial panel snapshot and public GitHub/HA settings with APK 0.3.2. Keep credentials local and preserve later Studio revisions.
- Wait for an initial settings snapshot when pairing instead of pushing an empty default layout.
- Add 32 original Aurelvi skins, typography controls, independent clock/screensaver themes and clock language/date size.
- Add a dedicated alarm editor in APK, optional native TTS, detailed presence/light settings and night blanking.
- Add cover open/stop/close routing, illuminance sensor, standard notification entity and notification status events.
- Add full Notify and Advanced JSON tabs.
- Add Build room: generate an editable layout from HA area/entity/device registries without publishing before Save.

Native speech voices, sensor behavior, timing after reboot and real HA installation still require hardware verification.
