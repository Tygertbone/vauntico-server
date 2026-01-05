#!/bin/bash

# Vauntico Trust-Score Backend Deployment Script
# Execute this script after SSHing into the OCI instance

echo "🚀 Starting Vauntico Trust-Score Backend Deployment..."

# Update system packages
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
echo "📦 Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Docker (alternative deployment method)
echo "📦 Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Git
echo "📦 Installing Git..."
sudo apt-get install -y git

# Create application directory
echo "📁 Creating application directory..."
mkdir -p /home/ubuntu/trust-score-backend
cd /home/ubuntu/trust-score-backend

# Clone your repository (replace with your actual repo)
echo "📥 Cloning application repository..."
# git clone <YOUR_REPOSITORY_URL> .

# Install Node.js dependencies (if using Node.js)
echo "📦 Installing Node.js dependencies..."
# npm install

# Create basic Express.js server as placeholder
echo "🔧 Creating basic Express.js server..."
cat > server.js << 'EOF'
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// API status endpoint
app.get('/api/v1/status', (req, res) => {
    res.json({
        status: 'ok',
        version: '1.0.0',
        service: 'trust-score-backend',
        uptime: process.uptime()
    });
});

// Main endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Vauntico Trust-Score Backend API',
        status: 'running',
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
EOF

# Create package.json
echo "📦 Creating package.json..."
cat > package.json << 'EOF'
{
  "name": "trust-score-backend",
  "version": "1.0.0",
  "description": "Vauntico Trust-Score Backend API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF

# Install dependencies
echo "📦 Installing application dependencies..."
npm install

# Create systemd service for auto-start
echo "🔧 Creating systemd service..."
sudo cat > /etc/systemd/system/trust-score.service << EOF
[Unit]
Description=Trust Score Backend Service
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/trust-score-backend
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
EOF

# Configure firewall to allow port 3000
echo "🔥 Configuring firewall..."
sudo ufw allow 22
sudo ufw allow 3000
sudo ufw --force enable

# Start the service
echo "🚀 Starting trust-score service..."
sudo systemctl daemon-reload
sudo systemctl enable trust-score
sudo systemctl start trust-score

# Check service status
echo "📊 Checking service status..."
sudo systemctl status trust-score

# Test the application
echo "🧪 Testing application locally..."
curl -s http://localhost:3000/health

echo ""
echo "✅ Backend deployment completed!"
echo ""
echo "🌐 Available endpoints:"
echo "   Health: http://localhost:3000/health"
echo "   Status: http://localhost:3000/api/v1/status"
echo "   Root: http://localhost:3000/"
echo ""
echo "🔧 Service management:"
echo "   Start: sudo systemctl start trust-score"
echo "   Stop: sudo systemctl stop trust-score"
echo "   Restart: sudo systemctl restart trust-score"
echo "   Status: sudo systemctl status trust-score"
echo "   Logs: sudo journalctl -u trust-score -f"
echo ""
echo "🌍 External access will be available after DNS setup:"
echo "   https://trust-score.vauntico.com/health"
echo "   https://trust-score.vauntico.com/api/v1/status"
