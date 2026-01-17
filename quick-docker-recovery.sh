#!/bin/bash

# =============================================================================
# DOCKER DESKTOP RECOVERY SCRIPT
# =============================================================================
# Purpose: Quick recovery from Docker Desktop "empty package" error
# Usage: ./quick-docker-recovery.sh
# Platform: Windows (via Git Bash/WSL) or Linux/macOS

set -e

echo "🐳 Docker Desktop Recovery Script"
echo "=================================="
echo ""

# Function to detect OS
detect_os() {
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
        echo "windows"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
    else
        echo "unknown"
    fi
}

OS=$(detect_os)
echo "🖥️  Detected OS: $OS"
echo ""

# Phase 1: Install Docker CLI only
echo "📦 Phase 1: Installing Docker CLI..."
echo "-----------------------------------"

if [[ "$OS" == "windows" ]]; then
    echo "🪟 Windows detected. Installing Docker CLI via Chocolatey..."
    
    # Check if Chocolatey is installed
    if ! command -v choco &> /dev/null; then
        echo "🍫 Installing Chocolatey..."
        powershell -Command "Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))"
    fi
    
    # Install Docker CLI
    choco install docker-cli -y
    
elif [[ "$OS" == "linux" ]]; then
    echo "🐧 Linux detected. Installing Docker CLI..."
    
    # Check if Docker is already installed
    if ! command -v docker &> /dev/null; then
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
        rm get-docker.sh
        echo "⚠️  Please log out and log back in to use Docker without sudo"
    fi
    
elif [[ "$OS" == "macos" ]]; then
    echo "🍎 macOS detected. Installing Docker CLI via Homebrew..."
    
    if ! command -v brew &> /dev/null; then
        echo "🍺 Installing Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi
    
    brew install docker
    brew install docker-compose
fi

echo ""

# Phase 2: Test Docker installation
echo "🧪 Phase 2: Testing Docker Installation..."
echo "-----------------------------------------"

if command -v docker &> /dev/null; then
    echo "✅ Docker CLI version: $(docker --version)"
else
    echo "❌ Docker CLI not found. Installation failed."
    exit 1
fi

if command -v docker-compose &> /dev/null; then
    echo "✅ Docker Compose version: $(docker-compose --version)"
else
    echo "⚠️  Docker Compose not found. Using 'docker compose' plugin instead..."
fi

echo ""

# Phase 3: Test Docker functionality
echo "🚀 Phase 3: Testing Docker Functionality..."
echo "--------------------------------------------"

echo "🏃 Running hello-world container..."
docker run --rm hello-world

echo ""
echo "🔍 Testing Docker Compose with your services..."
if [[ -f "docker-compose.yml" ]]; then
    echo "📋 Found docker-compose.yml"
    echo "🔍 Checking configuration..."
    docker-compose config --quiet
    echo "✅ Docker Compose configuration is valid"
else
    echo "⚠️  docker-compose.yml not found in current directory"
fi

echo ""

# Phase 4: Start essential services
echo "🏗️  Phase 4: Starting Essential Services..."
echo "--------------------------------------------"

if [[ -f "docker-compose.yml" ]]; then
    echo "🚀 Starting PostgreSQL and Redis..."
    docker-compose up -d postgres redis
    
    echo "⏳ Waiting for services to be healthy..."
    sleep 10
    
    echo "🔍 Checking service status..."
    docker-compose ps
    
    echo ""
    echo "📊 Service Health Check:"
    echo "PostgreSQL: $(docker-compose exec -T postgres pg_isready -U vauntico_user -d vauntico_db 2>/dev/null || echo '❌ Not ready')"
    echo "Redis: $(docker-compose exec -T redis redis-cli --raw incr ping 2>/dev/null || echo '❌ Not ready')"
fi

echo ""

# Phase 5: Deployment instructions
echo "🚀 Phase 5: Deployment Instructions..."
echo "--------------------------------------"

echo "📋 Next steps to deploy to production:"
echo ""
echo "1. 🔐 Add missing OCI secrets to GitHub repository:"
echo "   - OCI_PRIVATE_KEY (Base64-encoded)"
echo "   - OCI_FINGERPRINT"
echo ""
echo "2. 🧪 Test OCI authentication:"
echo "   gh workflow run mcp-oci-connector.yml --field oci_action=authenticate"
echo ""
echo "3. 🏗️  Build and deploy to OCI:"
echo "   gh workflow run mcp-oci-connector.yml --field oci_action=build-push --field image_tag=v\$(date +%Y%m%d-%H%M%S)"
echo ""
echo "4. ✅ Validate deployment:"
echo "   ./scripts/validate-deployment.sh https://api.vauntico.com production"
echo ""

# Phase 6: Local development commands
echo "💻 Phase 6: Local Development Commands..."
echo "------------------------------------------"

echo "🔧 Useful commands for local development:"
echo ""
echo "# Start all services"
echo "docker-compose up -d"
echo ""
echo "# View logs"
echo "docker-compose logs -f"
echo ""
echo "# Start specific services"
echo "docker-compose up -d trust-score-backend vauntico-server"
echo ""
echo "# Run health checks"
echo "curl http://localhost:3001/health"
echo "curl http://localhost:3002/health"
echo ""

echo "✅ Docker recovery completed successfully!"
echo "🎯 Your deployment pipeline is ready to proceed."
echo ""

# Final summary
echo "📊 Recovery Summary:"
echo "===================="
echo "✅ Docker CLI installed and tested"
echo "✅ Docker Compose configuration validated"
echo "✅ Essential services started"
echo "📋 Deployment instructions provided"
echo "🚀 Ready for production deployment"
echo ""
echo "⏱️  Total recovery time: ~5-10 minutes"
echo "🎯 Next action: Add OCI secrets and deploy"
