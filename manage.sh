#!/bin/bash

clear

CONFIG_FILE="config.yaml"
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

tool_read_yaml() {
    local keys="$1"

    # Add leading dot for yq syntax
    local yq_path=".$keys"

    # Try to read the YAML file with the path, using absolute path
    if ! value=$(yq eval "$yq_path" "$SCRIPT_DIR/$CONFIG_FILE" 2>/dev/null); then
        echo "Error: Failed to read YAML path: $yq_path" >&2
        return 1
    fi

    echo "$value"
}

get_output_redirect() {
    local debug_mode=$(tool_read_yaml "debug")
    if [ "$debug_mode" = "true" ]; then
        echo ""
    else
        echo "> /dev/null 2>&1"
    fi
}

tool_replace_inplace() {
    local file_path="$1"
    local search_string="$2"
    local replace_string="$3"

    # Silently perform the replacement using sed
    sed -i '' "s|${search_string}|${replace_string}|g" "$file_path" 2>/dev/null
}

tool_container_status() {
    local container_name=$1
    local container_status=$(docker ps -q --filter "name=$container_name")
    if [ -n "$container_status" ]; then
        echo -e "\033[32m🏃 RUNNING\033[0m"  # Green color
    else
        echo -e "\033[31m🤚 STOPPED\033[0m"  # Red color
    fi
}

layer_build() {
    local folder=$1
    cd "$SCRIPT_DIR/layers/$folder"
    echo -e "🚀 Building $folder"
    
    local redirect=$(get_output_redirect)
    
    if [ "$folder" = "llm" ]; then
        deployment_type=$(cd "$SCRIPT_DIR" && tool_read_yaml "deployment.type")
        eval "docker compose -f \"docker-compose-${deployment_type}.yml\" up -d --build --force-recreate $redirect"
    else
        eval "docker compose up -d --build --force-recreate $redirect"
    fi
    cd $SCRIPT_DIR
}

service_destroy() {
    local service=$1
    local redirect=$(get_output_redirect)
    echo -e "💣 Destroying $service"
    eval "service_stop $service $redirect"
    eval "docker rm -f -v $service $redirect"
}

service_start() {
    local service=$1
    local redirect=$(get_output_redirect)
    echo -e "🏃 Starting $service"
    eval "docker start $service $redirect"
}

service_stop() {
    local service=$1
    local redirect=$(get_output_redirect)
    echo -e "🤚 Stopping $service"
    eval "docker stop $service $redirect"
}

service_restart() {
    local service=$1
    local redirect=$(get_output_redirect)
    echo -e "🔄 Restarting $service"
    eval "docker restart $service $redirect"
}

create_network() {
    local redirect=$(get_output_redirect)
    echo -e "🌍 Creating network\n"
    eval "docker network rm app-network $redirect"
    eval "docker network create app-network $redirect"
    cd $SCRIPT_DIR
}

init() {
    local redirect=$(get_output_redirect)
    echo -e "\n💨 Initializing services\n"
    cd scripts/init
    eval "uv venv $redirect"
    source .venv/bin/activate
    eval "uv pip install -r requirements.txt $redirect"
    eval "python script.py $redirect"
    deactivate
    rm -rf .venv
    cd $SCRIPT_DIR
}

env_create() {
    echo -e "🛠️  Setting environment variables\n"
    cp .env layers/communication/.env
    cp .env layers/knowledge/.env
    cp .env layers/llm/.env
    cp .env layers/management/.env
    cp .env scripts/init/.env
    cp .env scripts/seed/.env
    cd $SCRIPT_DIR
}

clear() {
    echo -e "🧹 Clearing build related files\n"
    rm -rf layers/communication/.env
    rm -rf layers/knowledge/.env
    rm -rf layers/llm/.env
    rm -rf layers/management/.env
    rm -rf scripts/init/.env
    rm -rf scripts/seed/.env
    cd $SCRIPT_DIR
}

