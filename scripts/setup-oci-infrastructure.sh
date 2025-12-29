#!/bin/bash

# ============================================================================
# Vauntico MVP - OCI Infrastructure Setup Script
# ============================================================================
# This script sets up the complete network infrastructure for Vauntico MVP
# including VCN, subnets, gateways, route tables, and security lists
#
# Prerequisites:
# - OCI CLI installed and configured
# - Valid OCI credentials with appropriate permissions
# - Compartment OCID for Vauntico-MVP
# ============================================================================

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration variables (to be set by user)
COMPARTMENT_ID=""
VCN_CIDR="10.0.0.0/16"
PUBLIC_SUBNET_CIDR="10.0.1.0/24"
PRIVATE_SUBNET_CIDR="10.0.2.0/24"
VCN_DISPLAY_NAME="Vauntico-MVP-VCN"
PUBLIC_SUBNET_NAME="Vauntico-MVP-Public-Subnet"
PRIVATE_SUBNET_NAME="Vauntico-MVP-Private-Subnet"
IG_NAME="Vauntico-MVP-IG"
NAT_NAME="Vauntico-MVP-NAT"
PUBLIC_RT_NAME="Vauntico-MVP-Public-RT"
PRIVATE_RT_NAME="Vauntico-MVP-Private-RT"
PUBLIC_SL_NAME="Vauntico-MVP-Public-SL"

# Variables to store created resource OCIDs
VCN_ID=""
PUBLIC_SUBNET_ID=""
PRIVATE_SUBNET_ID=""
IG_ID=""
NAT_ID=""
PUBLIC_RT_ID=""
PRIVATE_RT_ID=""
PUBLIC_SL_ID=""

# Logging function
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" >&2
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Check if OCI CLI is installed and configured
check_prerequisites() {
    log "Checking prerequisites..."
    
    if ! command -v oci &> /dev/null; then
        error "OCI CLI is not installed. Please install it first: https://docs.oracle.com/en/learn/getting-started-cli/"
    fi
    
    # Check if OCI is configured
    if ! oci iam compartment list --max-items 1 &> /dev/null; then
        error "OCI CLI is not configured. Please run 'oci setup config' first."
    fi
    
    success "Prerequisites check passed"
}

# Get user input for compartment ID
get_user_input() {
    log "Getting user configuration..."
    
    if [[ -z "$COMPARTMENT_ID" ]]; then
        echo "Available compartments:"
        oci iam compartment list --query "data[*].{Name:name, ID:id}" --output table
        
        read -p "Enter your Vauntico-MVP Compartment OCID: " COMPARTMENT_ID
        
        if [[ -z "$COMPARTMENT_ID" ]]; then
            error "Compartment ID is required"
        fi
    fi
    
    # Validate compartment ID format
    if [[ ! "$COMPARTMENT_ID" =~ ^ocid1\.compartment\. ]]; then
        error "Invalid compartment ID format. Expected format: ocid1.compartment.oc1..."
    fi
    
    # Confirm configuration
    log "Configuration Summary:"
    echo "  Compartment ID: $COMPARTMENT_ID"
    echo "  VCN CIDR: $VCN_CIDR"
    echo "  Public Subnet CIDR: $PUBLIC_SUBNET_CIDR"
    echo "  Private Subnet CIDR: $PRIVATE_SUBNET_CIDR"
    echo ""
    read -p "Continue with this configuration? (y/N): " confirm
    
    if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
        error "Setup cancelled by user"
    fi
    
    success "Configuration confirmed"
}

# Step 1: Create VCN
create_vcn() {
    log "Step 1: Creating VCN..."
    
    log "Creating VCN with name: $VCN_DISPLAY_NAME"
    log "CIDR Block: $VCN_CIDR"
    
    VCN_OUTPUT=$(oci network vcn create \
        --compartment-id "$COMPARTMENT_ID" \
        --display-name "$VCN_DISPLAY_NAME" \
        --cidr-block "$VCN_CIDR" \
        --wait-for-state AVAILABLE \
        --query 'data.id' \
        --raw-output 2>&1)
    
    if [[ $? -ne 0 ]]; then
        error "Failed to create VCN: $VCN_OUTPUT"
    fi
    
    VCN_ID="$VCN_OUTPUT"
    success "VCN created successfully: $VCN_ID"
    
    # Wait a bit for the VCN to be fully available
    log "Waiting for VCN to be fully available..."
    sleep 10
}

