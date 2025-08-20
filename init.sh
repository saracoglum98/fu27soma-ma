# Set non-interactive mode
DEBIAN_FRONTEND=noninteractive

# General dependencies
sudo apt install -y yq curl ffmpeg uidmap fuse libfuse2 libasound2t64 xvfb xauth npm

# docker
curl -fsSL get.docker.com | bash

# uv package manager
curl -LsSf https://astral.sh/uv/install.sh | sh
source $HOME/.local/bin/env

# LM studio
wget https://installers.lmstudio.ai/linux/x64/0.3.20-4/LM-Studio-0.3.20-4-x64.AppImage -O lms.AppImage
chmod +x lms.AppImage
nohup xvfb-run ./lms.AppImage --no-sandbox > /dev/null 2>&1 < /dev/null &
echo -e "y\ny\ny" | npx --yes lmstudio install-cli

# Final
echo 'llm-se() { ~/fu27soma-ma/manage.sh "$@" ;}' >> ~/.bashrc
echo 'export TERM=xterm' >> ~/.bashrc
