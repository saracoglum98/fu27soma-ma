apt update -y
apt upgrade -y
apt install -y npm fuse3 libfuse2 libatk1.0-0 libatk-bridge2.0-0 libcairo2 libgtk-3-0 libx11-6 libnss3 libasound2-dev libasound2t64 libcups2 xauth xvfb xfce4 xfce4-goodies
# veya
apt install -y 

wget https://installers.lmstudio.ai/linux/x64/0.3.20-4/LM-Studio-0.3.20-4-x64.AppImage -O lms.AppImage
chmod +x lms.AppImage
nohup xvfb-run ./lms.AppImage --no-sandbox > /dev/null 2>&1 < /dev/null &
# veya
nohup xvfb-run ./lms.AppImage > /dev/null 2>&1 < /dev/null &

echo -e "y\ny\ny" | npx --yes lmstudio install-cli

# Source bashrc to load lms into PATH and then execute lms commands in same shell
sleep 5  # Give server time to start
source ~/.bashrc && lms load nomic-ai/nomic-embed-text-v1.5-GGUF/nomic-embed-text-v1.5.Q4_K_M.gguf --identifier test
sleep 5  # Give server time to start
source ~/.bashrc && lms server start &