seed() {
    echo -e "🌱 Seeding sample knowledge\n"
    cd scripts/seed  > /dev/null 2>&1
    uv venv  > /dev/null 2>&1
    source .venv/bin/activate  > /dev/null 2>&1
    uv pip install -r requirements.txt  > /dev/null 2>&1
    python script.py  > /dev/null 2>&1
    deactivate  > /dev/null 2>&1
    rm -rf .venv  > /dev/null 2>&1
    cd $SCRIPT_DIR
}

# Check if help argument is provided
if [ "$1" = "help" ]; then
    echo "Usage: ./manage.sh [command]"
    echo ""
    echo "Commands:"
    echo "  help            Show this help message"
    echo "  build           Build all services"
    echo "  build --seed    Build all services and seed sample knowledge"
    echo "  start           Start all services"
    echo "  stop            Stop all services"
    echo "  restart         Restart all services"
    echo "  status          Show the status of all services"
    echo "  destroy         Destroy all services"
    exit 0
fi 

if [ "$1" = "status" ]; then
    echo -e "API \t\t\t\t$(tool_container_status "communication-api")"
    echo -e "Web App \t\t\t$(tool_container_status "communication-webapp")"
    echo -e "LLM Inference Engine \t\t$(tool_container_status "llm-inference")"
    echo -e "Relational knowledge Storage \t$(tool_container_status "knowledge-relational")"
    echo -e "Object knowledge Storage \t\t$(tool_container_status "knowledge-object")"
    echo -e "Vector knowledge Storage \t\t$(tool_container_status "knowledge-vector")"
    echo -e "Management API \t\t\t$(tool_container_status "management-api")"
    exit 0
fi 

if [ "$1" = "build" ]; then
    redirect=$(get_output_redirect)
    echo -e "🪜  Preparing to build\n"
    eval "service_destroy \"communication-api\" $redirect"
    eval "service_destroy \"communication-webapp\" $redirect"
    eval "service_destroy \"llm-inference\" $redirect"
    eval "service_destroy \"knowledge-relational\" $redirect"
    eval "service_destroy \"knowledge-object\" $redirect"
    eval "service_destroy \"knowledge-vector\" $redirect"
    eval "service_destroy \"management-api\" $redirect"
    
    create_network
    env_create
    layer_build "knowledge"
    layer_build "llm"
    layer_build "communication"
    layer_build "management"
    init
    
    if [ "$2" = "--seed" ]; then
        seed
    fi
    
    clear
    echo -e "🎉 All services are running"
    echo -e "🌐 Access the web app at http://localhost:3000\n"
fi

if [ "$1" = "start" ]; then
    service_start "communication-api"
    service_start "communication-webapp"
    service_start "llm-inference"
    service_start "knowledge-relational"
    service_start "knowledge-object"
    service_start "knowledge-vector"
    service_start "management-api"
    echo -e "\n🎉 All services started\n"
fi

if [ "$1" = "stop" ]; then
    service_stop "communication-api"
    service_stop "communication-webapp"
    service_stop "llm-inference"
    service_stop "knowledge-relational"
    service_stop "knowledge-object"
    service_stop "knowledge-vector"
    service_stop "management-api"
    echo -e "\n🎉 All services stopped\n"
fi

if [ "$1" = "restart" ]; then
    service_restart "communication-api"
    service_restart "communication-webapp"
    service_restart "llm-inference"
    service_restart "knowledge-relational"
    service_restart "knowledge-object"
    service_restart "knowledge-vector"
    service_restart "management-api"
    echo -e "\n🎉 All services restarted\n"
fi

if [ "$1" = "destroy" ]; then
    service_destroy "communication-api"
    service_destroy "communication-webapp"
    service_destroy "llm-inference"
    service_destroy "knowledge-relational"
    service_destroy "knowledge-object"
    service_destroy "knowledge-vector"
    service_destroy "management-api"
    echo -e "\n🎉 All services destroyed\n"
fi

if [ "$1" = "read" ]; then
    test=$(tool_read_yaml "deployment.type")
    echo "Test: $test"
fi




