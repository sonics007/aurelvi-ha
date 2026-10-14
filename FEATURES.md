# Feature review for 0.3.4

Reviewed the public [DomoDreams integration](https://github.com/domodreams/home-assistant-nspanel-pro), [feature overview](https://nspanel.domodreams.it/features.html), [gallery](https://nspanel.domodreams.it/gallery.html), and the supplied Studio screenshot on 2026-10-14.

| Area | Aurelvi status |
|---|---|
| Grid editor, live preview, entity selectors and page ordering | Available |
| Device/Notify/Advanced screenshot sections | Detailed device controls, full notification form, JSON editor added |
| Automatic room setup | Aurelvi addition: area-based draft builder, capability-aware fan page |
| Theme, default page and inactivity return | Available |
| Text size, label offset and icon size from the screenshot | Added in 0.3.2 |
| Screensaver, night schedule, sensor brightness and wake on proximity | Available when Android exposes the sensors |
| Panel screenshots, diagnostics, rename, backup and restore | Available |
| Clock alarm editor | Fixed in APK 0.3.2: dedicated dialog instead of application settings |
| Cover rocker | Added open/stop/close routing in 0.3.2 |
| Standard HA notification entity and notification status events | Added in 0.3.2 |
| Illuminance sensor | Added in 0.3.2, dependent on panel telemetry |
| Fan with light and six configurable speeds | Available, including state-confirmed feedback |
| Weather | Current weather and daily forecast; hourly selection not implemented |
| Camera | MJPEG page and bound PTZ actions; no dedicated HA camera entity for the panel screen |
| Music Assistant | Native media controls and player integration; Sendspin remains experimental |
| Siren | APK alarm sound support; no dedicated HA siren entity or verified audio-priority parity |
| Visual skins | 80 original palettes and CSS materials; visible selection gallery |
| Wallpapers | Five procedural backgrounds plus custom image upload and dimming |
| Alarm tones | Four choices, preview, volume and fade-in in APK 0.3.4 |
| Licensing/unlock UI | Not applicable to Aurelvi |

This is a scoped comparison, not a claim of complete feature parity. DomoDreams integration code is MIT-licensed; its APK, branding and screenshots have separate proprietary terms. This release uses Aurelvi's own rendering and assets. Preview and protocol tests do not replace a test on an actual NSPanel Pro and Home Assistant installation.

0.3.7 adds tagged room generation/removal, complete selectable area entity inventories, paired control plates, six new material collections and native offline licence verification preparation. Website pricing is a proposal and checkout remains disabled.
