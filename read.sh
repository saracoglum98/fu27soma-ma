#!/bin/bash

# Function to read YAML using colon-separated keys
read_yaml() {
    local yaml_file="$1"
    local keys="$2"

    # Check if yq is installed
    if ! command -v yq &> /dev/null; then
        echo "Error: yq is not installed" >&2
        echo "Please install yq first:" >&2
        echo "  For macOS: brew install yq" >&2
        echo "  For Linux: snap install yq" >&2
        return 1
    fi

    # Check if file exists
    if [ ! -f "$yaml_file" ]; then
        echo "Error: File '$yaml_file' not found" >&2
        return 1
    fi

    # If no keys provided, show entire file
    if [ -z "$keys" ]; then
        yq eval '.' "$yaml_file"
        return $?
    fi

    # Convert colon-separated keys to yq path format
    local yq_path
    yq_path=$(echo "$keys" | sed 's/:/./g')
    yq_path=".$yq_path"  # Add leading dot for yq syntax

    # Try to read the YAML file with the converted path
    if ! value=$(yq eval "$yq_path" "$yaml_file" 2>/dev/null); then
        echo "Error: Failed to read YAML path: $yq_path" >&2
        return 1
    fi

    echo "$value"
}

# Show usage if no arguments provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 <yaml_file> [key1:key2:key3]"
    echo "Examples:"
    echo "  $0 config.yaml                  # Show entire file"
    echo "  $0 config.yaml database:host    # Get database host"
    echo "  $0 config.yaml services:web:port # Get web service port"
    exit 1
fi

# Call the function with provided arguments
read_yaml "$1" "$2"
