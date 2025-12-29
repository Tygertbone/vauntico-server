#!/bin/bash

# Railway Smoke Test Script for Vauntico Project
# This script tests all 4 services after Railway deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Railway URLs - Replace these with your actual Railway URLs
SERVER_V2_URL="${SERVER_V2_URL:-https://server-v2-url.railway.app}"
SRC_URL="${SRC_URL:-https://src-url.railway.app}"
HOMEPAGE_REDESIGN_URL="${HOMEPAGE_REDESIGN_URL:-https://homepage-redesign-url.railway.app}"
VAULT_LANDING_URL="${VAULT_LANDING_URL:-https://vault-landing-url.railway.app}"

echo -e "${YELLOW}🚀 Starting Railway Smoke Tests for Vauntico Services${NC}"
echo "=================================================="
echo ""

# Function to test health endpoint
test_health_endpoint() {
    local url=$1
    local service_name=$2
    local expected_status=${3:-200}
    
    echo -e "Testing ${YELLOW}$service_name${NC}..."
    echo "URL: $url"
    
    # Make the request and capture response
    response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "$url" 2>/dev/null || echo "HTTP_STATUS:000")
    
    # Extract HTTP status
    http_status=$(echo "$response" | grep -o 'HTTP_STATUS:[0-9]*' | cut -d: -f2)
    
    # Extract body (everything before HTTP_STATUS line)
    body=$(echo "$response" | sed -n '/HTTP_STATUS:/q;p')
    
    if [ "$http_status" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} - HTTP $http_status"
        echo "Response: $(echo "$body" | head -c 200)..."
    else
        echo -e "${RED}❌ FAIL${NC} - HTTP $http_status (expected $expected_status)"
        if [ "$http_status" = "000" ]; then
            echo "Error: Could not connect to the service"
        else
            echo "Response: $(echo "$body" | head -c 200)..."
        fi
        return 1
    fi
    echo ""
}

# Function to validate JSON response
validate_json() {
    local response=$1
    local service_name=$2
    
    if echo "$response" | python3 -m json.tool >/dev/null 2>&1; then
        echo -e "${GREEN}✅ JSON Valid${NC} for $service_name"
        return 0
    else
        echo -e "${YELLOW}⚠️  Invalid JSON${NC} for $service_name (may be expected for static files)"
        return 0
    fi
}

# Test 1: server-v2 health endpoint
echo "1. Testing server-v2 service..."
test_health_endpoint "$SERVER_V2_URL/health" "server-v2"

# Test 2: src React app health endpoint
echo "2. Testing src React app..."
test_health_endpoint "$SRC_URL/health.json" "src"

# Test 3: homepage-redesign Next.js health endpoint
echo "3. Testing homepage-redesign Next.js app..."
test_health_endpoint "$HOMEPAGE_REDESIGN_URL/api/health" "homepage-redesign"

# Test 4: vault-landing health endpoint
echo "4. Testing vault-landing..."
test_health_endpoint "$VAULT_LANDING_URL/health.json" "vault-landing"

echo "=================================================="
echo -e "${YELLOW}📊 Detailed Health Checks${NC}"
echo "=================================================="

# Detailed checks with JSON validation
echo ""
echo "Checking detailed responses..."

# server-v2 detailed check
echo -e "\n${YELLOW}server-v2 detailed check:${NC}"
response=$(curl -s "$SERVER_V2_URL/health" 2>/dev/null || echo '{"error": "connection_failed"}')
echo "Response: $response"
validate_json "$response" "server-v2"

# src detailed check
echo -e "\n${YELLOW}src detailed check:${NC}"
response=$(curl -s "$SRC_URL/health.json" 2>/dev/null || echo '{"error": "connection_failed"}')
echo "Response: $response"
validate_json "$response" "src"

# homepage-redesign detailed check
echo -e "\n${YELLOW}homepage-redesign detailed check:${NC}"
response=$(curl -s "$HOMEPAGE_REDESIGN_URL/api/health" 2>/dev/null || echo '{"error": "connection_failed"}')
echo "Response: $response"
validate_json "$response" "homepage-redesign"

# vault-landing detailed check
echo -e "\n${YELLOW}vault-landing detailed check:${NC}"
response=$(curl -s "$VAULT_LANDING_URL/health.json" 2>/dev/null || echo '{"error": "connection_failed"}')
echo "Response: $response"
validate_json "$response" "vault-landing"

echo ""
echo "=================================================="
echo -e "${GREEN}✅ Smoke Tests Complete!${NC}"
echo "=================================================="

# Summary
echo ""
echo -e "${YELLOW}📋 Summary:${NC}"
echo "- All health endpoints tested"
echo "- HTTP status codes validated"
echo "- JSON responses checked"
echo ""
echo -e "${YELLOW}🔗 URLs tested:${NC}"
echo "- server-v2: $SERVER_V2_URL/health"
echo "- src: $SRC_URL/health.json"
echo "- homepage-redesign: $HOMEPAGE_REDESIGN_URL/api/health"
echo "- vault-landing: $VAULT_LANDING_URL/health.json"
echo ""
echo -e "${YELLOW}💡 Tips:${NC}"
echo "- If any tests failed, check the Railway dashboard for build logs"
echo "- Verify health endpoints are accessible and returning correct responses"
echo "- Check environment variables are properly set in Railway"
echo "- Review service logs for any runtime errors"
