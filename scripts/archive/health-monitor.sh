#!/bin/bash

# Vauntico Health Monitoring Script
# Tests all health endpoints and reports status

echo "🔍 Vauntico Health Monitor - $(date)"
echo "====================================="

# Test endpoints
endpoints=(
    "https://api.vauntico.com/health:API Server"
    "https://www.vauntico.com/api/health:Homepage API"
    "https://fulfillment.vauntico.com/health.json:Fulfillment App"
    "https://vauntico-fulfillment-sys.vercel.app/health:Fulfillment Engine"
    "https://homepage-redesign-omega.vercel.app/api/health:Homepage Direct"
)

all_healthy=true

for endpoint in "${endpoints[@]}"; do
    url=$(echo $endpoint | cut -d: -f1)
    name=$(echo $endpoint | cut -d: -f2)

    echo -n "Testing $name ($url)... "

    response=$(curl -s -w "%{http_code}" -o /dev/null "$url" 2>/dev/null)
    status=$?

    if [ $status -eq 0 ] && [ "$response" = "200" ]; then
        echo "✅ PASS ($response)"
    else
        echo "❌ FAIL ($response)"
        all_healthy=false
    fi
done

echo ""
if [ "$all_healthy" = true ]; then
    echo "🎉 All health checks passed!"
else
    echo "⚠️  Some health checks failed. Check domain configuration and authentication settings."
fi

echo "====================================="
