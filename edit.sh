#!/bin/bash

replace_string() {
    local file_path="$1"
    local search_string="$2"
    local replace_string="$3"

    # Silently perform the replacement using sed
    sed -i '' "s|${search_string}|${replace_string}|g" "$file_path" 2>/dev/null
}

replace_string "communication-layer/api/Dockerfile" "8002" "8003"