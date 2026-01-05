#!/bin/bash
# Comprehensive Health Check Script for Vauntico Services
# Usage: ./scripts/comprehensive-health-check.sh

echo "🏥️  Running comprehensive health check for all Vauntico services..."

# Default URLs (update these with your actual Railway URLs)
SERVER_V2_URL="${SERVER_V2_URL:-https://your-server-v2-url.railway.app}"
SRC_URL="${SRC_URL:-https://your-src-url.railway.app}"
HOMEPAGE_REDESIGN_URL="${HOMEPAGE_REDESIGN_URL:-https://your-homepage-redesign-url.railway.app}"
VAULT_LANDING_URL="${VAULT_LANDING_URL:-https://your-vault-landing-url.railway.app}"

services_passed=0
services_total=4

# Function to check service health
check_service_health() {
    local service_name="$1"
    local url="$2"
    local expected_path="$3"
    
    echo "🔍 Checking $service_name..."
    
    response=$(curl -s -w "%{http_code}" "$url$expected_path" 2>/dev/null)
    http_code=$?
    
    if [ "$http_code" = "200" ]; then
        echo "✅ $service_name: HEALTHY (HTTP $http_code)"
        services_passed=$((services_passed + 1))
    else
        echo "❌ $service_name: UNHEALTHY (HTTP $http_code)"
    fi
    
    echo ""
}

# Check all services
check_service_health "server-v2" "$SERVER_V2_URL" "/health"
check_service_health "src" "$SRC_URL" "/health.json"
check_service_health "homepage-redesign" "$HOMEPAGE_REDESIGN_URL" "/api/health"
check_service_health "vault-landing" "$VAULT_LANDING_URL" "/health.json"

# Summary
echo "📊 Health Check Summary:"
echo "Services passed: $services_passed/$services_total"
echo "Overall status: $([ $services_passed -eq $services_total ] && echo "🟢 ALL HEALTHY" || echo "🟡 SOME UNHEALTHY")"

# Exit with error code if any service failed
if [ $services_passed -ne $services_total ]; then
    echo "🚨 Some services are unhealthy. Check logs above."
    exit 1
else
    echo "🎉 All services are healthy!"
    exit 0
fi
