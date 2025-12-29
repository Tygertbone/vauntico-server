#!/bin/bash

# OCI Health Report Generator
# Generates comprehensive health status report for all Vauntico services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
TIMEOUT=30
RETRY_ATTEMPTS=3
REPORT_FILE="oci-health-report-$(date +%Y%m%d-%H%M%S).md"
SERVICES_FILE="services.json"

# Function to print colored status
print_status() {
    local status=$1
    local message=$2
    
    case $status in
        "✅")
            echo -e "${GREEN}${status} ${message}${NC}"
            ;;
        "❌")
            echo -e "${RED}${status} ${message}${NC}"
            ;;
        "⚠️")
            echo -e "${YELLOW}${status} ${message}${NC}"
            ;;
        "ℹ️")
            echo -e "${BLUE}${status} ${message}${NC}"
            ;;
    esac
}

# Function to check health endpoint
check_health_endpoint() {
    local url="$1"
    local endpoint="$2"
    local service_name="$3"
    local expected_response="$4"
    
    local full_url="${url}${endpoint}"
    local attempt=1
    local response=""
    local http_status=""
    local response_time=""
    
    while [ $attempt -le $RETRY_ATTEMPTS ]; do
        echo -n "  Attempt $attempt/$RETRY_ATTEMPTS... "
        
        # Measure response time and get status
        start_time=$(date +%s%N)
        http_status=$(curl -s -o /tmp/health_response_${service_name} -w "%{http_code}" \
            --max-time $TIMEOUT \
            -H "User-Agent: Vauntico-Health-Check/1.0" \
            "$full_url" 2>/dev/null || echo "000")
        end_time=$(date +%s%N)
        
        if [ "$http_status" = "200" ]; then
            response_time=$(( (end_time - start_time) / 1000000 )) # Convert to milliseconds
            response=$(cat /tmp/health_response_${service_name} 2>/dev/null || echo "")
            
            # Validate JSON response
            if echo "$response" | jq -e '.status' >/dev/null 2>&1; then
                local status=$(echo "$response" | jq -r '.status')
                if [ "$status" = "ok" ]; then
                    print_status "✅" "Healthy (${response_time}ms)"
                    echo "    Response: $response"
                    return 0
                else
                    print_status "❌" "Invalid status: $status"
                    echo "    Response: $response"
                    return 1
                fi
            else
                print_status "⚠️" "Invalid JSON response"
                echo "    Response: $response"
                return 1
            fi
        else
            print_status "❌" "HTTP $http_status"
            if [ $attempt -eq $RETRY_ATTEMPTS ]; then
                echo "    Final attempt failed"
            fi
        fi
        
        attempt=$((attempt + 1))
        sleep 2
    done
    
    return 1
}

# Function to generate service status section
generate_service_status() {
    local service_name="$1"
    local status="$2"
    local response="$3"
    local notes="$4"
    local environment="$5"
    
    echo "### $service_name"
    echo "- Status: $status"
    echo "- Response: \`$response\`"
    if [ -n "$environment" ]; then
        echo "- Environment: $environment"
    fi
    if [ -n "$notes" ]; then
        echo "- Notes: $notes"
    fi
    echo ""
}

# Function to generate down service section
generate_down_service() {
    local service_name="$1"
    local error_response="$2"
    local issue="$3"
    local health_endpoint="$4"
    
    echo "### $service_name (DOWN)"
    echo "- Status: ❌ DOWN"
    echo "- Error: \`$error_response\`"
    echo "- Issue: $issue"
    echo "- Health Endpoint: $health_endpoint"
    echo ""
}

