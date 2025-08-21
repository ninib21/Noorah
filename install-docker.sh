#!/bin/bash

echo "🐳 Installing Docker in Ubuntu WSL..."

# Update package list
echo "📦 Updating package list..."
sudo apt update -y

# Install prerequisites
echo "🔧 Installing prerequisites..."
sudo apt install -y curl ca-certificates gnupg lsb-release

# Download Docker installation script
echo "⬇️ Downloading Docker installation script..."
curl -fsSL https://get.docker.com -o get-docker.sh

# Install Docker
echo "🐳 Installing Docker..."
sudo sh get-docker.sh

# Add current user to docker group
echo "👤 Adding user to docker group..."
sudo usermod -aG docker $USER

# Start Docker service
echo "🚀 Starting Docker service..."
sudo service docker start

# Test Docker installation
echo "🧪 Testing Docker installation..."
docker --version

echo "✅ Docker installation complete!"
echo "💡 You may need to restart your terminal or run 'newgrp docker' to use Docker without sudo"
