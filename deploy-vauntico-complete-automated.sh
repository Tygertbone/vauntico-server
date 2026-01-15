#!/bin/bash

# Vauntico MVP - Complete Automated Backend Deployment
# Enhanced version with Cloudflare DNS, health validation, and comprehensive logging

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Timestamp function
timestamp() {
    date '+%Y-%m-%d %H:%M:%S'
}

# Logging function
log() {
    local level=$1
    local message=$2
    local color=$3
    echo -e "${color}[$(timestamp)] [$level] $message${NC}"
    echo "[$(timestamp)] [$level] $message" >> "DEPLOYMENT_LOG_$(date +%Y%m%d_%H%M%S).log"
}

# Create reports directory
mkdir -p reports
REPORT_FILE="reports/VAUNTICO_DEPLOYMENT_REPORT_$(date +%Y%m%d_%H%M%S).md"

# Initialize report
cat > "$REPORT_FILE" << EOF
# Vauntico Backend Deployment Report
**Generated:** $(timestamp)

## Deployment Configuration
EOF

echo -e "${BLUE}🚀 Vauntico MVP Complete Automated Backend Deployment${NC}"
echo -e "${BLUE}========================================================${NC}"
echo ""

log "INFO" "Starting Vauntico automated deployment..." "$BLUE"

# Configuration
echo -e "${YELLOW}📋 Configuration Setup${NC}"
log "INFO" "Initializing configuration..." "$YELLOW"

# Check if OCI CLI is installed
if ! command -v oci &> /dev/null; then
    log "ERROR" "OCI CLI not found. Please install OCI CLI first." "$RED"
    echo "Visit: https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliinstall.htm"
    exit 1
fi

# Check if user is logged in to OCI
if ! oci iam compartment list &> /dev/null; then
    log "ERROR" "Not logged in to OCI. Please run 'oci setup config' first." "$RED"
    exit 1
fi

# Check if Cloudflare CLI is installed
if ! command -v cloudflare &> /dev/null; then
    log "WARN" "Cloudflare CLI not found. DNS records will need manual creation." "$YELLOW"
    CLOUDFLARE_AVAILABLE=false
else
    CLOUDFLARE_AVAILABLE=true
    log "INFO" "Cloudflare CLI detected." "$GREEN"
fi

# Get configuration from user or environment
if [ -z "$COMPARTMENT_ID" ]; then
    echo -e "${YELLOW}Enter your Compartment ID:${NC}"
    read -r COMPARTMENT_ID
fi

if [ -z "$SUBNET_ID" ]; then
    echo -e "${YELLOW}Enter your Subnet ID:${NC}"
    read -r SUBNET_ID
fi

if [ -z "$AVAILABILITY_DOMAIN" ]; then
    echo -e "${YELLOW}Enter your Availability Domain (e.g., Uocm:PHX-AD-1):${NC}"
    read -r AVAILABILITY_DOMAIN
fi

# Cloudflare configuration
if [ "$CLOUDFLARE_AVAILABLE" = true ]; then
    if [ -z "$CLOUDFLARE_ZONE_ID" ]; then
        echo -e "${YELLOW}Enter your Cloudflare Zone ID:${NC}"
        read -r CLOUDFLARE_ZONE_ID
    fi
    
    if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
        echo -e "${YELLOW}Enter your Cloudflare API Token:${NC}"
        read -s CLOUDFLARE_API_TOKEN
        export CLOUDFLARE_API_TOKEN
    fi
    
    if [ -z "$DOMAIN" ]; then
        echo -e "${YELLOW}Enter your domain (e.g., vauntico.com):${NC}"
        read -r DOMAIN
    fi
fi

# SSH Key setup
SSH_KEY_PATH="${SSH_KEY_PATH:-$HOME/.ssh/id_rsa.pub}"
if [ ! -f "$SSH_KEY_PATH" ]; then
    echo -e "${YELLOW}SSH key not found at $SSH_KEY_PATH. Generate one? (y/n):${NC}"
    read -r generate_key
    if [ "$generate_key" = "y" ]; then
        ssh-keygen -t rsa -b 4096 -f "$HOME/.ssh/id_rsa" -N ""
        SSH_KEY_PATH="$HOME/.ssh/id_rsa.pub"
    else
        echo -e "${YELLOW}Enter path to your SSH public key:${NC}"
        read -r SSH_KEY_PATH
    fi
fi

SSH_PUBLIC_KEY=$(cat "$SSH_KEY_PATH")

