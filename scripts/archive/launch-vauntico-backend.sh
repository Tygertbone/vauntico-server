#!/bin/bash

# Vauntico MVP - Backend Deployment Script
# Automated OCI launch with architecture compatibility fix

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Vauntico MVP Backend Deployment${NC}"
echo -e "${BLUE}=====================================${NC}"
echo ""

# Configuration
echo -e "${YELLOW}📋 Configuration Setup${NC}"

# Check if OCI CLI is installed
if ! command -v oci &> /dev/null; then
    echo -e "${RED}❌ OCI CLI not found. Please install OCI CLI first.${NC}"
    echo "Visit: https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliinstall.htm"
    exit 1
fi

# Check if user is logged in to OCI
if ! oci iam compartment list &> /dev/null; then
    echo -e "${RED}❌ Not logged in to OCI. Please run 'oci setup config' first.${NC}"
    exit 1
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
        IMAGE_ID="ocid1.image.oc1..aaaaaaaav5jwzizh5qrurp5a5vxqkyxojowpc26flgunuzs5dq7lryvld5q"
        SHAPE_CONFIG=""
        ;;
    2)
        ARCH="arm64"
        SHAPE="VM.Standard.A1.Flex"
        IMAGE_ID="ocid1.image.oc1..aaaaaaaa6bvcdt4vfhwsx2dt522q45x3gp3rlyp62rpchw3tll54zrs3c5a"
        SHAPE_CONFIG='--shape-config '\''{"memoryInGBs": 6, "ocpus": 1}'\''
        ;;
    *)
        echo -e "${RED}❌ Invalid option. Exiting.${NC}"
        exit 1
        ;;
esac

# Deployment mode
echo ""
echo -e "${YELLOW}🚀 Deployment Mode:${NC}"
echo "1) Test single instance first"
echo "2) Deploy all 4 services"
echo -n "Select option (1-2): "
read -r deploy_mode

echo ""
echo -e "${GREEN}✅ Configuration Summary:${NC}"
echo "   Compartment ID: $COMPARTMENT_ID"
echo "   Subnet ID: $SUBNET_ID"
echo "   Availability Domain: $AVAILABILITY_DOMAIN"
echo "   Architecture: $ARCH"
echo "   Shape: $SHAPE"
echo "   SSH Key: $SSH_KEY_PATH"
echo ""

# Verify cloud-init.yaml exists
if [ ! -f "./cloud-init.yaml" ]; then
    echo -e "${RED}❌ cloud-init.yaml not found in current directory.${NC}"
    exit 1
fi

# Function to launch a single instance
launch_instance() {
    local service_name=$1
    local display_name="vauntico-$service_name-$ARCH"
    local hostname_label="$service_name-$ARCH"
    
    echo -e "${YELLOW}🚀 Launching $service_name service...${NC}"
    
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
        
        echo -e "${GREEN}✅ $service_name launched successfully!${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed to launch $service_name${NC}"
        return 1
    fi
}

# Function to get instance public IP
get_instance_ip() {
    local service_name=$1
    local display_name="vauntico-$service_name-$ARCH"
    
    # Wait a bit for instance to be fully provisioned
    sleep 10
    
    oci compute instance list \
        --compartment-id "$COMPARTMENT_ID" \
        --display-name "$display_name" \
        --query "data [0].\"public-ip\"" \
        --output raw 2>/dev/null || echo "IP_NOT_FOUND"
}

# Function to test health endpoint
test_health() {
    local ip=$1
    local port=$2
    local service=$3
    
    echo -e "${YELLOW}🔍 Testing $service health on $ip:$port...${NC}"
    
    for i in {1..5}; do
        if curl -f -s "http://$ip:$port/health" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ $service: HEALTHY${NC}"
            return 0
        else
            echo -e "${YELLOW}⏳ Attempt $i/5 - Waiting for $service to start...${NC}"
            sleep 15
        fi
    done
    
    echo -e "${RED}❌ $service: FAILED after 5 attempts${NC}"
    return 1
}

# Execute deployment
echo -e "${BLUE}🚀 Starting Deployment...${NC}"
echo ""

