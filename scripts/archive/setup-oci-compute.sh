#!/bin/bash

# ============================================================================
# Vauntico MVP - OCI Compute Bootstrap Script
# ============================================================================
# This script provisions compute instances on the OCI infrastructure
# including Always Free VMs with pre-configured SSH keys and cloud-init
#
# Prerequisites:
# - OCI infrastructure must be set up (run setup-oci-infrastructure.sh first)
# - SSH keys generated and available
# - Proper IAM permissions for compute instances
# ============================================================================

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration variables
COMPARTMENT_ID=""
PUBLIC_SUBNET_ID=""
SSH_PUBLIC_KEY=""
SSH_PRIVATE_KEY=""
INSTANCE_SHAPE="VM.Standard.A1.Flex" # Always Free eligible
INSTANCE_OCPUS="1"
INSTANCE_MEMORY="6" # GB
INSTANCE_DISPLAY_NAME="vauntico-mvp-bastion"
AVAILABILITY_DOMAIN=""

# Variables to store created resource OCIDs
INSTANCE_ID=""
PUBLIC_IP=""

# Logging functions
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

# Check if infrastructure exists
check_infrastructure() {
    log "Checking if OCI infrastructure exists..."
    
    if [[ -z "$COMPARTMENT_ID" ]]; then
        echo "Available compartments:"
        oci iam compartment list --query "data[*].{Name:name, ID:id}" --output table
        read -p "Enter your Vauntico-MVP Compartment OCID: " COMPARTMENT_ID
        
        if [[ -z "$COMPARTMENT_ID" ]]; then
            error "Compartment ID is required"
        fi
    fi
    
    # Check for existing VCN and subnets
    VCN_ID=$(oci network vcn list --compartment-id "$COMPARTMENT_ID" --display-name "Vauntico-MVP-VCN" --query 'data[0].id' --raw-output 2>/dev/null || echo "")
    
    if [[ -z "$VCN_ID" ]]; then
        error "Vauntico-MVP VCN not found. Please run setup-oci-infrastructure.sh first"
    fi
    
    PUBLIC_SUBNET_ID=$(oci network subnet list --compartment-id "$COMPARTMENT_ID" --vcn-id "$VCN_ID" --display-name "Vauntico-MVP-Public-Subnet" --query 'data[0].id' --raw-output 2>/dev/null || echo "")
    
    if [[ -z "$PUBLIC_SUBNET_ID" ]]; then
        error "Vauntico-MVP Public Subnet not found. Please run setup-oci-infrastructure.sh first"
    fi
    
    success "Infrastructure validation passed"
}

# Get availability domain
get_availability_domain() {
    log "Getting availability domain..."
    
    AVAILABILITY_DOMAIN=$(oci iam availability-domain list --compartment-id "$COMPARTMENT_ID" --query 'data[0].name' --raw-output)
    
    if [[ -z "$AVAILABILITY_DOMAIN" ]]; then
        error "No availability domains found in compartment"
    fi
    
    success "Using availability domain: $AVAILABILITY_DOMAIN"
}

# Handle SSH keys
setup_ssh_keys() {
    log "Setting up SSH keys..."
    
    # Check for existing SSH keys
    if [[ -f "$HOME/.ssh/id_rsa.pub" ]]; then
        SSH_PUBLIC_KEY=$(cat "$HOME/.ssh/id_rsa.pub")
        SSH_PRIVATE_KEY="$HOME/.ssh/id_rsa"
        log "Using existing SSH keys from ~/.ssh/id_rsa"
    elif [[ -f "$HOME/.ssh/id_ed25519.pub" ]]; then
        SSH_PUBLIC_KEY=$(cat "$HOME/.ssh/id_ed25519.pub")
        SSH_PRIVATE_KEY="$HOME/.ssh/id_ed25519"
        log "Using existing SSH keys from ~/.ssh/id_ed25519"
    else
        log "No SSH keys found. Generating new key pair..."
        ssh-keygen -t rsa -b 4096 -f "$HOME/.ssh/vauntico_oci_key" -N "" -C "vauntico-oci-key"
        SSH_PUBLIC_KEY=$(cat "$HOME/.ssh/vauntico_oci_key.pub")
        SSH_PRIVATE_KEY="$HOME/.ssh/vauntico_oci_key"
        success "Generated new SSH keys: ~/.ssh/vauntico_oci_key"
    fi
    
    log "Public key: ${SSH_PUBLIC_KEY:0:50}..."
}

