FROM ubuntu:24.04
ENV DEBIAN_FRONTEND=noninteractive

SHELL ["/bin/bash", "-lc"]
ENV NVM_DIR=/root/.nvm

# Install dependencies
RUN apt update -y && apt install -y \
    npm \
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
    libcups2 \
    xauth \
    xvfb \
    xfce4 \
    xfce4-goodies \
    wget \
    curl \
    && rm -rf /var/lib/apt/lists/*

CMD ["npm", "i", "-g", "npx"]

# Download and setup LM Studio
COPY lms2.sh /install.sh
RUN chmod +x /install.sh && \
    /install.sh

CMD ["lms", "server", "start"]