# Architecture selection
echo ""
echo -e "${YELLOW}🏗️ Choose Architecture:${NC}"
echo "1) x86 + VM.Standard.E2.1.Micro (Recommended for testing)"
echo "2) ARM64 + VM.Standard.A1.Flex (Cost-optimized)"
echo -n "Select option (1-2): "
read -r arch_choice

case $arch_choice in
    1)
        ARCH="x86"
        SHAPE="VM.Standard.E2.1.Micro"
        IMAGE_ID="${OCI_X86_IMAGE_ID:-ocid1.image.oc1..aaaaaaaav5jwzizh5qrurp5a5vxqkyxojowpc26flgunuzs5dq7lryvld5q}"
        SHAPE_CONFIG=""
        ;;
    2)
        ARCH="arm64"
        SHAPE="VM.Standard.A1.Flex"
        IMAGE_ID="${OCI_ARM64_IMAGE_ID:-ocid1.image.oc1..aaaaaaaa6bvcdt4vfhwsx2dt522q45x3gp3rlyp62rpchw3tll54zrs3c5a}"
        SHAPE_CONFIG='--shape-config '\''{"memoryInGBs": 6, "ocpus": 1}'\''
        ;;
    *)
        log "ERROR" "Invalid option. Exiting." "$RED"
        exit 1
        ;;
esac

# Save configuration to report
cat >> "$REPORT_FILE" << EOF
- **Compartment ID:** $COMPARTMENT_ID
- **Subnet ID:** $SUBNET_ID
- **Availability Domain:** $AVAILABILITY_DOMAIN
- **Architecture:** $ARCH
- **Shape:** $SHAPE
- **SSH Key Path:** $SSH_KEY_PATH
- **Cloudflare Available:** $CLOUDFLARE_AVAILABLE
EOF

if [ "$CLOUDFLARE_AVAILABLE" = true ]; then
    cat >> "$REPORT_FILE" << EOF
- **Domain:** $DOMAIN
- **Cloudflare Zone ID:** $CLOUDFLARE_ZONE_ID
EOF
fi

echo ""
log "INFO" "Configuration summary:" "$GREEN"
echo "   Compartment ID: $COMPARTMENT_ID"
echo "   Subnet ID: $SUBNET_ID"
echo "   Availability Domain: $AVAILABILITY_DOMAIN"
echo "   Architecture: $ARCH"
echo "   Shape: $SHAPE"
echo "   SSH Key: $SSH_KEY_PATH"
echo "   Cloudflare Available: $CLOUDFLARE_AVAILABLE"
if [ "$CLOUDFLARE_AVAILABLE" = true ]; then
    echo "   Domain: $DOMAIN"
fi

# Verify cloud-init.yaml exists
if [ ! -f "./cloud-init.yaml" ]; then
    log "ERROR" "cloud-init.yaml not found in current directory." "$RED"
    exit 1
fi

# Service configuration
declare -A SERVICES=(
    ["trust-score"]="3000"
    ["vauntico-server"]="3001"
    ["fulfillment"]="3002"
    ["legacy"]="3003"
)

declare -A DNS_RECORDS=(
    ["trust-score"]="trust-score"
    ["vauntico-server"]="api"
    ["fulfillment"]="fulfillment"
    ["legacy"]="legacy"
)

# Arrays to track deployment status
instance_ips=()
instance_ids=()
deployment_status=()

# Function to launch a single instance
launch_instance() {
    local service_name=$1
    local display_name="vauntico-$service_name-$ARCH"
    local hostname_label="$service_name-$ARCH"
    
    log "INFO" "Launching $service_name service..." "$YELLOW"
    
    if oci compute instance launch \
        --compartment-id "$COMPARTMENT_ID" \
        --availability-domain "$AVAILABILITY_DOMAIN" \
        --subnet-id "$SUBNET_ID" \
        --shape "$SHAPE" \
        $SHAPE_CONFIG \
        --display-name "$display_name" \
        --hostname-label "$hostname_label" \
        --source-details "{\"sourceType\": \"image\", \"imageId\": \"$IMAGE_ID\"}" \
        --ssh-authorized-keys-file "$SSH_KEY_PATH" \
        --assign-public-ip true \
        --user-data-file "./cloud-init.yaml" \
        --wait-for-state RUNNING; then
        
        log "SUCCESS" "$service_name launched successfully!" "$GREEN"
        return 0
    else
        log "ERROR" "Failed to launch $service_name" "$RED"
        return 1
    fi
}

