#!/bin/bash

clear

CONFIG_FILE="config.yaml"

DEBUG=false
DEPLOYMENT_TYPE="cpu"

tool_read_yaml() {
    local keys="$1"

    # Check if yq is installed
    if ! command -v yq &> /dev/null; then
        echo "Error: yq is not installed" >&2
        echo "Please install yq first:" >&2
        echo "  For macOS: brew install yq" >&2
        echo "  For Linux: snap install yq" >&2
        return 1
    fi

    # Add leading dot for yq syntax
    local yq_path=".$keys"

    # Try to read the YAML file with the path
    if ! value=$(yq eval "$yq_path" "$CONFIG_FILE" 2>/dev/null); then
        echo "Error: Failed to read YAML path: $yq_path" >&2
        return 1
    fi

    echo "$value"
}

tool_replace_inplace() {
    local file_path="$1"
    local search_string="$2"
    local replace_string="$3"

    # Silently perform the replacement using sed
    sed -i '' "s|${search_string}|${replace_string}|g" "$file_path" 2>/dev/null
}

service_build() {
    local folder=$1
    cd "$folder"
    echo -e "🚀 Building \t $folder"
    if [ "$DEBUG" = true ]; then
        docker compose down -v
        docker compose up -d --build
    else
        docker compose down -v > /dev/null 2>&1
        docker compose up -d --build > /dev/null 2>&1
    fi
    cd ..
}

service_destroy() {
    local service=$1
    echo -e "💣 Destroying \t $service"
    service_stop $service > /dev/null 2>&1
    docker rm $service > /dev/null 2>&1
}

service_start() {
    local service=$1
    echo -e "🏃 Starting \t $service"
    docker start $service > /dev/null 2>&1
}

service_stop() {
    local service=$1
    echo -e "🤚 Stopping \t $service"
    docker stop $service > /dev/null 2>&1
}

service_restart() {
    local service=$1
    echo -e "🔄 Restarting \t $service"
    docker restart $service > /dev/null 2>&1
}

init() {
    echo -e "\n🧹 Initializing services"
    cd init  > /dev/null 2>&1
    uv venv  > /dev/null 2>&1
    source .venv/bin/activate  > /dev/null 2>&1
    uv pip install -r requirements.txt  > /dev/null 2>&1
    python script.py  > /dev/null 2>&1
    deactivate  > /dev/null 2>&1
    rm -rf .venv  > /dev/null 2>&1
    cd ..  > /dev/null 2>&1
}

# Check if help argument is provided
if [ "$1" = "help" ]; then
    echo "Usage: ./manage.sh [command]"
    echo ""
    echo "Commands:"
    echo "  help       Show this help message"
    echo "  build      Build all services"
    echo "  start      Start all services"
    echo "  stop       Stop all services"
    echo "  restart    Restart all services"
    echo "  destroy    Destroy all services"
    exit 0
fi 

if [ "$1" = "build" ]; then
    service_build "communication-layer"
    service_build "data-layer"
    service_build "llm-layer"
    init

    echo -e "\n🎉 All services are running\n"
fi

if [ "$1" = "start" ]; then
    service_start "communication-layer-api"
    service_start "llm-layer-inference"
    service_start "data-layer-relational-storage"
    service_start "data-layer-non-relational-storage"
    service_start "data-layer-object-storage"
    service_start "data-layer-vector-storage"

    echo -e "\n🎉 All services started\n"
fi

if [ "$1" = "stop" ]; then
    service_stop "communication-layer-api"
    service_stop "llm-layer-inference"
    service_stop "data-layer-relational-storage"
    service_stop "data-layer-non-relational-storage"
    service_stop "data-layer-object-storage"
    service_stop "data-layer-vector-storage"

    echo -e "\n🎉 All services stopped\n"
fi

if [ "$1" = "restart" ]; then
    service_restart "communication-layer-api"
    service_restart "llm-layer-inference"
    service_restart "data-layer-relational-storage"
    service_restart "data-layer-non-relational-storage"
    service_restart "data-layer-object-storage"
    service_restart "data-layer-vector-storage"

    echo -e "\n🎉 All services restarted\n"
fi

if [ "$1" = "destroy" ]; then
    service_destroy "communication-layer-api"
    service_destroy "llm-layer-inference"
    service_destroy "data-layer-relational-storage"
    service_destroy "data-layer-non-relational-storage"
    service_destroy "data-layer-object-storage"
    service_destroy "data-layer-vector-storage"

    echo -e "\n🎉 All services destroyed\n"
fi

if [ "$1" = "read" ]; then
    tool_read_yaml "deployment.type"
fi




