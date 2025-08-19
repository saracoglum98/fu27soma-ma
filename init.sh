# Initialize the environment
DEBIAN_FRONTEND=noninteractive
echo 'llm-se() { ~/fu27soma-ma/manage.sh "$@" ;}' >> ~/.bashrc


# General dependencies
sudo apt install -y yq curl ffmpeg uidmap zsh fuse libfuse2 libasound2t64 xvfb xauth npm

# oh-my-zsh
echo "y\ny\n" | sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

# docker
curl -fsSL get.docker.com | bash
dockerd-rootless-setuptool.sh install

# uv package manager
curl -LsSf https://astral.sh/uv/install.sh | sh
source $HOME/.local/bin/env

# LM studio
wget https://installers.lmstudio.ai/linux/x64/0.3.20-4/LM-Studio-0.3.20-4-x64.AppImage -O lms.AppImage
chmod +x lms.AppImage
nohup xvfb-run ./lms.AppImage > /dev/null 2>&1 < /dev/null &
echo -e "y\ny\ny" | npx --yes lmstudio install-cli

sudo reboot