# Create cloud-init user data
create_cloud_init() {
    log "Creating cloud-init configuration..."
    
    cat > vauntico-cloud-init.yaml << 'EOF'
#cloud-config
package_update: true
package_upgrade: true
packages:
  - git
  - curl
  - wget
  - htop
  - docker.io
  - docker-compose
  - nodejs
  - npm

runcmd:
  - systemctl enable docker
  - systemctl start docker
  - usermod -aG docker ubuntu
  - git clone https://github.com/Tygertbone/vauntico-server.git /opt/vauntico-server
  - cd /opt/vauntico-server
  - npm install
  - mkdir -p /opt/vauntico-data
  - chmod 755 /opt/vauntico-data

write_files:
  - path: /etc/motd
    content: |
      ╔══════════════════════════════════════════════════════════════╗
      ║                                                              ║
      ║    🚀 Welcome to Vauntico MVP Server on OCI! 🚀               ║
      ║                                                              ║
      ║    This server is pre-configured for Vauntico development:    ║
      ║    • Docker installed and running                           ║
      ║    • Git repository cloned: /opt/vauntico-server            ║
      ║    • Data directory: /opt/vauntico-data                     ║
      ║                                                              ║
      ║    Next steps:                                               ║
      ║    1. Configure environment variables                          ║
      ║    2. Start the application services                         ║
      ║    3. Set up monitoring and backups                           ║
      ║                                                              ║
      ╚══════════════════════════════════════════════════════════════╝
    permissions: '0644'

  - path: /opt/vauntico-server/.env.example
    content: |
      # Vauntico MVP Environment Configuration
      # Copy this file to .env and fill in your values
      
      # Database Configuration
      DATABASE_URL="postgresql://username:password@localhost:5432/vauntico"
      
      # Redis Configuration
      REDIS_URL="redis://localhost:6379"
      
      # API Keys (store in OCI Vault for production)
      ANTHROPIC_API_KEY="your-anthropic-api-key"
      RESEND_API_KEY="your-resend-api-key"
      PAYSTACK_SECRET_KEY="your-paystack-secret-key"
      
      # Application Settings
      NODE_ENV="production"
      PORT=3000
      
      # OCI Settings
      OCI_COMPARTMENT_ID="your-compartment-id"
      OCI_REGION="us-ashburn-1"
    permissions: '0644'

users:
  - name: vauntico
    groups: sudo, docker
    shell: /bin/bash
    sudo: ALL=(ALL) NOPASSWD:ALL
    ssh_authorized_keys:
      - PLACEHOLDER_PUBLIC_KEY
EOF
    
    # Replace placeholder with actual public key
    sed -i "s|PLACEHOLDER_PUBLIC_KEY|$SSH_PUBLIC_KEY|g" vauntico-cloud-init.yaml
    
    success "Cloud-init configuration created"
}

# Create compute instance
create_compute_instance() {
    log "Creating compute instance..."
    
    INSTANCE_OUTPUT=$(oci compute instance launch \
        --compartment-id "$COMPARTMENT_ID" \
        --availability-domain "$AVAILABILITY_DOMAIN" \
        --subnet-id "$PUBLIC_SUBNET_ID" \
        --display-name "$INSTANCE_DISPLAY_NAME" \
        --shape "$INSTANCE_SHAPE" \
        --shape-config '{"ocpus":"'${INSTANCE_OCPUS}'","memoryInGBs":"'${INSTANCE_MEMORY}'"}' \
        --assign-public-ip true \
        --ssh-authorized-keys-file "$SSH_PUBLIC_KEY" \
        --user-data-file vauntico-cloud-init.yaml \
        --wait-for-state RUNNING \
        --query 'data.id' \
        --raw-output 2>&1)
    
    if [[ $? -ne 0 ]]; then
        error "Failed to create compute instance: $INSTANCE_OUTPUT"
    fi
    
    INSTANCE_ID="$INSTANCE_OUTPUT"
    success "Compute instance created: $INSTANCE_ID"
    
    # Wait a bit for the instance to fully initialize
    log "Waiting for instance to fully initialize..."
    sleep 30
    
    # Get public IP
    PUBLIC_IP=$(oci compute instance list-vnics \
        --instance-id "$INSTANCE_ID" \
        --query 'data[0].publicIp' \
        --raw-output 2>/dev/null || echo "")
    
    if [[ -z "$PUBLIC_IP" ]]; then
        warning "Public IP not immediately available. Please check OCI console."
    else
        success "Public IP assigned: $PUBLIC_IP"
    fi
}

