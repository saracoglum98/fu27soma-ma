# fu27soma-ma

## 1. Preparation
Install Debian 13 on x86 based machine with a CUDA enabled NVIDIA GPU. Make sure to enable SSH server during the installation and note your username. Do not forget to replace **{USERNAME}** with the username that you have set during the installation.

SSH into the machine and add your user into the *sudoers* group by running the following code block:
```
su -l
adduser {USERNAME} sudo
exit
exit
```

To install the dependencies and prepare the OS, SSH into the machine again and run the following commands:
```
sudo apt update -y
sudo apt upgrade -y
sudo apt install -y git
git clone -b local --single-branch https://github.com/saracoglum98/fu27soma-ma.git
cd fu27soma-ma
chmod +x manage.sh
chmod +x init.sh
./init.sh
```

Add the your user to *docker* group: 
```
su -l
adduser {USERNAME} sudo
exit
```

Finally, reboot the machine using the command below. After the OS boots up, the host machine is ready for operation.
```
sudo reboot
```

## 2. Managing the Framework

The default configraution will use CPU only for LLM inference. If the host machine is a GPU enabled machine, you will have to edit the configuration file accordingly.  Using `nano config.yaml`, or another method, change the `type: cpu` to `type: gpu`. If you want to do LLM inference on CPU only, you can skip this step. If you want to do further configuration for each microservice, you can have a look at `.env` file and `Dockerfile` files for each layer under `layers` folder. However, this is not suggested unless you know what you are doing.

You can use the alias `llm-se` to manage the codebase. run `llm-se help` and you will see the available options.
```
Usage: llm-se [command]

Commands:
  help            Show this help message
  build           Build all services
  seed            Seed sample data
  start           Start all services
  stop            Stop all services
  restart         Restart all services
  status          Show the status of all services
  destroy         Destroy all services
```

## 3. Building

Run the command below to build the framework. The build process can take 5 to 30 minutes, depending on your host machine and internet connection.
```
./manage.sh build
```

In addition, if you want to seed sample data after the build, run:
```
./manage.sh build --seed
```