# fu27soma-ma

After a clean installation of Ubuntu Server 24.04 LTS on a host machine, SSH into it and run the following code block.

```
apt update -y
apt upgrade -y
apt install git -y
# Docker installation
cd -L
git clone https://github.com/saracoglumert/fu27soma-pa.git
cd fu27soma-pa
chmod +x build.py
```