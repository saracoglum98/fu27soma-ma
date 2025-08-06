FROM ubuntu:22.04
ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies
RUN apt update
RUN apt install build-essential -y
RUN apt install npm -y
RUN apt install fuse3 -y
RUN apt install libfuse2 -y
RUN apt install libatk1.0-0 -y
RUN apt install libatk-bridge2.0-0 -y
RUN apt install libcairo2 -y
RUN apt install libgdk-pixbuf2.0-0 -y
RUN apt install libgtk-3-dev -y
#RUN apt install libgtk-3.0-0 -y
RUN apt install libx11-6 -y
RUN apt install libnss3 -y
RUN apt install libasound2-dev -y
RUN apt install libasound2 -y
RUN apt install libcups2 -y
RUN apt install xauth -y
RUN apt install xvfb -y
RUN apt install xfce4 -y
RUN apt install xfce4-goodies -y
RUN apt install wget -y
RUN rm -rf /var/lib/apt/lists/*

# Download and setup LM Studio
WORKDIR /app
RUN wget https://installers.lmstudio.ai/linux/x64/0.3.20-4/LM-Studio-0.3.20-4-x64.AppImage -O lms.AppImage \
    && chmod +x lms.AppImage

RUN nohup xvfb-run ./lms.AppImage --no-sandbox &
# Install LM Studio CLI
RUN npx lmstudio install-cli
RUN source ~/.bashrc

RUN lms server start
RUN lms load cortexso/small-thinker/smallthinker-3b-preview-q4_k_s.gguf --identifier test
