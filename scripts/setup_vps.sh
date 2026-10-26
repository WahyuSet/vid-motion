#!/usr/bin/env bash
# One-time setup on an Ubuntu/Debian VPS: system packages, a Python venv, and headless Chromium.
#   bash scripts/setup_vps.sh            core only (edge voice)
#   bash scripts/setup_vps.sh --extra    also Azure Speech + Whisper (for own recordings)
set -euo pipefail
cd "$(dirname "$0")/.."

SUDO=""
if [ "$(id -u)" -ne 0 ]; then SUDO="sudo"; fi

$SUDO apt-get update
$SUDO apt-get install -y python3 python3-venv python3-pip ffmpeg

python3 -m venv .venv
. .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
if [ "${1:-}" = "--extra" ]; then pip install -r requirements-extra.txt; fi

# Chromium plus the shared libraries it needs (uses apt, hence sudo)
$SUDO "$(command -v python)" -m playwright install-deps chromium
python -m playwright install chromium

echo
echo "Setup done. Try:"
echo "  .venv/bin/python build_video.py burung-listrik preview"
echo "  .venv/bin/python build_video.py burung-listrik workers=2"
