# fu27soma-ma

## 1. Preparation

### Requirements
- x86 or ARM based host device
- Minimum 16GB VRAM capable host machine
- Minimum ~40GB SSD space

### Constraints
- SysML v2 related functionalities are not available on ARM devices.

This framework offers two deployment types: **Development** and **Headless**.

- **Development deployment** is designed for power users who want to tinker with the framework using LM Studio's graphical user interface
- **Headless deployment** is designed for production use and public access

### 1.1 Development Deployment
This deployment type supports macOS operating system on x86 or ARM architecture.

Follow the instructions below to prepare your host device:
1. Download and install [LM Studio](https://www.lmstudio.ai/)
2. Download a compatible model from LM Studio repositories

**Suggested model:** `mradermacher/grok-3-reasoning-gemma3-12b-distilled-hf`

### 1.2 Headless Deployment
This deployment type supports Ubuntu 24.04 LTS operating system on x86 architecture.

Follow the instructions below to prepare your host machine:

1. SSH into the machine and run the following commands:
```
apt update -y
apt upgrade -y
apt install -y git
git clone https://github.com/saracoglum98/fu27soma-ma.git
cd fu27soma-ma
chmod +x manage.sh
chmod +x init.sh
./init.sh headless
```
2. Reboot the host machine
```
reboot
```

## 2. Managing the Framework

You can use the alias `llm-se` to manage the codebase. Run `llm-se help` to see the available options.
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

If you want to do further configuration for each microservice, you can examine the `.env` file and `Dockerfile` files for each layer under the `layers` folder. However, this is not recommended unless you know what you are doing.

## 3. Configuration
The `.env` file must be edited depending on the deployment type.

### 3.1 Development Deployment
```
NEXT_PUBLIC_HOST="localhost"
LMSTUDIO_HOST="host.docker.internal"
```
### 3.2 Headless Deployment
```
NEXT_PUBLIC_HOST="12.23.13.31"
LMSTUDIO_HOST="12.23.13.31"
```
## 4. Building
Run one of the following commands to build the framework. The build process can take 5 to 30 minutes, depending on your host machine and internet connection.

### 4.1 Development Deployment
```
llm-se build
```
### 4.2 Headless Deployment
```
llm-se build headless
```

After a successful build, you will see a message similar to the following.
```
🪜      Preparing to build

🌍      Creating network

🛠️      Setting environment variables

🚀      Building knowledge
🚀      Building llm
🚀      Building communication
🚀      Building management
🚀      Building sysml

💨      Initializing services

🧹      Clearing build related files

⌛️      Build took 1 minutes 21 seconds
🎉      All services are running
🌐      Access the application at http://localhost:3000
```

## 5. Import Sample Data
Run the following command to import sample data into the framework:
```
llm-se seed
```

## 6. Application
You can now access the application using:
- **Development deployment:** [http://localhost:3000](http://localhost:3000)
- **Headless deployment:** [http://{YOUR_IP}:3000](http://{YOUR_IP}:3000)