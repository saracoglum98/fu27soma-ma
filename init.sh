# Preparation
DEBIAN_FRONTEND=noninteractive

# install JDK
apt install openjdk-21-jdk

# install anaconda
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh
bash Miniconda3-latest-Linux-x86_64.sh
source ~/.bashrc

# accept TOS
conda tos accept --override-channels --channel https://repo.anaconda.com/pkgs/main
conda tos accept --override-channels --channel https://repo.anaconda.com/pkgs/r
conda install -c conda-forge nodejs

# git clone the repo
git clone https://github.com/Systems-Modeling/SysML-v2-Release.git
cd SysML-v2-Release/install/jupyter
chmod +x install.sh
./install.sh

curl -fsSL get.docker.com | bash