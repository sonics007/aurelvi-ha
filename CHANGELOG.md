## Annual licensing model (prepared, sales disabled)

- Full EUR 34.90/year/panel and Page EUR 7.90/year/panel replace new lifetime/skin/pack sales.
- All features remain free; only the watermark changes after launch. Clock includes the screensaver.
- Multiple page tokens, paid annual refresh, cancellation portal and legacy-token compatibility.
- Preview remains unwatermarked. Stripe products, secrets and on-device release validation are still required.

# Changelog

## 0.3.14

- Studio and its language files are loaded with a content hash in the URL, so browsers never keep an old Studio after an update. Fixes untranslated `backend.…` messages (for example in the ADB dialog) when an outdated cached Studio met the 0.3.13 backend.

## 0.3.13

- All user-visible text moved to `locale/<code>.json` with named keys; `locale/sk.json` is the master (1002 keys). `tools/build_locales.py` generates the panel, Studio, website and Home Assistant translation files; CI checks they are current. See LOCALIZATION.md.
- Studio, the panel UI, backend messages, HA entities/services and the website are fully translated into all 26 languages (machine-translated; native review welcome).
- New `aurelvi.adb_command` service and **Reboot (ADB)** button, available even when the panel is offline over MQTT; the panel's ADB address is remembered. Example watchdog automation in `examples/panel-watchdog.yaml`.
- Fewer state writes and disk saves: per-panel entity cache, panel-scoped entity updates, delayed storage writes.
- Camera stream URLs with access tokens are no longer retained on the MQTT broker; unpaired panel auto-creation is capped at 10. Broker ACL guidance in `docs/security.md`.
- Rejected MQTT messages are logged as warnings; all Python tests run in CI; the version is read from `manifest.json`.
- Requires APK **0.3.14** for the translated panel UI (APK 0.3.13 was never published).

## 0.3.12

- Keep the intercom contact list compatible with older Android WebView engines by using established DOM removal APIs.

## 0.3.11

- Enlarge product images and skin previews in an accessible dialog, with Escape, close and focus return.
- Add eight bundled photorealistic material textures: brushed aluminium, titanium, carbon fibre, oak, walnut, Carrara marble, black marble and leather.
- Add an audio-only SIP/WebRTC intercom preview with up to 12 selectable contacts, one active call, explicit acceptance, mute and hangup. Requires a compatible calling provider; mobile locked-screen push is not supplied by this release.
- Store intercom credentials encrypted on the panel, outside HA/MQTT snapshots.
- Add 26 offline European core UI packs and language selection, with English fallback for untranslated advanced copy.
- Remove the old external-project namespace, selectors, links and reference test suite. Existing Aurelvi layouts remain supported.

## 0.3.10

- Keep wind-mode controls enabled when a fan is in manual speed mode with no active preset (`preset_mode: null`). Clear the active highlight while preserving available choices; disable controls only when the entity is unavailable.

## 0.3.9

- Discover every fan wind preset alongside manual percentage speeds instead of discarding presets.
- Generate confirmed-state controls for oscillation and linked light effects, including more than six modes.
- Include all select options in groups of four, and number/input_number readouts with bounded step adjustments for timers and other device settings.
- Keep physical device values authoritative; no optimistic mode highlighting. Existing APK 0.3.7 is supported.
- Update the integration, restart HA, rebuild the room draft and Save to panel to add the new controls. Disabled entities must first be enabled in HA.

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
