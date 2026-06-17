#!/bin/bash

# Download all local models using Ollama

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    echo "Ollama is not installed. Please install Ollama first."
    exit 1
fi

# List of models to download
MODELS=(
    "qwen2.5-coder:7b"
    "qwen2.5:1.5b"
    "qwen2.5-coder:32b"
    "llama3.2:3b"
    "deepseek-r1:8b"
)

# Download each model
for model in "${MODELS[@]}"; do
    echo "Downloading $model..."
    ollama pull "$model"

    if [ $? -eq 0 ]; then
        echo "Successfully downloaded $model"
    else
        echo "Failed to download $model"
    fi
done

echo "Model download process completed"
