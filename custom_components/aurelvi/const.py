import json
from pathlib import Path

DOMAIN = "aurelvi"
VERSION = json.loads(Path(__file__).with_name("manifest.json").read_text(encoding="utf-8"))["version"]
PREFIX = "aurelvi/panel"
SIGNAL = "aurelvi_changed"
PLATFORMS = ["sensor", "binary_sensor", "button", "number", "switch", "media_player", "update", "notify"]
