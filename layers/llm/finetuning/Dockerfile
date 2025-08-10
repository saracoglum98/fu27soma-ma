FROM ubuntu:24.04

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV JUPYTER_ENABLE_LAB=yes
ENV JUPYTER_PORT=8888

# Update package list and install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    curl \
    wget \
    git \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user
RUN useradd -m -s /bin/bash jupyter

# Set working directory
WORKDIR /home/jupyter

# Create virtual environment and install Jupyter Lab
RUN python3 -m venv venv && \
    . venv/bin/activate && \
    pip install --upgrade pip && \
    pip install jupyter jupyterlab notebook

# Create jupyter config directory
RUN mkdir -p /home/jupyter/.jupyter

# Generate Jupyter configuration
RUN . venv/bin/activate && \
    jupyter lab --generate-config

# Set permissions
RUN chown -R jupyter:jupyter /home/jupyter

# Switch to non-root user
USER jupyter

# Expose Jupyter Lab port
EXPOSE 6969

# Start Jupyter Lab
CMD ["/bin/bash", "-c", "source venv/bin/activate && jupyter lab --ip=0.0.0.0 --port=6969 --no-browser --allow-root --NotebookApp.token='' --NotebookApp.password=''"]
