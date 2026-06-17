#!/bin/bash

# Generate a new encryption key for API keys

echo "JARVIS V5.0 Encryption Key Generator"
echo "-----------------------------------"
echo ""

# Check if Python is available
if ! command -v python &> /dev/null; then
    echo "Python is not installed. Please install Python first."
    exit 1
fi

# Generate the key
KEY=$(python -c "
from cryptography.fernet import Fernet
print(Fernet.generate_key().decode())
")

if [ -z "$KEY" ]; then
    echo "Failed to generate encryption key."
    exit 1
fi

echo "Your new encryption key:"
echo ""
echo "ENCRYPTION_KEY=$KEY"
echo ""
echo "Add this to your .env file:"
echo ""
echo "# API Key Encryption"
echo "ENCRYPTION_KEY=$KEY"
echo ""
echo "Note: This key is used to encrypt API keys stored in the model registry."
echo "Keep it secret and don't lose it - you won't be able to decrypt existing keys without it!"
