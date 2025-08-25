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
cd exec
./lms.AppImage --appimage-extract
mv squashfs-root/ lms/
rm -rf lms.AppImage
chmod +x lms/lm-studio
nohup xvfb-run -a ./lms/lm-studio --no-sandbox > /dev/null 2>&1 < /dev/null &
echo -e "y\ny\ny" | npx --yes lmstudio install-cli
export PATH="$PATH:/root/.lmstudio/bin"
lms server start
lms server stop
sed -i 's/127.0.0.1/0.0.0.0/g' /root/.lmstudio/.internal/http-server-config.json
sed -i 's/"enableLocalService": false/"enableLocalService": true/g' /root/.config/LM Studio/settings.json
#sed -i 's/old_string/new_string/g' filename
# change in place - config/LM Studio/settings.json
# change in place - /.lmstudio/.internal/http-server
#sleep 10

# Final
echo 'llm-se() { ~/fu27soma-ma/manage.sh "$@" ;}' >> ~/.zshrc
echo 'export TERM=xterm' >> ~/.zshrc
