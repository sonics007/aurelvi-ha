# Aurelvi integrácia 0.3.1 / APK 0.3.0 — overenie 14. 10. 2026

Aktuálna sada má 152 kontrol (137 pôvodných + 15 nových).
Pre túto aktualizáciu boli znovu spustené dotknuté sady: 35 bridge + 6 lifecycle +
15 Studio + 10 diagnostika, spolu 66 úspešných kontrol. APK sa nemenilo.

Pôvodné a rozšírené sady:

| Oblasť | Počet | Čo kontroluje |
|---|---:|---|
| MQTT transport | 14 | Rámce, UTF-8, LWT, QoS 1, fragmenty, odbery, limity a odpojenie |
| Pôvodná kompatibilita UI | 12 | Potvrdené stavy, split, izolácia, retained príkazy, navigácia a chybné vstupy |
| Existujúce funkcie APK | 18 | Hodiny, kamera/PTZ, Alarmo, oznámenia, zvukový bridge, budík, počasie, senzory, dimmer |
| Referenčné integračné routovanie | 9 | Vybrané reálne metódy verejnej pôvodnej integrácie pre svetlo a ventilátor |
| Nový Aurelvi ovládač | 11 | 6 rýchlostí, čakanie na potvrdenie, negatívny ACK, slider jednotky, časovač, vlastné režimy, offline a update |
| Aurelvi Studio | 15 | Web component, entity, vlastné akcie, zmeny rýchlostí, undo, uloženie, témy, zálohy, presúvanie a stránky |
| Aurelvi bridge/validácia/updates | 35 | Skutočný nový bridge, HA služby, duplikáty, autorizované párovanie, revízie, história, persistentné časovače a GitHub |
| HA životný cyklus a config flow | 6 | Načítanie/vypnutie, Studio registrácia, MQTT požiadavka, jedna inštancia, websocket operácie |
| Natívne pravidlá GitHub vydaní | 22 | JVM vykonanie ReleasePolicy: repozitár, URL, asset a verzie |

Zostavenie: JDK 17 → D8/R8 8.3.37, AAPT2 8.3.2-10880808, android.jar API 27.
APK: sk.openpanel.nspanel, versionName 0.3.0, versionCode 5, minSdk 26, targetSdk 27.
RSA 2048/SHA-256 V1 podpis a ZIP integrita sú overené. Certifikát sa porovnáva
s predchádzajúcim 0.2.1 APK; všetky aktuálne assety musia zodpovedať obsahu APK.
Zvuky WAV sú uložené bez kompresie. Natívna ikona Aurelvi je vektorová.

Pribalené náhľady sa kontrolujú spustením ich JavaScriptu v jsdom. Nejde o pixelové
vykreslenie v Android WebView. Testy Studio nepoužívajú skutočný HA server.
Integračné testy používajú izolované HA adaptéry a služby; bridge, modely, config flow
a lifecycle kód sú skutočné projektové súbory. Nebežal celý Home Assistant OS.

Reprodukcia zo source (jsdom 24.1.3, voluptuous 0.15.2, jsonschema 4.23.0):

```sh
node android/tests/protocol.test.cjs
JSDOM_PATH=/path/to/node_modules/jsdom node android/tests/ui.test.cjs
JSDOM_PATH=/path/to/node_modules/jsdom node android/tests/features.test.cjs
python3 android/tests/integration.test.py
node tests/ui.test.cjs
node tests/studio.test.cjs
python3 tests/integration.test.py
python3 tests/lifecycle.test.py
```

Nové JS testy možno spustiť s JSDOM_PATH alebo s jsdom nainštalovaným lokálne.
JVM: skompiluj android/src/sk/openpanel/nspanel/ReleasePolicy.java a
android/tests/ReleasePolicyTest.java, potom spusti triedu ReleasePolicyTest.

API boli overované proti primárnej dokumentácii HA pre custom panels, websocket
API, config entries a async_register_static_paths; voči aktuálnym zdrojom MQTT,
media_player a panel_custom. Zdrojové referencie použité iba na kontrolu rozhraní
sa nezverejňujú ako súčasť vlastného kódu. Verejná pôvodná integračná referencia
v android/tests/upstream zachováva svoju pôvodnú licenciu.

## Čo vyžaduje fyzický test

NSPanel Pro Android WebView, reálne MQTT LXC a HA, konkrétne entity, streamy,
reproduktor/TTS, senzory, budík, autoštart ako Home a inštalačné potvrdenie Androidu.
Sendspin/Music Assistant je experimentálny. GitHub workflow je pripravený v kóde,
nebol spustený v žiadnom účte a release server nie je publikovaný.

Nová sada tests/health.test.py: 10 kontrol pripojenia, entít, diagnostiky a premenovania.
Oficiálne HA rozhranie diagnostiky: https://developers.home-assistant.io/docs/core/integration/diagnostics/
