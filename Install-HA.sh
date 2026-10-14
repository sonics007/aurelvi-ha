#!/bin/sh
# Run in Home Assistant's terminal after unpacking the complete bundle there.
set -eu
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
CONFIG_DIR=${1:-/config}
SOURCE="$SCRIPT_DIR/custom_components/aurelvi"
if [ ! -d "$CONFIG_DIR" ] || [ ! -f "$SOURCE/manifest.json" ]; then
 echo "Rozbaľ kompletný ZIP a spusti skript v termináli HA. Cieľ: $CONFIG_DIR"
 exit 1
fi
mkdir -p "$CONFIG_DIR/custom_components"
TARGET="$CONFIG_DIR/custom_components/aurelvi"
if [ -d "$TARGET" ]; then
 BACKUP="$CONFIG_DIR/aurelvi-backup-$(date +%Y%m%d-%H%M%S)"
 cp -R "$TARGET" "$BACKUP"
 echo "Záloha existujúcej integrácie: $BACKUP"
fi
mkdir -p "$TARGET"
cp -R "$SOURCE/." "$TARGET/"
echo "Aurelvi je skopírované. Reštartuj Home Assistant a pridaj integráciu Aurelvi."