# Step 2: Create Subnets
create_subnets() {
    log "Step 2: Creating subnets..."
    
    # Create Public Subnet
    log "Creating public subnet: $PUBLIC_SUBNET_NAME"
    PUBLIC_SUBNET_OUTPUT=$(oci network subnet create \
        --compartment-id "$COMPARTMENT_ID" \
        --vcn-id "$VCN_ID" \
        --display-name "$PUBLIC_SUBNET_NAME" \
        --cidr-block "$PUBLIC_SUBNET_CIDR" \
        --prohibit-public-ip-on-vnic false \
        --wait-for-state AVAILABLE \
        --query 'data.id' \
        --raw-output 2>&1)
    
    if [[ $? -ne 0 ]]; then
        error "Failed to create public subnet: $PUBLIC_SUBNET_OUTPUT"
    fi
    
    PUBLIC_SUBNET_ID="$PUBLIC_SUBNET_OUTPUT"
    success "Public subnet created successfully: $PUBLIC_SUBNET_ID"
    
    # Create Private Subnet
    log "Creating private subnet: $PRIVATE_SUBNET_NAME"
    PRIVATE_SUBNET_OUTPUT=$(oci network subnet create \
        --compartment-id "$COMPARTMENT_ID" \
        --vcn-id "$VCN_ID" \
        --display-name "$PRIVATE_SUBNET_NAME" \
        --cidr-block "$PRIVATE_SUBNET_CIDR" \
        --prohibit-public-ip-on-vnic true \
        --wait-for-state AVAILABLE \
        --query 'data.id' \
        --raw-output 2>&1)
    
    if [[ $? -ne 0 ]]; then
        error "Failed to create private subnet: $PRIVATE_SUBNET_OUTPUT"
    fi
    
    PRIVATE_SUBNET_ID="$PRIVATE_SUBNET_OUTPUT"
    success "Private subnet created successfully: $PRIVATE_SUBNET_ID"
    
    # Wait for subnets to be fully available
    log "Waiting for subnets to be fully available..."
    sleep 10
}

# Step 3: Create Gateways
create_gateways() {
    log "Step 3: Creating gateways..."
    
    # Create Internet Gateway
    log "Creating Internet Gateway: $IG_NAME"
    IG_OUTPUT=$(oci network internet-gateway create \
        --compartment-id "$COMPARTMENT_ID" \
        --vcn-id "$VCN_ID" \
        --display-name "$IG_NAME" \
        --is-enabled true \
        --wait-for-state AVAILABLE \
        --query 'data.id' \
        --raw-output 2>&1)
    
    if [[ $? -ne 0 ]]; then
        error "Failed to create Internet Gateway: $IG_OUTPUT"
    fi
    
    IG_ID="$IG_OUTPUT"
    success "Internet Gateway created successfully: $IG_ID"
    
    # Create NAT Gateway
    log "Creating NAT Gateway: $NAT_NAME"
    NAT_OUTPUT=$(oci network nat-gateway create \
        --compartment-id "$COMPARTMENT_ID" \
        --vcn-id "$VCN_ID" \
        --display-name "$NAT_NAME" \
        --wait-for-state AVAILABLE \
        --query 'data.id' \
        --raw-output 2>&1)
    
    if [[ $? -ne 0 ]]; then
        error "Failed to create NAT Gateway: $NAT_OUTPUT"
    fi
    
    NAT_ID="$NAT_OUTPUT"
    success "NAT Gateway created successfully: $NAT_ID"
    
    # Wait for gateways to be fully available
    log "Waiting for gateways to be fully available..."
    sleep 10
}

