#!/bin/bash

# Railway Multi-Service Deployment Validation Script
# Validates that all backend services are properly configured for Railway deployment

echo "🚀 Railway Multi-Service Validation"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

echo -e "${BLUE}📋 Checking Railway configuration...${NC}"

# Check 1: railway.toml exists and is valid TOML
if [ -f "railway.toml" ]; then
    print_status 0 "railway.toml exists"
    
    # Check if it has service definitions
    if grep -q "\[\[services\]\]" "railway.toml"; then
        print_status 0 "Service definitions found in railway.toml"
    else
        print_status 1 "No service definitions found in railway.toml"
    fi
    
    # Count services
    service_count=$(grep -c "\[\[services\]\]" "railway.toml")
    print_status 0 "Found $service_count backend services configured"
else
    print_status 1 "railway.toml not found"
fi

echo
echo -e "${BLUE}🔍 Checking .railwayignore...${NC}"

# Check 2: .railwayignore exists
if [ -f ".railwayignore" ]; then
    print_status 0 ".railwayignore exists"
    
    # Check if backend services are allowed
    if grep -q "!server-v2/" ".railwayignore"; then
        print_status 0 "server-v2 allowed in .railwayignore"
    else
        print_status 1 "server-v2 not allowed in .railwayignore"
    fi
    
    if grep -q "!vauntico-fulfillment-engine/" ".railwayignore"; then
        print_status 0 "vauntico-fulfillment-engine allowed in .railwayignore"
    else
        print_status 1 "vauntico-fulfillment-engine not allowed in .railwayignore"
    fi
    
    if grep -q "!server/" ".railwayignore"; then
        print_status 0 "server allowed in .railwayignore"
    else
        print_status 1 "server not allowed in .railwayignore"
    fi
    
    if grep -q "!vauntico-server/" ".railwayignore"; then
        print_status 0 "vauntico-server allowed in .railwayignore"
    else
        print_status 1 "vauntico-server not allowed in .railwayignore"
    fi
else
    print_status 1 ".railwayignore not found"
fi

echo
echo -e "${BLUE}📦 Checking backend service directories...${NC}"

# Check 3: Backend directories exist and have package.json
services=("server-v2" "vauntico-fulfillment-engine" "server" "vauntico-server")

for service in "${services[@]}"; do
    if [ -d "$service" ]; then
        print_status 0 "$service directory exists"
        
        if [ -f "$service/package.json" ]; then
            print_status 0 "$service/package.json exists"
            
            # Check start script
            if grep -q '"start"' "$service/package.json"; then
                print_status 0 "$service has start script"
            else
                print_status 1 "$service missing start script"
            fi
        else
            print_status 1 "$service/package.json not found"
    fi
done

echo
echo -e "${BLUE}🏥 Checking health endpoints...${NC}"

# Check 4: Health endpoints exist
check_health_endpoint() {
    local service_path=$1
    local health_path=$2
    local service_name=$3
    
    if [ -f "$service_path" ]; then
        # Check for Express.js style health endpoint
        if [ -f "$service_path/server.js" ]; then
            if grep -q "app.get.*health" "$service_path/server.js"; then
                print_status 0 "$service_name has health endpoint"
            else
                print_status 1 "$service_name missing health endpoint"
            fi
        fi
        
        # Check for TypeScript Express style health endpoint
        if [ -f "$service_path/src/server.ts" ] || [ -f "$service_path/src/index.ts" ]; then
            if [ -f "$service_path/src/routes/health.ts" ] || grep -q "health" "$service_path/src/"*.ts; then
                print_status 0 "$service_name has health endpoint (TypeScript)"
            else
                print_status 1 "$service_name missing health endpoint"
            fi
        fi
    fi
}

check_health_endpoint "server-v2" "/health" "Trust Score Backend"
check_health_endpoint "vauntico-fulfillment-engine" "/api/status" "Fulfillment Engine"
check_health_endpoint "server" "/api/status" "Legacy Server"
check_health_endpoint "vauntico-server" "/health" "Vauntico Server"

echo
echo -e "${BLUE}📄 Checking documentation...${NC}"

# Check 5: Documentation exists
if [ -f "RAILWAY_MULTI_SERVICE_GUIDE.md" ]; then
    print_status 0 "Multi-service guide exists"
else
    print_status 1 "Multi-service guide not found"
fi

echo
echo -e "${BLUE}🔧 Environment variable templates...${NC}"

# Check 6: Environment example files
env_files=("server-v2/.env.example" "vauntico-fulfillment-engine/.env.example" "server/.env.example" "vauntico-server/.env.example")

for env_file in "${env_files[@]}"; do
    if [ -f "$env_file" ]; then
        print_status 0 "$(basename $(dirname $env_file))/.env.example exists"
    else
        print_status 1 "$(basename $(dirname $env_file))/.env.example missing"
    fi
done

echo
echo "=================================="
echo -e "${GREEN}🎉 Validation Summary${NC}"
echo ""
echo "Next steps:"
echo "1. Create 4 Railway projects (one for each service)"
echo "2. Configure environment variables for each service"
echo "3. Push to GitHub to trigger deployment"
echo "4. Monitor health endpoints in Railway dashboard"
echo ""
echo -e "${YELLOW}📖 For detailed setup instructions, see: RAILWAY_MULTI_SERVICE_GUIDE.md${NC}"