# Function to get instance public IP and ID
get_instance_details() {
    local service_name=$1
    local display_name="vauntico-$service_name-$ARCH"
    
    # Wait a bit for instance to be fully provisioned
    sleep 10
    
    local ip=$(oci compute instance list \
        --compartment-id "$COMPARTMENT_ID" \
        --display-name "$display_name" \
        --query "data [0].\"public-ip\"" \
        --output raw 2>/dev/null || echo "IP_NOT_FOUND")
    
    local id=$(oci compute instance list \
        --compartment-id "$COMPARTMENT_ID" \
        --display-name "$display_name" \
        --query "data [0].id" \
        --output raw 2>/dev/null || echo "ID_NOT_FOUND")
    
    echo "$ip|$id"
}

# Function to create Cloudflare DNS record
create_dns_record() {
    local subdomain=$1
    local ip=$2
    local full_domain="$subdomain.$DOMAIN"
    
    if [ "$CLOUDFLARE_AVAILABLE" = false ] || [ "$ip" = "IP_NOT_FOUND" ]; then
        log "WARN" "Skipping DNS record creation for $full_domain (Cloudflare unavailable or IP not found)" "$YELLOW"
        return 1
    fi
    
    log "INFO" "Creating DNS record: $full_domain → $ip" "$CYAN"
    
    # Create A record using Cloudflare API
    local response=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        --data "{\"type\":\"A\",\"name\":\"$subdomain\",\"content\":\"$ip\",\"ttl\":300,\"proxied\":false}")
    
    if echo "$response" | grep -q '"success":true'; then
        local record_id=$(echo "$response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
        log "SUCCESS" "DNS record created for $full_domain (ID: $record_id)" "$GREEN"
        return 0
    else
        log "ERROR" "Failed to create DNS record for $full_domain: $response" "$RED"
        return 1
    fi
}

# Function to test health endpoint
test_health() {
    local ip=$1
    local port=$2
    local service=$3
    
    log "INFO" "Testing $service health on $ip:$port..." "$PURPLE"
    
    for i in {1..10}; do
        if curl -f -s --max-time 10 "http://$ip:$port/health" > /dev/null 2>&1; then
            log "SUCCESS" "$service: HEALTHY (attempt $i/10)" "$GREEN"
            return 0
        else
            log "INFO" "Attempt $i/10 - Waiting for $service to start..." "$YELLOW"
            sleep 30
        fi
    done
    
    log "ERROR" "$service: FAILED after 10 attempts" "$RED"
    return 1
}

# Function to perform comprehensive health check
perform_health_checks() {
    echo ""
    echo -e "${PURPLE}🔍 Performing Comprehensive Health Checks...${NC}"
    log "INFO" "Starting comprehensive health validation..." "$PURPLE"
    
    cat >> "$REPORT_FILE" << EOF

## Health Check Results
EOF
    
    local healthy_count=0
    local total_count=0
    
    for service_name in "${!SERVICES[@]}"; do
        local port=${SERVICES[$service_name]}
        local ip=""
        local status="FAILED"
        
        # Find the IP for this service
        for i in "${!instance_ids[@]}"; do
            if [[ "${instance_ids[$i]}" == *"vauntico-$service_name-$ARCH"* ]]; then
                ip="${instance_ips[$i]}"
                break
            fi
        done
        
        if [ "$ip" != "IP_NOT_FOUND" ] && [ "$ip" != "" ]; then
            total_count=$((total_count + 1))
            if test_health "$ip" "$port" "$service_name"; then
                status="HEALTHY"
                healthy_count=$((healthy_count + 1))
            fi
        else
            log "ERROR" "Cannot test $service_name - IP not found" "$RED"
        fi
        
        echo "| $service_name | $ip | $port | $status |" >> "$REPORT_FILE"
    done
    
    log "INFO" "Health check summary: $healthy_count/$total_count services healthy" "$GREEN"
    
    cat >> "$REPORT_FILE" << EOF

**Summary:** $healthy_count/$total_count services are healthy
EOF
}

# Execute deployment
echo ""
echo -e "${BLUE}🚀 Starting Automated Deployment...${NC}"
log "INFO" "Initiating deployment of all 4 backend instances..." "$BLUE"

cat >> "$REPORT_FILE" << EOF

## Deployment Execution
EOF

# Launch all instances in a loop
echo -e "${YELLOW}🏗️ Launching all 4 backend services...${NC}"
log "INFO" "Starting instance launch loop..." "$YELLOW"

