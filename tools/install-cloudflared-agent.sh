#!/usr/bin/env bash
set -euo pipefail

LABEL="com.doublejun.cloudflared.affine"
PLIST_PATH="$HOME/Library/LaunchAgents/${LABEL}.plist"
LOG_PATH="$HOME/Library/Logs/cloudflared-affine.log"
CONFIG_PATH="$HOME/.cloudflared/config.yml"
CLOUDFLARED_BIN="$(command -v cloudflared)"
UID_VALUE="$(id -u)"

if [[ -z "${CLOUDFLARED_BIN}" ]]; then
  echo "cloudflared command not found" >&2
  exit 1
fi

if [[ ! -f "${CONFIG_PATH}" ]]; then
  echo "cloudflared config not found: ${CONFIG_PATH}" >&2
  exit 1
fi

mkdir -p "$HOME/Library/LaunchAgents"
mkdir -p "$(dirname "$LOG_PATH")"

if command -v brew >/dev/null 2>&1; then
  brew services stop cloudflared >/dev/null 2>&1 || true
fi

launchctl bootout "gui/${UID_VALUE}" "$PLIST_PATH" >/dev/null 2>&1 || true
pkill -f 'cloudflared.*tunnel run affine' >/dev/null 2>&1 || true

cat >"$PLIST_PATH" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${LABEL}</string>
  <key>ProgramArguments</key>
  <array>
    <string>${CLOUDFLARED_BIN}</string>
    <string>--config</string>
    <string>${CONFIG_PATH}</string>
    <string>tunnel</string>
    <string>run</string>
    <string>affine</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>StandardOutPath</key>
  <string>${LOG_PATH}</string>
  <key>StandardErrorPath</key>
  <string>${LOG_PATH}</string>
  <key>WorkingDirectory</key>
  <string>${HOME}</string>
  <key>ProcessType</key>
  <string>Interactive</string>
</dict>
</plist>
PLIST

launchctl bootstrap "gui/${UID_VALUE}" "$PLIST_PATH"
launchctl enable "gui/${UID_VALUE}/${LABEL}" >/dev/null 2>&1 || true
launchctl kickstart -k "gui/${UID_VALUE}/${LABEL}"

echo "Installed and started ${LABEL}"
echo "plist: ${PLIST_PATH}"
echo "log:   ${LOG_PATH}"
