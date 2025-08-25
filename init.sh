# Set non-interactive mode
DEBIAN_FRONTEND=noninteractive

# General dependencies
sudo apt install -y yq curl ffmpeg uidmap fuse libfuse2 libasound2t64 xvfb xauth npm libnspr4 libnss3 zsh

# docker
curl -fsSL get.docker.com | bash

# zsh
echo "y/ny/n" | sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
chsh -s $(which zsh)

# uv package manager
curl -LsSf https://astral.sh/uv/install.sh | sh

# LM studio
mkdir exec
wget https://installers.lmstudio.ai/linux/x64/0.3.20-4/LM-Studio-0.3.20-4-x64.AppImage -O exec/lms.AppImage
chmod +x exec/lms.AppImage
#./lms.AppImage --appimage-extract
#nohup xvfb-run -a ./exec/lms.AppImage --no-sandbox > /dev/null 2>&1 < /dev/null &
# change in place - config/LM Studio/settings.json
# change in place - /.lmstudio/.internal/http-server
#sleep 10
echo -e "y\ny\ny" | npx --yes lmstudio install-cli

# Final
echo 'llm-se() { ~/fu27soma-ma/manage.sh "$@" ;}' >> ~/.zshrc
echo 'export TERM=xterm' >> ~/.zshrc
