DEBIAN_FRONTEND=noninteractive

# General dependencies
sudo apt install -y yq curl ffmpeg uidmap zsh

# oh-my-zsh
echo "y\ny\n" | sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

# docker
curl -fsSL get.docker.com | bash
dockerd-rootless-setuptool.sh install

# uv package manager
curl -LsSf https://astral.sh/uv/install.sh | sh
source $HOME/.local/bin/env

# LM studio

cd -L