# Test SSH connection
test_ssh_connection() {
    if [[ -n "$PUBLIC_IP" ]]; then
        log "Testing SSH connection to $PUBLIC_IP..."
        
        # Wait for SSH to be available
        for i in {1..30}; do
            if ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 -i "$SSH_PRIVATE_KEY" ubuntu@"$PUBLIC_IP" "echo 'SSH connection successful'" 2>/dev/null; then
                success "SSH connection established successfully"
                return 0
            fi
            log "Waiting for SSH service... (attempt $i/30)"
            sleep 10
        done
        
        warning "SSH connection test failed. Please check the instance manually."
    else
        warning "Cannot test SSH connection without public IP"
    fi
}

# Generate connection summary
generate_connection_summary() {
    log "Generating connection summary..."
    
    SUMMARY_FILE="oci-compute-summary-$(date +%Y%m%d-%H%M%S).txt"
    
    cat > "$SUMMARY_FILE" << EOF
 ============================================================================
 Vauntico MVP - Compute Instance Setup Summary
 ============================================================================
 Created on: $(date)
 Compartment ID: $COMPARTMENT_ID
 
 INSTANCE DETAILS:
 ----------------
 Instance Name: $INSTANCE_DISPLAY_NAME
 Instance ID: $INSTANCE_ID
 Shape: $INSTANCE_SHAPE
 OCPUs: $INSTANCE_OCPUS
 Memory: ${INSTANCE_MEMORY}GB
 Availability Domain: $AVAILABILITY_DOMAIN
 Public Subnet: $PUBLIC_SUBNET_ID
 Public IP: $PUBLIC_IP
 
 SSH ACCESS:
 -----------
 SSH Command: ssh -i $SSH_PRIVATE_KEY ubuntu@$PUBLIC_IP
 Private Key: $SSH_PRIVATE_KEY
 Public Key: $SSH_PUBLIC_KEY
 
 INSTALLED SOFTWARE:
 ------------------
 • Docker & Docker Compose
 • Node.js & npm
 • Git
 • Basic utilities (curl, wget, htop)
 
 VAUNTICO SETUP:
 ---------------
 Repository: /opt/vauntico-server
 Data Directory: /opt/vauntico-data
 Environment File: /opt/vauntico-server/.env.example
 
 NEXT STEPS:
 -----------
 1. SSH into the instance
 2. Copy and configure .env file:
    cp /opt/vauntico-server/.env.example /opt/vauntico-server/.env
 3. Fill in your API keys and database credentials
 4. Start the application:
    cd /opt/vauntico-server && npm start
 5. Configure monitoring and backups
 6. Set up firewall rules if needed
 
 CLEANUP COMMAND (if needed):
 ---------------------------
 oci compute instance terminate --instance-id $INSTANCE_ID --force
 ============================================================================
EOF
    
    success "Compute summary saved to: $SUMMARY_FILE"
    
    # Display summary to console
    log "COMPUTE INSTANCE SETUP COMPLETED!"
    echo ""
    echo "Instance Details:"
    echo "  Name: $INSTANCE_DISPLAY_NAME"
    echo "  ID: $INSTANCE_ID"
    echo "  Public IP: $PUBLIC_IP"
    echo "  SSH: ssh -i $SSH_PRIVATE_KEY ubuntu@$PUBLIC_IP"
    echo ""
    echo "Next Steps:"
    echo "  1. SSH: ssh -i $SSH_PRIVATE_KEY ubuntu@$PUBLIC_IP"
    echo "  2. Configure environment variables"
    echo "  3. Start Vauntico services"
    echo ""
    echo "Full summary saved to: $SUMMARY_FILE"
}

# Main execution function
main() {
    log "Starting Vauntico MVP Compute Instance Setup..."
    echo ""
    
    check_infrastructure
    get_availability_domain
    setup_ssh_keys
    create_cloud_init
    create_compute_instance
    test_ssh_connection
    generate_connection_summary
    
    success "🎉 Vauntico MVP compute instance setup completed successfully!"
    echo ""
    log "Your Vauntico MVP server is ready for deployment!"
}

# Script execution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
