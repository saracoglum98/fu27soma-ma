#!/bin/bash

clear

DEBUG=false

start_service() {
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
    echo -e "✅ Done \t $folder\n"
    cd ..
}

clear() (
    local layer=$1
    echo -e "🧹 Clearing $layer initialization script"
    if [ "$DEBUG" = true ]; then
        docker stop $layer-init || true
        docker rm $layer-init || true
    else
        docker stop $layer-init > /dev/null 2>&1
        docker rm $layer-init > /dev/null 2>&1
    fi
)


start_service "communication-layer"
start_service "data-layer"

clear "data-layer"
echo -e "🎉 All services are running\n"

