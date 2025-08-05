#wget https://repo.anaconda.com/miniconda/Miniconda3-latest-MacOSX-arm64.sh
#bash Miniconda3-latest-MacOSX-arm64.sh -b
#source ~/.bashrc
conda tos accept --override-channels --channel https://repo.anaconda.com/pkgs/main
conda tos accept --override-channels --channel https://repo.anaconda.com/pkgs/r

git clone https://github.com/Systems-Modeling/SysML-v2-Release.git
cd SysML-v2-Release/install/jupyter

sed -i 's/jupyter labextension/#jupyter labextension/g' install.sh

chmod +x install.sh
./install.sh

