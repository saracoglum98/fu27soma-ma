#!/bin/zsh

CONFIG_FILE="config.yaml"
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Get the appropriate IP address based on the operating system
get_local_ip() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS - get local network IP
        LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
    else
        # Linux (VPS) - get public IP
        LOCAL_IP=$(hostname -I | awk '{print $1}')
    fi
    
    # Fallback if the above methods fail
    if [ -z "$LOCAL_IP" ]; then
        LOCAL_IP=$(curl -s ifconfig.me 2>/dev/null || echo "localhost")
    fi
}

get_local_ip

tool_read_yaml() {
    local keys="$1"

    # Check if yq is available
    if ! command -v yq >/dev/null 2>&1; then
        echo "Error: yq is not installed. Please install yq to use this script." >&2
        return 1
    fi

    # Check if config file exists
    if [ ! -f "$SCRIPT_DIR/$CONFIG_FILE" ]; then
        echo "Error: Config file $SCRIPT_DIR/$CONFIG_FILE not found" >&2
        return 1
    fi

    # Detect yq version and use appropriate syntax
    local yq_version=$(yq --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+' | head -1)
    local value=""
    
    # Check if this is the newer yq (v4+) which uses 'eval' syntax
    if [[ "$yq_version" =~ ^[4-9]\. ]] || [[ "$OSTYPE" == "darwin"* ]]; then
        # Newer yq syntax (macOS Homebrew yq)
        local yq_path=".$keys"
        if ! value=$(yq eval "$yq_path" "$SCRIPT_DIR/$CONFIG_FILE" 2>/dev/null); then
            echo "Error: Failed to read YAML path: $yq_path from $SCRIPT_DIR/$CONFIG_FILE" >&2
            echo "Available keys in config:" >&2
            yq eval 'keys' "$SCRIPT_DIR/$CONFIG_FILE" 2>/dev/null >&2 || echo "Could not read config file" >&2
            return 1
        fi
    else
        # Older yq syntax (Ubuntu apt yq)
        if ! value=$(yq r "$SCRIPT_DIR/$CONFIG_FILE" "$keys" 2>/dev/null); then
            echo "Error: Failed to read YAML path: $keys from $SCRIPT_DIR/$CONFIG_FILE" >&2
            echo "Available keys in config:" >&2
            yq r "$SCRIPT_DIR/$CONFIG_FILE" --printMode p '**' 2>/dev/null >&2 || echo "Could not read config file" >&2
            return 1
        fi
    fi

    # Check if the value is null
    if [ "$value" = "null" ]; then
        echo "Error: Key '$keys' not found in config file" >&2
        return 1
    fi

    echo "$value"
}

get_output_redirect() {
    local debug_mode=$(tool_read_yaml "debug" 2>/dev/null || echo "false")
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
    sed -i "s|${search_string}|${replace_string}|g" "$file_path" 2>/dev/null
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
    echo -e "🚀\tBuilding $folder"
    local redirect=$(get_output_redirect)
    eval "docker compose up -d --build --force-recreate $redirect"
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
    echo -e "🌍\tCreating network\n"
    eval "docker network inspect app-network --format='{{range .Containers}}{{.Name}} {{end}}' 2>/dev/null | xargs -r -n1 docker network disconnect -f app-network $redirect"
    eval "docker network rm app-network $redirect"
    eval "docker network create app-network $redirect"
    cd $SCRIPT_DIR
}

init() {
    local redirect=$(get_output_redirect)
    echo -e "\n💨\tInitializing services\n"
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
    echo -e "🛠️\tSetting environment variables\n"
    cp .env layers/communication/.env
    cp .env layers/knowledge/.env
    cp .env layers/llm/.env
    cp .env layers/management/.env
    cp .env layers/sysml/.env
    cp .env scripts/init/.env
    cp .env scripts/seed/.env
    cd $SCRIPT_DIR
}

clear() {
    echo -e "🧹\tClearing build related files\n"
    rm -rf layers/communication/.env
    rm -rf layers/knowledge/.env
    rm -rf layers/llm/.env
    rm -rf layers/management/.env
    rm -rf layers/sysml/.env
    rm -rf scripts/init/.env
    rm -rf scripts/seed/.env
    cd $SCRIPT_DIR
}

lms_start() {
    echo -e "🤖\tStarting LLM Inference Engine\n"
    nohup xvfb-run -a ./exec/lms/lm-studio --no-sandbox > /dev/null 2>&1 < /dev/null &
    sleep 5
    lms server start --cors > /dev/null 2>&1 < /dev/null &
    # Load models here
    #lms load nomic-embed-text-v1.5.Q4_K_M.gguf -y --identifier embedding
    lms load nomic-embed-text-v1.5-GGUF -y --identifier embedding
    lms load Grok-3-reasoning-gemma3-12B-distilled-HF-GGUF -y --identifier main
}

lms_stop() {
    lms server stop > /dev/null 2>&1 < /dev/null &
    sleep 5
    pkill -f "lm-studio" > /dev/null 2>&1 < /dev/null &
}

# Check if help argument is provided
if [ "$1" = "help" ]; then
    echo "Usage: llm-se [command]"
    echo ""
    echo "Commands:"
    echo "  help            Show this help message"
    echo "  build           Build all services"
    echo "  seed            Seed sample data"
    echo "  start           Start all services"
    echo "  stop            Stop all services"
    echo "  restart         Restart all services"
    echo "  status          Show the status of all services"
    echo "  destroy         Destroy all services"
    exit 0
fi 

if [ "$1" = "status" ]; then
    echo -e "Communication \t App \t\t\t$(tool_container_status "communication-app")"
    echo
    echo -e "Management \t API \t\t\t$(tool_container_status "management-api")"
    echo -e "Management \t Data \t\t\t$(tool_container_status "management-data")"
    echo -e "Management \t Logs \t\t\t$(tool_container_status "management-logs")"
    echo -e "Management \t Auth \t\t\t$(tool_container_status "management-auth")"
    echo
    echo -e "LLM \t\t API \t\t\t$(tool_container_status "llm-api")"
    echo -e "LLM \t\t Inference Engine \t$(tool_container_status "llm-inference")"
    echo -e "LLM \t\t Finetuning \t\t$(tool_container_status "llm-finetuning")"
    echo
    echo -e "Data \t\t API \t\t\t$(tool_container_status "knowledge-api")"
    echo -e "Data \t\t Relational \t\t$(tool_container_status "knowledge-relational")"
    echo -e "Data \t\t Object \t\t$(tool_container_status "knowledge-object")"
    echo -e "Data \t\t Vector \t\t$(tool_container_status "knowledge-vector")"
    
    exit 0
fi 

if [ "$1" = "seed" ]; then
    echo -e "🌱\tSeeding sample knowledge\n"
    local redirect=$(get_output_redirect)
    cd $SCRIPT_DIR/scripts/seed
    eval "uv venv $redirect"
    source .venv/bin/activate
    eval "uv pip install -r requirements.txt $redirect"
    eval "python script.py $redirect"
    deactivate
    eval "rm -rf .venv $redirect"
    cd $SCRIPT_DIR
fi

if [ "$1" = "build" ]; then
    redirect=$(get_output_redirect)
    tic=$(date +%s)

    echo -e "🪜\tPreparing to build\n"
    eval "service_destroy \"communication-app\" $redirect"
    eval "service_destroy \"llm-inference\" $redirect"
    eval "service_destroy \"llm-api\" $redirect"
    eval "service_destroy \"llm-finetuning\" $redirect"
    eval "service_destroy \"knowledge-relational\" $redirect"
    eval "service_destroy \"knowledge-object\" $redirect"
    eval "service_destroy \"knowledge-vector\" $redirect"
    eval "service_destroy \"knowledge-api\" $redirect"
    eval "service_destroy \"management-api\" $redirect"
    eval "service_destroy \"management-data\" $redirect"
    eval "service_destroy \"management-logs\" $redirect"
    eval "service_destroy \"management-auth\" $redirect"

    
    create_network
    env_create
    layer_build "knowledge"
    layer_build "llm"
    layer_build "communication"
    layer_build "management"
    layer_build "sysml"
    init
    
    # Only start LM Studio in headless mode
    if [ "$2" = "headless" ]; then
        lms_start
    fi
    
    clear
    toc=$(date +%s)
    echo -e "⌛️\tBuild took $(printf "%d minutes %d seconds" $(( ($toc - $tic) / 60 )) $(( ($toc - $tic) % 60 )))"
    echo -e "🎉\tAll services are running"
    echo -e "🌐\tAccess the application at http://$LOCAL_IP:3000\n"
fi

if [ "$1" = "start" ]; then
    lms_start
    service_start "communication-app"
    service_start "llm-inference"
    service_start "llm-api"
    service_start "llm-finetuning"
    service_start "knowledge-api"
    service_start "knowledge-relational"
    service_start "knowledge-object"
    service_start "knowledge-vector"
    service_start "management-api"
    service_start "management-data"
    service_start "management-logs"
    service_start "management-auth"
    echo -e "\n🎉 All services started\n"
fi

if [ "$1" = "stop" ]; then
    lms_stop
    service_stop "communication-app"
    service_stop "llm-inference"
    service_stop "llm-api"
    service_stop "llm-finetuning"
    service_stop "knowledge-api"
    service_stop "knowledge-relational"
    service_stop "knowledge-object"
    service_stop "knowledge-vector"
    service_stop "management-api"
    service_stop "management-data"
    service_stop "management-logs"
    service_stop "management-auth"
    echo -e "\n🎉 All services stopped\n"
fi

if [ "$1" = "restart" ]; then
    service_restart "communication-app"
    service_restart "llm-inference"
    service_restart "llm-api"
    service_restart "llm-finetuning"
    service_restart "knowledge-api"
    service_restart "knowledge-relational"
    service_restart "knowledge-object"
    service_restart "knowledge-vector"
    service_restart "management-api"
    service_restart "management-data"
    service_restart "management-logs"
    service_restart "management-auth"
    echo -e "\n🎉 All services restarted\n"
fi

if [ "$1" = "destroy" ]; then
    redirect=$(get_output_redirect)
    echo -e "💣\tDestroying all services\n"
    service_destroy "communication-app"
    service_destroy "llm-inference"
    service_destroy "llm-api"
    service_destroy "llm-finetuning"
    service_destroy "knowledge-api"
    service_destroy "knowledge-relational"
    service_destroy "knowledge-object"
    service_destroy "knowledge-vector"
    service_destroy "management-api"
    service_destroy "management-data"
    service_destroy "management-logs"
    service_destroy "management-auth"
    eval "docker rm $(docker ps -f status=exited -aq) $redirect"
    eval "docker rmi $(docker images -f "dangling=true" -q) $redirect"
    eval "docker volume rm $(docker volume ls -f "dangling=true" -q) $redirect"
    echo -e "\n🎉 All services destroyed\n"
fi