# Step 4: Create Route Tables
create_route_tables() {
    log "Step 4: Creating route tables..."
    
    # Create Public Route Table
    log "Creating public route table: $PUBLIC_RT_NAME"
    PUBLIC_RT_RULES="[{\"cidrBlock\":\"0.0.0.0/0\",\"networkEntityId\":\"$IG_ID\"}]"
    
    PUBLIC_RT_OUTPUT=$(oci network route-table create \
        --compartment-id "$COMPARTMENT_ID" \
        --vcn-id "$VCN_ID" \
        --display-name "$PUBLIC_RT_NAME" \
        --route-rules "$PUBLIC_RT_RULES" \
        --wait-for-state AVAILABLE \
        --query 'data.id' \
        --raw-output 2>&1)
    
    if [[ $? -ne 0 ]]; then
        error "Failed to create public route table: $PUBLIC_RT_OUTPUT"
    fi
    
    PUBLIC_RT_ID="$PUBLIC_RT_OUTPUT"
    success "Public route table created successfully: $PUBLIC_RT_ID"
    
    # Create Private Route Table
    log "Creating private route table: $PRIVATE_RT_NAME"
    PRIVATE_RT_RULES="[{\"cidrBlock\":\"0.0.0.0/0\",\"networkEntityId\":\"$NAT_ID\"}]"
    
    PRIVATE_RT_OUTPUT=$(oci network route-table create \
        --compartment-id "$COMPARTMENT_ID" \
        --vcn-id "$VCN_ID" \
        --display-name "$PRIVATE_RT_NAME" \
        --route-rules "$PRIVATE_RT_RULES" \
        --wait-for-state AVAILABLE \
        --query 'data.id' \
        --raw-output 2>&1)
    
    if [[ $? -ne 0 ]]; then
        error "Failed to create private route table: $PRIVATE_RT_OUTPUT"
    fi
    
    PRIVATE_RT_ID="$PRIVATE_RT_OUTPUT"
    success "Private route table created successfully: $PRIVATE_RT_ID"
    
    # Associate route tables with subnets
    log "Associating route tables with subnets..."
    
    # Update public subnet to use public route table
    oci network subnet update \
        --subnet-id "$PUBLIC_SUBNET_ID" \
        --route-table-id "$PUBLIC_RT_ID" \
        --force > /dev/null 2>&1
    
    # Update private subnet to use private route table
    oci network subnet update \
        --subnet-id "$PRIVATE_SUBNET_ID" \
        --route-table-id "$PRIVATE_RT_ID" \
        --force > /dev/null 2>&1
    
    success "Route tables associated with subnets"
    
    # Wait for route tables to be fully available
    log "Waiting for route tables to be fully available..."
    sleep 10
}

# Step 5: Create Security Lists
create_security_lists() {
    log "Step 5: Creating security lists..."
    
    # Create Public Subnet Security List
    log "Creating public subnet security list: $PUBLIC_SL_NAME"
    
    EGRESS_RULES='[{"destination":"0.0.0.0/0","protocol":"all"}]'
    INGRESS_RULES='[
        {"source":"0.0.0.0/0","protocol":"6","tcpOptions":{"destinationPortRange":{"min":22,"max":22}}},
        {"source":"0.0.0.0/0","protocol":"6","tcpOptions":{"destinationPortRange":{"min":80,"max":80}}},
        {"source":"0.0.0.0/0","protocol":"6","tcpOptions":{"destinationPortRange":{"min":443,"max":443}}}
    ]'
    
    PUBLIC_SL_OUTPUT=$(oci network security-list create \
        --compartment-id "$COMPARTMENT_ID" \
        --vcn-id "$VCN_ID" \
        --display-name "$PUBLIC_SL_NAME" \
        --egress-security-rules "$EGRESS_RULES" \
        --ingress-security-rules "$INGRESS_RULES" \
        --query 'data.id' \
        --raw-output 2>&1)
    
    if [[ $? -ne 0 ]]; then
        error "Failed to create public security list: $PUBLIC_SL_OUTPUT"
    fi
    
    PUBLIC_SL_ID="$PUBLIC_SL_OUTPUT"
    success "Public security list created successfully: $PUBLIC_SL_ID"
    
    # Associate security list with public subnet
    log "Associating security list with public subnet..."
    oci network subnet update \
        --subnet-id "$PUBLIC_SUBNET_ID" \
        --security-list-ids '["'"$PUBLIC_SL_ID"'"]' \
        --force > /dev/null 2>&1
    
    success "Security list associated with public subnet"
}