for service_name in "${!SERVICES[@]}"; do
    log "INFO" "Processing service: $service_name" "$CYAN"
    
    if launch_instance "$service_name"; then
        log "INFO" "Waiting 30 seconds before next launch..." "$YELLOW"
        sleep 30
        
        # Get instance details
        local details=$(get_instance_details "$service_name")
        local ip=$(echo "$details" | cut -d'|' -f1)
        local id=$(echo "$details" | cut -d'|' -f2)
        
        instance_ips+=("$ip")
        instance_ids+=("$id")
        
        if [ "$ip" != "IP_NOT_FOUND" ]; then
            log "SUCCESS" "$service_name IP: $ip" "$GREEN"
            deployment_status+=("SUCCESS")
        else
            log "ERROR" "$service_name: IP not found" "$RED"
            deployment_status+=("FAILED")
        fi
        
        cat >> "$REPORT_FILE" << EOF
- **$service_name:** Launched successfully
  - IP: $ip
  - Instance ID: $id
EOF
    else
        log "ERROR" "Failed to launch $service_name" "$RED"
        instance_ips+=("IP_NOT_FOUND")
        instance_ids+=("ID_NOT_FOUND")
        deployment_status+=("FAILED")
        
        cat >> "$REPORT_FILE" << EOF
- **$service_name:** Failed to launch
EOF
    fi
done

echo ""
echo -e "${CYAN}📡 Instance Deployment Summary:${NC}"
log "INFO" "Deployment loop completed. Generating summary..." "$CYAN"

cat >> "$REPORT_FILE" << EOF

## Instance Summary
| Service | Instance ID | Public IP | Status |
|---------|-------------|-----------|--------|
EOF

for i in "${!SERVICES[@]}"; do
    service_name=$(echo "${!SERVICES[@]}" | cut -d' ' -f$((i+1)))
    if [ "$i" -lt "${#instance_ids[@]}" ]; then
        id="${instance_ids[$i]}"
        ip="${instance_ips[$i]}"
        status="${deployment_status[$i]}"
        
        if [ "$ip" != "IP_NOT_FOUND" ]; then
            echo -e "${GREEN}🌐 $service_name: $ip (${status})${NC}"
        else
            echo -e "${RED}❌ $service_name: IP not found (${status})${NC}"
        fi
        
        echo "| $service_name | $id | $ip | $status |" >> "$REPORT_FILE"
    fi
done

# Wait for cloud-init to complete
echo ""
log "INFO" "Waiting 90 seconds for cloud-init to complete..." "$YELLOW"
sleep 90

# Create DNS records
echo ""
echo -e "${CYAN}🌐 Creating Cloudflare DNS Records...${NC}"
log "INFO" "Starting DNS record creation loop..." "$CYAN"

cat >> "$REPORT_FILE" << EOF

## DNS Configuration
EOF

for service_name in "${!DNS_RECORDS[@]}"; do
    local subdomain="${DNS_RECORDS[$service_name]}"
    local ip=""
    
    # Find the IP for this service
    for i in "${!instance_ids[@]}"; do
        if [[ "${instance_ids[$i]}" == *"vauntico-$service_name-$ARCH"* ]]; then
            ip="${instance_ips[$i]}"
            break
        fi
    done
    
    if create_dns_record "$subdomain" "$ip"; then
        cat >> "$REPORT_FILE" << EOF
- **$subdomain.$DOMAIN:** → $ip ✅
EOF
    else
        cat >> "$REPORT_FILE" << EOF
- **$subdomain.$DOMAIN:** → $ip ❌ (Failed or skipped)
EOF
    fi
done

# Perform health checks
perform_health_checks

# Final validation and reporting
echo ""
echo -e "${BLUE}📊 Final Deployment Summary${NC}"
echo "=================================="

cat >> "$REPORT_FILE" << EOF

## Final Validation
EOF

# List all instances
log "INFO" "Generating final instance list..." "$BLUE"
oci compute instance list \
    --compartment-id "$COMPARTMENT_ID" \
    --display-name "vauntico-*" \
    --query "data [*].{Name:\"display-name\", State:\"lifecycle-state\", PublicIP:\"public-ip\", Shape:\"shape\"}" \
    --output table

cat >> "$REPORT_FILE" << EOF

\`\`\`
$(oci compute instance list \
    --compartment-id "$COMPARTMENT_ID" \
    --display-name "vauntico-*" \
