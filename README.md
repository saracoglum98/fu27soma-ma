# fu27soma-ma

After a clean installation of Ubuntu Server 24.04 LTS on a host machine or a virtual machine, SSH into it and run the following code block.

```
apt update -y
apt upgrade -y
apt install git -y
apt install yq -y
# Docker installation
cd -L
git clone https://github.com/saracoglumert/fu27soma-pa.git
cd fu27soma-pa
chmod +x build.py
```

This code block will install dependencies, and prepare the operating system. 

If the host machine is a GPU enabled machine, you will have to edit the configuration file accordingly. Using `nano config.yaml`, change the `type:cpu` to `type:gpu`. If you want to do LLM inference on CPU only. You can skip this step. If you want to do further configuration for each microservice, you can have a look at `.env` files for each layer under `layers` folder. However, this is not suggested unless you know what you are doing.

You can use `manage.sh` script to manage the codebase:
```
./manage.sh help
Usage: ./manage.sh [command]

Commands:
  help       Show this help message
  build      Build all services
  start      Start all services
  stop       Stop all services
  restart    Restart all services
  destroy    Destroy all services
```

Finally, run the following command to build all services. This can take 5 to 30 minutes, depending on your host machine and internet connection.
```
./manage.sh build
```