# Generate summary and save configuration
generate_summary() {
    log "Generating infrastructure summary..."
    
    SUMMARY_FILE="oci-infrastructure-summary-$(date +%Y%m%d-%H%M%S).txt"
    
    cat > "$SUMMARY_FILE" << EOF
 ============================================================================
 Vauntico MVP - OCI Infrastructure Setup Summary
 ============================================================================
 Created on: $(date)
 Compartment ID: $COMPARTMENT_ID
 
 RESOURCE DETAILS:
 ----------------
 VCN:
   Name: $VCN_DISPLAY_NAME
   ID: $VCN_ID
   CIDR: $VCN_CIDR
   
 Public Subnet:
   Name: $PUBLIC_SUBNET_NAME
   ID: $PUBLIC_SUBNET_ID
   CIDR: $PUBLIC_SUBNET_CIDR
   
 Private Subnet:
   Name: $PRIVATE_SUBNET_NAME
   ID: $PRIVATE_SUBNET_ID
   CIDR: $PRIVATE_SUBNET_CIDR
   
 Internet Gateway:
   Name: $IG_NAME
   ID: $IG_ID
   
 NAT Gateway:
   Name: $NAT_NAME
   ID: $NAT_ID
   
 Public Route Table:
   Name: $PUBLIC_RT_NAME
   ID: $PUBLIC_RT_ID
   
 Private Route Table:
   Name: $PRIVATE_RT_NAME
   ID: $PRIVATE_RT_ID
   
 Public Security List:
   Name: $PUBLIC_SL_NAME
   ID: $PUBLIC_SL_ID
   
 USAGE NOTES:
 ------------
 - Public subnet is configured for internet-facing resources
 - Private subnet is configured for backend services
 - SSH (port 22), HTTP (port 80), and HTTPS (port 443) are allowed in public subnet
 - Private subnet has outbound internet access through NAT Gateway
 
 NEXT STEPS:
 -----------
 1. Deploy VMs to appropriate subnets
 2. Configure application security groups if needed
 3. Set up monitoring and alerting
 4. Implement backup strategies
 
 CLEANUP COMMANDS (if needed):
 -----------------------------
 # Delete resources in reverse order of creation
 oci network security-list delete --security-list-id $PUBLIC_SL_ID --force
 oci network route-table delete --rt-id $PUBLIC_RT_ID --force
 oci network route-table delete --rt-id $PRIVATE_RT_ID --force
 oci network nat-gateway delete --nat-gateway-id $NAT_ID --force
 oci network internet-gateway delete --ig-id $IG_ID --force
 oci network subnet delete --subnet-id $PUBLIC_SUBNET_ID --force
 oci network subnet delete --subnet-id $PRIVATE_SUBNET_ID --force
 oci network vcn delete --vcn-id $VCN_ID --force
 ============================================================================
EOF
    
    success "Infrastructure summary saved to: $SUMMARY_FILE"
    
    # Display summary to console
    log "INFRASTRUCTURE SETUP COMPLETED SUCCESSFULLY!"
    echo ""
    echo "Key Resources Created:"
    echo "  VCN ID: $VCN_ID"
    echo "  Public Subnet ID: $PUBLIC_SUBNET_ID"
    echo "  Private Subnet ID: $PRIVATE_SUBNET_ID"
    echo "  Internet Gateway ID: $IG_ID"
    echo "  NAT Gateway ID: $NAT_ID"
    echo ""
    echo "Full summary saved to: $SUMMARY_FILE"
}

# Main execution function
main() {
    log "Starting Vauntico MVP OCI Infrastructure Setup..."
    echo ""
    
    check_prerequisites
    get_user_input
    create_vcn
    create_subnets
    create_gateways
    create_route_tables
    create_security_lists
    generate_summary
    
    success "🎉 Vauntico MVP infrastructure setup completed successfully!"
    echo ""
    log "Your Oracle Cloud Infrastructure is now ready for Vauntico MVP deployment!"
}

# Script execution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
