#!/bin/bash

clear

CONFIG_FILE="config.yaml"
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

tool_read_yaml() {
    local keys="$1"

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

layer_build() {
    local folder=$1
    cd "$SCRIPT_DIR/layers/$folder"
    echo -e "🚀 Building \t $folder"
    
    if [ "$folder" = "llm" ]; then
        deployment_type=$(cd "$SCRIPT_DIR" && tool_read_yaml "deployment.type")
        docker compose -f "docker-compose-${deployment_type}.yml" up -d --build --force-recreate > /dev/null 2>&1
    else
        docker compose up -d --build --force-recreate > /dev/null 2>&1
    fi
}

service_destroy() {
    local service=$1
    echo -e "💣 Destroying \t $service"
    service_stop $service > /dev/null 2>&1
    docker rm -f -v $service > /dev/null 2>&1
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

create_network() {
    echo -e "🌍 Creating network\n"
    docker network rm app-network > /dev/null 2>&1
    docker network create app-network > /dev/null 2>&1
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
    create_network
    layer_build "communication"
    layer_build "data"
    layer_build "llm"

    echo -e "\n🎉 All services are running\n"
    echo -e "🌐 Access the web app at http://localhost:3000\n"
fi

if [ "$1" = "start" ]; then
    service_start "communication-api"
    service_start "llm-inference"
    service_start "data-relational"
    service_start "data-non-relational"
    service_start "data-object"
    service_start "data-vector"

    echo -e "\n🎉 All services started\n"
fi

if [ "$1" = "stop" ]; then
    service_stop "communication-api"
    service_stop "llm-inference"
    service_stop "data-relational"
    service_stop "data-non-relational"
    service_stop "data-object"
    service_stop "data-vector"

    echo -e "\n🎉 All services stopped\n"
fi

if [ "$1" = "restart" ]; then
    service_restart "communication-api"
    service_restart "llm-inference"
    service_restart "data-relational"
    service_restart "data-non-relational"
    service_restart "data-object"
    service_restart "data-vector"

    echo -e "\n🎉 All services restarted\n"
fi

if [ "$1" = "destroy" ]; then
    service_destroy "communication-api"
    service_destroy "communication-webapp"
    service_destroy "llm-inference"
    service_destroy "data-relational"
    service_destroy "data-non-relational"
    service_destroy "data-object"
    service_destroy "data-vector"

    echo -e "\n🎉 All services destroyed\n"
fi

if [ "$1" = "read" ]; then
    test=$(tool_read_yaml "deployment.type")
    echo "Test: $test"
fi




