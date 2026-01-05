#!/bin/bash

# OCI Health Endpoints Smoke Test Script
# Tests all OCI health endpoints and verifies JSON response format

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# OCI Endpoints to test
declare -A ENDPOINTS=(
    ["Frontend"]="https://vauntico.com/api/health"
    ["Backend API"]="https://api.vauntico.com/health"
    ["Fulfillment Engine"]="https://api.vauntico.com/fulfillment/health"
    ["Vault Landing"]="https://api.vauntico.com/vault/health"
)

echo -e "${YELLOW}🔍 Starting OCI Health Endpoints Smoke Test${NC}"
echo "=================================="

# Test each endpoint
for SERVICE_NAME in "${!ENDPOINTS[@]}"; do
    URL="${ENDPOINTS[$SERVICE_NAME]}"
    echo -e "\n${YELLOW}Testing $SERVICE_NAME:${NC} $URL"
    
    # Perform the request and capture response
    if RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" "$URL" 2>/dev/null); then
        HTTP_CODE=$(echo $RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
        BODY=$(echo $RESPONSE | sed -e 's/HTTPSTATUS:.*//g')
        
        if [ "$HTTP_CODE" -eq 200 ]; then
            echo -e "${GREEN}✅ HTTP Status: $HTTP_CODE${NC}"
            
            # Parse JSON and validate required fields
            if command -v jq >/dev/null 2>&1; then
                STATUS=$(echo "$BODY" | jq -r '.status // "missing"')
                SERVICE=$(echo "$BODY" | jq -r '.service // "missing"')
                TIMESTAMP=$(echo "$BODY" | jq -r '.timestamp // "missing"')
                UPTIME=$(echo "$BODY" | jq -r '.uptime // "missing"')
                ENVIRONMENT=$(echo "$BODY" | jq -r '.environment // "missing"')
                
                # Check required fields
                if [[ "$STATUS" == "ok" && "$SERVICE" != "missing" && "$TIMESTAMP" != "missing" && "$UPTIME" != "missing" && "$ENVIRONMENT" == "production" ]]; then
                    echo -e "${GREEN}✅ JSON Response Valid:${NC}"
                    echo "   - status: $STATUS"
                    echo "   - service: $SERVICE"
                    echo "   - timestamp: $TIMESTAMP"
                    echo "   - uptime: $UPTIME seconds"
                    echo "   - environment: $ENVIRONMENT"
                else
                    echo -e "${RED}❌ Invalid JSON Response:${NC}"
                    echo "   - status: $STATUS (expected: ok)"
                    echo "   - service: $SERVICE"
                    echo "   - timestamp: $TIMESTAMP"
                    echo "   - uptime: $UPTIME"
                    echo "   - environment: $ENVIRONMENT (expected: production)"
                fi
            else
                echo -e "${YELLOW}⚠️  jq not available, displaying raw response:${NC}"
                echo "$BODY" | head -5
            fi
        else
            echo -e "${RED}❌ HTTP Status: $HTTP_CODE${NC}"
            echo "Response: $BODY"
        fi
    else
        echo -e "${RED}❌ Failed to connect to $URL${NC}"
    fi
done

echo -e "\n${YELLOW}🎯 Smoke Test Complete${NC}"
echo "=================================="
echo "Summary: All OCI health endpoints have been tested."
echo "Check the results above for any issues that need attention."
