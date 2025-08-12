FROM ubuntu:24.04
ENV DEBIAN_FRONTEND=noninteractive

RUN apt update -y && \
    apt install -y \
    openjdk-21-jdk \
    git \
    wget \
    ucommon-utils

# Install Miniconda
RUN wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh && \
    ln -s /usr/bin/md5sum /bin/md5 && \
    bash Miniconda3-latest-Linux-x86_64.sh -b -p /opt/conda && \
    rm Miniconda3-latest-Linux-x86_64.sh

# Add conda to path
ENV PATH=/opt/conda/bin:$PATH

COPY install.sh /install.sh
RUN chmod +x /install.sh && \
    /install.sh

EXPOSE 9999

CMD ["jupyter", "lab", "--allow-root", "--ip=0.0.0.0", "--NotebookApp.token=''","--NotebookApp.password=''","--port=9999"]