case $deploy_mode in
    1)
        # Test single instance
        echo -e "${YELLOW}🧪 Test Mode: Launching single instance...${NC}"
        
        if launch_instance "test"; then
            TEST_IP=$(get_instance_ip "test")
            
            if [ "$TEST_IP" != "IP_NOT_FOUND" ]; then
                echo -e "${GREEN}🌐 Test instance IP: $TEST_IP${NC}"
                
                echo -e "${YELLOW}⏳ Waiting 60 seconds for cloud-init to complete...${NC}"
                sleep 60
                
                # Test all services on the single instance
                test_health "$TEST_IP" 3000 "Trust Score"
                test_health "$TEST_IP" 3001 "Vauntico Server"
                test_health "$TEST_IP" 3002 "Fulfillment"
                test_health "$TEST_IP" 3003 "Legacy Server"
                
                echo ""
                echo -e "${GREEN}🎉 Test deployment completed!${NC}"
                echo -e "${BLUE}📋 Next Steps:${NC}"
                echo "   1. SSH into instance: ssh ubuntu@$TEST_IP"
                echo "   2. Check Docker status: docker ps"
                echo "   3. Check logs: sudo tail -f /var/log/cloud-init-output.log"
                echo "   4. If successful, run script again with option 2 for full deployment"
            else
                echo -e "${RED}❌ Failed to retrieve public IP for test instance${NC}"
            fi
        fi
        ;;
        
    2)
        # Deploy all services
        echo -e "${YELLOW}🏗️ Production Mode: Launching all 4 services...${NC}"
        
        services=("trust-score" "vauntico-server" "fulfillment" "legacy")
        instance_ips=()
        
        for service in "${services[@]}"; do
            if launch_instance "$service"; then
                echo -e "${YELLOW}⏳ Waiting 30 seconds before next launch...${NC}"
                sleep 30
            else
                echo -e "${RED}❌ Failed to launch $service. Continuing with others...${NC}"
            fi
        done
        
        echo ""
        echo -e "${YELLOW}📡 Retrieving Public IPs...${NC}"
        
        for service in "${services[@]}"; do
            ip=$(get_instance_ip "$service")
            instance_ips+=("$ip")
            
            if [ "$ip" != "IP_NOT_FOUND" ]; then
                echo -e "${GREEN}🌐 $service: $ip${NC}"
            else
                echo -e "${RED}❌ $service: IP not found${NC}"
            fi
        done
        
        echo ""
        echo -e "${YELLOW}⏳ Waiting 90 seconds for services to initialize...${NC}"
        sleep 90
        
        # Health checks
        echo ""
        echo -e "${YELLOW}🔍 Performing Health Checks...${NC}"
        
        for i in "${!services[@]}"; do
            service="${services[$i]}"
            ip="${instance_ips[$i]}"
            
            if [ "$ip" != "IP_NOT_FOUND" ]; then
                case $service in
                    "trust-score") test_health "$ip" 3000 "Trust Score" ;;
                    "vauntico-server") test_health "$ip" 3001 "Vauntico Server" ;;
                    "fulfillment") test_health "$ip" 3002 "Fulfillment" ;;
                    "legacy") test_health "$ip" 3003 "Legacy Server" ;;
                esac
            fi
        done
        
        # DNS configuration guidance
        echo ""
        echo -e "${BLUE}🌐 DNS Configuration${NC}"
        echo -e "${YELLOW}Create these A records in Cloudflare:${NC}"
        
        for i in "${!services[@]}"; do
            service="${services[$i]}"
            ip="${instance_ips[$i]}"
            
            if [ "$ip" != "IP_NOT_FOUND" ]; then
                case $service in
                    "trust-score") echo "   trust-score.vauntico.com → $ip" ;;
                    "vauntico-server") echo "   api.vauntico.com → $ip" ;;
                    "fulfillment") echo "   fulfillment.vauntico.com → $ip" ;;
                    "legacy") echo "   legacy.vauntico.com → $ip" ;;
                esac
            fi
        done
        
        echo ""
        echo -e "${GREEN}🎉 Production deployment completed!${NC}"
        ;;
esac

# Final validation
echo ""
echo -e "${BLUE}📊 Deployment Summary${NC}"
echo "=================================="

# List all instances
oci compute instance list \
    --compartment-id "$COMPARTMENT_ID" \
    --display-name "vauntico-*" \
    --query "data [*].{Name:\"display-name\", State:\"lifecycle-state\", PublicIP:\"public-ip\", Shape:\"shape\"}" \
    --output table

echo ""
echo -e "${GREEN}✅ Vauntico MVP Backend Deployment Complete!${NC}"
echo ""
echo -e "${BLUE}🎯 Next Steps:${NC}"
echo "1. Verify all services are running with health checks above"
echo "2. Configure DNS records in Cloudflare"
echo "3. Test API endpoints and integration"
echo "4. Set up monitoring and alerting"
echo "5. Perform load testing"
echo ""
echo -e "${YELLOW}📚 Useful Commands:${NC}"
echo "   List instances: oci compute instance list --compartment-id $COMPARTMENT_ID"
echo "   SSH to instance: ssh ubuntu@<PUBLIC_IP>"
echo "   Check Docker: docker ps"
echo "   View logs: sudo tail -f /var/log/cloud-init-output.log"
echo ""
echo -e "${GREEN}🚀 Mission Success: CannotParseRequest blocker bypassed!${NC}"
