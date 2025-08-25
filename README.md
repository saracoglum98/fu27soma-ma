# fu27soma-ma

## 1. Preparation
Suggested VM provider \t: Hetzner\n
Suggested SSH Client  \t: Kitty (Linux/MacOS) and MobaXterm (Windows)

Install Debian 13 on x86 based machine with a CUDA enabled NVIDIA GPU. Make sure to enable SSH server during the installation and run the following command blocks as *root* user.

To install the dependencies and prepare the OS, SSH into the machine again and run the following commands:
```
apt update -y
apt upgrade -y
apt install -y git
git clone https://github.com/saracoglum98/fu27soma-ma.git
cd fu27soma-ma
chmod +x manage.sh
chmod +x init.sh
./init.sh
```

Finally, reboot the machine using the command below. After the OS boots up, the host machine is ready for operation.
```
reboot
```

## 2. Managing the Framework

The default configraution will use CPU only for LLM inference. If the host machine is a GPU enabled machine, you will have to edit the configuration file accordingly.  Using `nano config.yaml`, or another method, change the `type: cpu` to `type: gpu`. If you want to do LLM inference on CPU only, you can skip this step. If you want to do further configuration for each microservice, you can have a look at `.env` file and `Dockerfile` files for each layer under `layers` folder. However, this is not suggested unless you know what you are doing.

You can use the alias `llm-se` to manage the codebase. Run `llm-se help` and you will see the available options.
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
llm-se build
```

In addition, if you want to seed sample data after the build, run:
```
llm-se seed
```
