#!/bin/bash

# Vauntico MVP - OCI Production Deployment Script
# This script deploys the backend to OCI server with PM2

set -e

echo "🚀 Starting Vauntico MVP Deployment to OCI Production..."

# Configuration
OCI_SERVER="your-oci-server-ip"  # Replace with actual OCI server IP
OCI_USER="ubuntu"
OCI_KEY_PATH="$HOME/.ssh/your-oci-key.pem"
DEPLOY_PATH="/var/www/vauntico-server"
BACKUP_PATH="/var/www/vauntico-server-backup"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}✅ Deployment Configuration Loaded${NC}"

# Step 1: Create backup of current deployment
echo -e "${YELLOW}📦 Step 1: Creating backup of current deployment...${NC}"
if ssh -i "$OCI_KEY_PATH" "$OCI_USER@$OCI_SERVER" "test -d $DEPLOY_PATH"; then
    ssh -i "$OCI_KEY_PATH" "$OCI_USER@$OCI_SERVER" "sudo mkdir -p $BACKUP_PATH && sudo cp -r $DEPLOY_PATH/* $BACKUP_PATH/ 2>/dev/null || true"
    echo -e "${GREEN}✅ Backup created at $BACKUP_PATH${NC}"
else
    echo -e "${YELLOW}⚠️  No existing deployment found, skipping backup${NC}"
fi

# Step 2: Deploy new code
echo -e "${YELLOW}📦 Step 2: Deploying new code...${NC}"

# Create deployment directory if it doesn't exist
ssh -i "$OCI_KEY_PATH" "$OCI_USER@$OCI_SERVER" "sudo mkdir -p $DEPLOY_PATH"

# Copy files to server
echo "Copying files to OCI server..."
scp -i "$OCI_KEY_PATH" -r c:/Users/admin/vauntico-mvp/server-v2/* "$OCI_USER@$OCI_SERVER:$DEPLOY_PATH/"

# Step 3: Install dependencies
echo -e "${YELLOW}📦 Step 3: Installing dependencies...${NC}"
ssh -i "$OCI_KEY_PATH" "$OCI_USER@$OCI_SERVER" "cd $DEPLOY_PATH && npm ci --production"

# Step 4: Build TypeScript
echo -e "${YELLOW}📦 Step 4: Building TypeScript...${NC}"
ssh -i "$OCI_KEY_PATH" "$OCI_USER@$OCI_SERVER" "cd $DEPLOY_PATH && npm run build"

# Step 5: Setup PM2
echo -e "${YELLOW}📦 Step 5: Setting up PM2 process manager...${NC}"

# Create log directory
ssh -i "$OCI_KEY_PATH" "$OCI_USER@$OCI_SERVER" "sudo mkdir -p /var/log/vauntico"

# Stop existing PM2 processes
ssh -i "$OCI_KEY_PATH" "$OCI_USER@$OCI_SERVER" "pm2 stop vauntico-backend || true"

# Start new PM2 processes
ssh -i "$OCI_KEY_PATH" "$OCI_USER@$OCI_SERVER" "cd $DEPLOY_PATH && pm2 start ecosystem.config.js --env production"

# Save PM2 configuration
ssh -i "$OCI_KEY_PATH" "$OCI_USER@$OCI_SERVER" "pm2 save"

# Setup PM2 startup script
ssh -i "$OCI_KEY_PATH" "$OCI_USER@$OCI_SERVER" "pm2 startup"

# Step 6: Health Check
echo -e "${YELLOW}📦 Step 6: Performing health check...${NC}"
sleep 10

# Test health endpoint
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health || echo "000")

if [ "$HEALTH_CHECK" = "200" ]; then
    echo -e "${GREEN}✅ Health check passed - Server is running on port 3000${NC}"
else
    echo -e "${RED}❌ Health check failed - Status code: $HEALTH_CHECK${NC}"
    echo "Check logs with: pm2 logs vauntico-backend"
fi

# Step 7: Display PM2 status
echo -e "${YELLOW}📦 Step 7: PM2 Process Status${NC}"
ssh -i "$OCI_KEY_PATH" "$OCI_USER@$OCI_SERVER" "pm2 status"

echo -e "${GREEN}🎉 Deployment completed!${NC}"
echo ""
echo -e "${GREEN}📋 Deployment Summary:${NC}"
echo "   - Code deployed to: $DEPLOY_PATH"
echo "   - PM2 processes: vauntico-backend"
echo "   - Health endpoint: http://localhost:3000/health"
echo "   - Logs: pm2 logs vauntico-backend"
echo ""
echo -e "${YELLOW}🔧 Next Steps:${NC}"
echo "   1. Configure Nginx reverse proxy"
echo "   2. Setup SSL certificates"
echo "   3. Update DNS records"
echo "   4. Test API endpoints"
