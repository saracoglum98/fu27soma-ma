#!/bin/bash
set -euo pipefail

# Ensure nvm is available
export NVM_DIR="/root/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  source "$NVM_DIR/nvm.sh"
fi

# Start LM Studio AppImage headless so the CLI can talk to it
if ! pgrep -f "lms.AppImage" >/dev/null 2>&1; then
  echo "Starting LM Studio AppImage..."
  nohup xvfb-run /opt/lms/lms.AppImage --no-sandbox >/var/log/lms-appimage.log 2>&1 &
  
  # Wait a bit for the AppImage to start
  sleep 5
  
  # Wait for LM Studio to be ready (check if the process is running)
  for i in {1..30}; do
    if pgrep -f "lms.AppImage" >/dev/null 2>&1; then
      echo "LM Studio AppImage is running"
      break
    fi
    echo "Waiting for LM Studio to start... ($i/30)"
    sleep 2
  done
fi

exec "$@"


