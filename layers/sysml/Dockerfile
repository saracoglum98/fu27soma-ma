FROM --platform=linux/arm64 ubuntu:22.04

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    git \
    openjdk-21-jdk \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Install Miniconda
RUN wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-aarch64.sh -O /tmp/miniconda.sh \
    && chmod +x /tmp/miniconda.sh \
    && /tmp/miniconda.sh -b -p /opt/conda \
    && rm /tmp/miniconda.sh

# Add conda to path
ENV PATH="/opt/conda/bin:${PATH}"

WORKDIR /app

RUN git clone https://github.com/Systems-Modeling/SysML-v2-Release.git .

RUN chmod +x install/jupyter/install.sh
RUN ./install.sh