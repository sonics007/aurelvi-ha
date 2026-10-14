# Aurelvi — Home Assistant integration

Verejná integrácia a Aurelvi Studio pre nástenné Android panely. APK a jeho zdroje sú samostatné projekty.

## Inštalácia

1. Z [najnovšieho vydania](https://github.com/sonics007/aurelvi-ha/releases/latest) stiahni `aurelvi.zip` a rozbaľ ho.
2. Skopíruj priečinok `aurelvi` do `/config/custom_components/aurelvi`. Názov priečinka zostáva rovnaký pri každej verzii; číslo verzie patrí do `manifest.json` a označenia vydania.

Pri stiahnutí cez Code → Download ZIP kopíruj vnútorný priečinok `custom_components/aurelvi`, nie celý obalový priečinok repozitára.

3. Reštartuj Home Assistant.
4. Nastavenia → Zariadenia a služby → Pridať integráciu → Aurelvi.
5. Otvor Aurelvi Studio v bočnom paneli a nastav entity a stránky.

Potrebuješ nakonfigurovanú integráciu MQTT. Android panel potrebuje pripojenie k rovnakému brokeru cez WebSocket a režim Aurelvi. Pri aktualizácii nahraď existujúci priečinok a reštartuj HA; integráciu nepridávaj druhýkrát. Skript `sh Install-HA.sh /config` vytvorí zálohu existujúceho priečinka a skopíruje integráciu.

Repozitár obsahuje `hacs.json` a štandardný priečinok `custom_components`. Možno ho pridať ako vlastný repozitár typu Integration v HACS; toto nie je zaradenie do predvoleného katalógu HACS.

## Funkcie

Studio, šesť rýchlostí ventilátora, ovládanie svetla, vlastné akcie, Cream/Night, časovače riadené HA, zálohy, diagnostika, kontrola pripojenia a entít, premenovanie panelov a opätovné odoslanie konfigurácie.

## APK

[Stiahnuť Aurelvi Panel](https://github.com/sonics007/aurelvi-apk/releases/latest). Aktuálne APK 0.3.0 je kompatibilné s integráciou 0.3.1. Android zdroje sú v súkromnom repozitári.

## Overenie

```sh
python3 tests/health.test.py
python3 tests/integration.test.py
python3 tests/lifecycle.test.py
npm install --no-save jsdom@26
node tests/studio.test.cjs
```

Testy používajú izolované adaptéry HA. Funkčnosť na skutočnom HA a NSPanel Pro ešte vyžaduje overenie. Prehľad pôvodných kontrol je v TEST-REPORT.md.

Licencie vlastného kódu sú v LICENSE a LICENSE-source; cudzie komponenty majú priložené licencie. Projekt je nezávislý od SONOFF, eWeLink a DomoDreams.
