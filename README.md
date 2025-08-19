# fu27soma-ma

After a clean installation of Ubuntu Server 24.04 LTS on a host machine or a virtual machine, SSH into it and run the following code block.

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

This code block will install dependencies, and prepare the operating system. 

The default configraution will use CPU only for LLM inference. If the host machine is a GPU enabled machine, you will have to edit the configuration file accordingly.  Using `nano config.yaml`, or another method, change the `type: cpu` to `type: gpu`. If you want to do LLM inference on CPU only, you can skip this step. If you want to do further configuration for each microservice, you can have a look at `.env` file and `Dockerfile` files for each layer under `layers` folder. However, this is not suggested unless you know what you are doing.

You can use `manage.sh` script to manage the codebase. run `./manage.sh help` and you will see the available options.
```
Usage: ./manage.sh [command]

Commands:
  help            Show this help message
  build           Build all services
  build --seed    Build all services and seed sample data
  start           Start all services
  stop            Stop all services
  restart         Restart all services
  status          Show the status of all services
  destroy         Destroy all services
```

Finally, run one of the following commands to build all services. This can take 5 to 30 minutes, depending on your host machine and internet connection.

If you want a clean build, run:
```
./manage.sh build
```
Alternatively, if you want to seed sample data after the build, run:
```
./manage.sh build --seed
```

The output of build command should look like this.
```
🪜  Preparing to build

🌍 Creating network

🛠️  Setting environment variables

🚀 Building knowledge
🚀 Building llm
🚀 Building communication

💨 Initializing services

🌱 Seeding sample knowledge

🧹 Clearing build related files

⌛️ Build took 14.67 minutes
🎉 All services are running
🌐 Access the web app at http://localhost:3000
```