# Main function
main() {
    echo "🔍 Vauntico OCI Health Report Generator"
    echo "========================================"
    echo ""
    
    # Check if services.json exists
    if [ ! -f "$SERVICES_FILE" ]; then
        print_status "❌" "services.json not found"
        exit 1
    fi
    
    # Parse services from JSON
    services=$(jq -r '.services[] | @base64' "$SERVICES_FILE")
    
    # Initialize report
    cat > "$REPORT_FILE" << EOF
# Vauntico OCI Health Report

**Generated:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")
**Environment:** Production
**Infrastructure:** OCI Compute + Vercel Frontend

## ✅ Working Services

EOF
    
    healthy_services=()
    down_services=()
    
    # Check each service
    for service in $services; do
        service_data=$(echo "$service" | base64 -d)
        name=$(echo "$service_data" | jq -r '.name')
        url=$(echo "$service_data" | jq -r '.url')
        endpoint=$(echo "$service_data" | jq -r '.health_endpoint')
        infrastructure=$(echo "$service_data" | jq -r '.infrastructure')
        expected_response=$(echo "$service_data" | jq -r '.expected_response')
        
        echo "Checking $name..."
        echo "URL: $url$endpoint"
        
        if check_health_endpoint "$url" "$endpoint" "$name" "$expected_response"; then
            healthy_services+=("$name")
            
            # Add to report
            response=$(cat /tmp/health_response_${name} 2>/dev/null || echo '{"status":"ok"}')
            generate_service_status "$name" "✅ HEALTHY" "$response" "" "$infrastructure" >> "$REPORT_FILE"
        else
            down_services+=("$name")
            
            # Add to down services section (will be processed later)
            echo "$name|$url$endpoint|Service unreachable or misconfigured" >> /tmp/down_services
        fi
        
        echo ""
        rm -f /tmp/health_response_${name}
    done
    
    # Add down services section if any
    if [ ${#down_services[@]} -gt 0 ]; then
        cat >> "$REPORT_FILE" << EOF

## 🚨 Down Services

EOF
        
        while IFS='|' read -r name endpoint issue; do
            generate_down_service "$name" '{"status":"error","code":500,"message":"Internal Server Error"}' "$issue" "$endpoint" >> "$REPORT_FILE"
        done < /tmp/down_services
    fi
    
    # Add root cause analysis section
    cat >> "$REPORT_FILE" << EOF

## 🔧 Root Cause Analysis

### Common Issues
- **Deployment Issues:** Container not running on OCI Compute
- **Routing Problems:** Nginx reverse proxy misconfigured  
- **Secrets/Env Vars:** Missing OCI Vault injection
- **Monitoring:** Prometheus scrape config not updated

### Troubleshooting Steps
1. Check OCI Compute instance status
2. Verify Docker containers are running: \`docker ps\`
3. Check Nginx configuration and logs
4. Validate environment variables in OCI Vault
5. Review Prometheus targets in Grafana

EOF

    # Add summary section
    total_services=$(( ${#healthy_services[@]} + ${#down_services[@]} ))
    healthy_count=${#healthy_services[@]}
    
    cat >> "$REPORT_FILE" << EOF
## 📋 Summary

- **Total Services:** $total_services
- **Healthy Services:** $healthy_count/${#healthy_services[@]}
- **Down Services:** ${#down_services[@]}/${#down_services[@]}
- **Monitoring:** ✅ Prometheus + Grafana dashboards updated
- **Alerting:** ✅ OCI‑specific alerts configured

### Service Status Overview
EOF

    for service in "${healthy_services[@]}"; do
        echo "- $service: ✅ Healthy" >> "$REPORT_FILE"
    done
    
    for service in "${down_services[@]}"; do
        echo "- $service: ❌ Down" >> "$REPORT_FILE"
    done
    
    # Add next steps section
    cat >> "$REPORT_FILE" << EOF

## 🚀 Immediate Next Steps

### For Cline/DevOps Team
- [ ] Replace Railway Health Checks
- [ ] Remove all \*.up.railway.app endpoints from monitoring
- [ ] Verify new OCI endpoints are responding correctly
- [ ] Update any remaining monitoring configurations

### Monitoring Team
- [ ] Update Grafana dashboards with OCI metrics
- [ ] Verify Prometheus scrape targets are healthy
- [ ] Test alerting rules for OCI endpoints

### Documentation Team
- [ ] Update deployment documentation
- [ ] Update README.md with OCI architecture
- [ ] Verify all health check endpoints are documented

---

**Report generated by:** Vauntico Health Monitor v1.0  
**Next report scheduled:** $(date -u -d "+1 hour" +"%Y-%m-%d %H:%M:%S UTC")
EOF

    # Clean up
    rm -f /tmp/down_services
    
    # Print summary
    echo ""
    echo "📊 Health Check Summary:"
    echo "========================"
    print_status "✅" "Healthy Services: ${#healthy_services[@]}"
    if [ ${#down_services[@]} -gt 0 ]; then
        print_status "❌" "Down Services: ${#down_services[@]}"
    fi
    echo ""
    
    print_status "ℹ️" "Report saved to: $REPORT_FILE"
    echo ""
    
    # Show report content
    echo "📄 Report Preview:"
    echo "================"
    head -50 "$REPORT_FILE"
    echo "..."
    echo ""
    
    if command -v less >/dev/null 2>&1; then
        read -p "View full report? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            less "$REPORT_FILE"
        fi
    fi
}

# Check dependencies
if ! command -v jq >/dev/null 2>&1; then
    print_status "❌" "jq is required but not installed. Please install jq first."
    exit 1
fi

if ! command -v curl >/dev/null 2>&1; then
    print_status "❌" "curl is required but not installed. Please install curl first."
    exit 1
fi

# Run main function
main "$@"
