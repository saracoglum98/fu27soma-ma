FROM ubuntu:22.04
ENV DEBIAN_FRONTEND=noninteractive

SHELL ["/bin/bash", "-lc"]
ENV NVM_DIR=/root/.nvm

# Install dependencies
RUN apt update && apt install -y \
    build-essential \
    fuse3 \
    libfuse2 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcairo2 \
    libgdk-pixbuf2.0-0 \
    libgtk-3-dev \
    libx11-6 \
    libnss3 \
    libasound2-dev \
    libasound2 \
    libcups2 \
    xauth \
    xvfb \
    xfce4 \
    xfce4-goodies \
    wget \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash \
    && source "$NVM_DIR/nvm.sh" \
    && nvm install 22 \
    && nvm alias default 22 \
    && nvm use default \
    && npm install -g lmstudio
#RUN npx lmstudio install-cli

# Download and setup LM Studio
WORKDIR /app
RUN wget https://installers.lmstudio.ai/linux/x64/0.3.20-4/LM-Studio-0.3.20-4-x64.AppImage -O lms.AppImage \
    && chmod +x lms.AppImage

RUN nohup xvfb-run ./lms.AppImage --no-sandbox &
# Install LM Studio CLI
RUN source "$NVM_DIR/nvm.sh" && npx lmstudio install-cli

CMD ["/bin/bash", "-c", "source $NVM_DIR/nvm.sh && source ~/.bashrc && lms server start"]
#RUN lms server start
#RUN lms load cortexso/small-thinker/smallthinker-3b-preview-q4_k_s.gguf --identifier test
