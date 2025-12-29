#!/bin/bash

# Railway Deployment Script for Vauntico Project
# This script will redeploy all 4 services using Railway CLI

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Railway Deployment Script for Vauntico Project${NC}"
echo "=================================================="
echo ""

# Function to deploy a service
deploy_service() {
    local service_name=$1
    local service_path=$2
    
    echo -e "${YELLOW}🔄 Redeploying $service_name...${NC}"
    
    if [ -d "$service_path" ]; then
        cd "$service_path"
        
        # Check if railway.toml exists
        if [ ! -f "railway.toml" ]; then
            echo -e "${RED}❌ railway.toml not found in $service_path${NC}"
            cd ..
            return 1
        fi
        
        echo -e "${BLUE}📍 Current directory: $(pwd)${NC}"
        echo -e "${BLUE}📋 railway.toml found, proceeding with deployment...${NC}"
        
        # Use redeploy command with automatic yes
        echo "y" | railway redeploy --service "$service_name" || {
            echo -e "${RED}❌ Failed to redeploy $service_name${NC}"
            cd ..
            return 1
        }
        
        echo -e "${GREEN}✅ $service_name redeployed successfully${NC}"
        cd ..
        echo ""
    else
        echo -e "${RED}❌ Directory $service_path not found${NC}"
        return 1
    fi
}

# Deploy all services
echo -e "${BLUE}📦 Starting deployment of all services...${NC}"
echo ""

# Deploy server-v2
deploy_service "vauntico-fulfillment-engine" "vauntico-fulfillment-engine"

# Note: The other services (src, homepage-redesign, vault-landing) might need to be added as separate services in Railway
# For now, let's try to deploy them if they exist as services

# Try to deploy src (if it exists as a service)
echo -e "${YELLOW}🔄 Attempting to deploy src service...${NC}"
if [ -d "src" ]; then
    cd src
    echo "y" | railway redeploy --service "src" 2>/dev/null || echo -e "${YELLOW}⚠️  src service not found or failed to deploy${NC}"
    cd ..
fi

# Try to deploy homepage-redesign (if it exists as a service)
echo -e "${YELLOW}🔄 Attempting to deploy homepage-redesign service...${NC}"
if [ -d "homepage-redesign" ]; then
    cd homepage-redesign
    echo "y" | railway redeploy --service "homepage-redesign" 2>/dev/null || echo -e "${YELLOW}⚠️  homepage-redesign service not found or failed to deploy${NC}"
    cd ..
fi

# Try to deploy vault-landing (if it exists as a service)
echo -e "${YELLOW}🔄 Attempting to deploy vault-landing service...${NC}"
if [ -d "vault-landing" ]; then
    cd vault-landing
    echo "y" | railway redeploy --service "vault-landing" 2>/dev/null || echo -e "${YELLOW}⚠️  vault-landing service not found or failed to deploy${NC}"
    cd ..
fi

echo ""
echo -e "${GREEN}🎉 Deployment process completed!${NC}"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "1. Check Railway dashboard for deployment status"
echo "2. Run smoke tests: ./scripts/railway-smoke-test.sh"
echo "3. Verify health endpoints are accessible"
echo ""
echo -e "${BLUE}🔗 Railway Dashboard: https://railway.app${NC}"
