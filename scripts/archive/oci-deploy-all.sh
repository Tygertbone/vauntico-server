#!/bin/bash

# ============================================================================
# Vauntico MVP - OCI Deployment Script
# ============================================================================
# This script deploys all backend services to OCI Compute instances
# using Docker Compose and configures the load balancer
#
# Prerequisites:
# - OCI CLI installed and configured
# - Docker installed on local machine
# - Valid OCI credentials with appropriate permissions
# - OCI infrastructure already provisioned
# ============================================================================

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT="${ENVIRONMENT:-prod}"
COMPARTMENT_ID="${COMPARTMENT_ID:-}"
OCI_INSTANCE_IP="${OCI_INSTANCE_IP:-}"
SSH_USER="${SSH_USER:-ubuntu}"
SSH_KEY_PATH="${SSH_KEY_PATH:-~/.ssh/oci-vauntico}"

# Services to deploy
SERVICES=(
    "server-v2"
    "vauntico-fulfillment-engine" 
    "vault-landing"
)

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

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if OCI CLI is installed
    if ! command -v oci &> /dev/null; then
        error "OCI CLI is not installed. Please install it first."
    fi
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install it first."
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed. Please install it first."
    fi
    
    # Check if SSH key exists
    if [[ ! -f "$SSH_KEY_PATH" ]]; then
        warning "SSH key not found at $SSH_KEY_PATH. You'll need to set up SSH access to your OCI instance."
    fi
    
    success "Prerequisites check completed"
}

# Validate inputs
validate_inputs() {
    log "Validating inputs..."
    
    if [[ -z "$COMPARTMENT_ID" ]]; then
        error "COMPARTMENT_ID environment variable is required"
    fi
    
    if [[ -z "$OCI_INSTANCE_IP" ]]; then
        error "OCI_INSTANCE_IP environment variable is required"
    fi
    
    # Validate compartment ID format
    if [[ ! "$COMPARTMENT_ID" =~ ^ocid1\.compartment\. ]]; then
        error "Invalid compartment ID format"
    fi
    
    success "Input validation completed"
}

# Test SSH connection
test_ssh_connection() {
    log "Testing SSH connection to OCI instance..."
    
    if [[ ! -f "$SSH_KEY_PATH" ]]; then
        error "SSH key not found at $SSH_KEY_PATH. Cannot proceed with deployment."
    fi
    
    if ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 -i "$SSH_KEY_PATH" "$SSH_USER@$OCI_INSTANCE_IP" "echo 'SSH connection successful'" 2>/dev/null; then
        success "SSH connection successful"
    else
        error "Failed to connect to OCI instance via SSH. Please check your SSH key and instance IP."
    fi
}

# Build Docker images
build_docker_images() {
    log "Building Docker images for all services..."
    
    for service in "${SERVICES[@]}"; do
        log "Building Docker image for $service..."
        
        case $service in
            "server-v2")
                docker build -f Dockerfile.trust-score -t vauntico-$service:latest .
                ;;
            "vauntico-fulfillment-engine")
                docker build -f Dockerfile.fulfillment-engine -t vauntico-$service:latest .
                ;;
            "vault-landing")
                docker build -f Dockerfile.vauntico-server -t vauntico-$service:latest .
                ;;
        esac
        
        if [[ $? -eq 0 ]]; then
            success "Built Docker image for $service"
        else
            error "Failed to build Docker image for $service"
        fi
    done
}

# Push Docker images to OCI Container Registry
push_docker_images() {
    log "Pushing Docker images to OCI Container Registry..."
    
    # Get OCI region and tenancy
    OCI_REGION=$(oci iam compartment get --compartment-id "$COMPARTMENT_ID" --query 'data."compartment-id"' --raw-output | cut -d'.' -f4)
    TENANCY=$(oci iam user get --user-id "$(oci iam user list --query 'data[0].id' --raw-output)" --query 'data.name' --raw-output)
    
    REGISTRY_ENDPOINT="${TENANCY}.ocir.io"
    
    # Login to OCI Container Registry
    log "Logging into OCI Container Registry..."
    echo "$(oci iam authtoken create --user-id "$(oci iam user list --query 'data[0].id' --raw-output)" --description 'Vauntico deployment token' --query 'data.token' --raw-output)" | docker login $REGISTRY_ENDPOINT -u "$(oci iam user list --query 'data[0].name' --raw-output)" --password-stdin
    
    for service in "${SERVICES[@]}"; do
        log "Pushing Docker image for $service..."
        
        # Tag image for OCI registry
        docker tag vauntico-$service:latest $REGISTRY_ENDPOINT/vauntico/$service:latest
        
        # Push to registry
        docker push $REGISTRY_ENDPOINT/vauntico/$service:latest
        
        if [[ $? -eq 0 ]]; then
            success "Pushed Docker image for $service to OCI registry"
        else
            error "Failed to push Docker image for $service to OCI registry"
        fi
    done
}

# Deploy to OCI instance
deploy_to_oci() {
    log "Deploying services to OCI instance..."
    
    # Create deployment directory
    ssh -i "$SSH_KEY_PATH" "$SSH_USER@$OCI_INSTANCE_IP" "mkdir -p ~/vauntico-deployment"
    
    # Copy docker-compose.yml and configuration files
    scp -i "$SSH_KEY_PATH" docker-compose.yml "$SSH_USER@$OCI_INSTANCE_IP:~/vauntico-deployment/"
    scp -i "$SSH_KEY_PATH" nginx/nginx.conf "$SSH_USER@$OCI_INSTANCE_IP:~/vauntico-deployment/"
    scp -i "$SSH_KEY_PATH" -r nginx/conf.d "$SSH_USER@$OCI_INSTANCE_IP:~/vauntico-deployment/"
    scp -i "$SSH_KEY_PATH" monitoring/prometheus.yml "$SSH_USER@$OCI_INSTANCE_IP:~/vauntico-deployment/"
    scp -i "$SSH_KEY_PATH" monitoring/alertmanager.yml "$SSH_USER@$OCI_INSTANCE_IP:~/vauntico-deployment/"
    
    # Update docker-compose.yml with OCI registry URLs
    ssh -i "$SSH_KEY_PATH" "$SSH_USER@$OCI_INSTANCE_IP" "
        cd ~/vauntico-deployment
        sed -i 's|build:.*|image: ${REGISTRY_ENDPOINT}/vauntico/\${SERVICE}:latest|g' docker-compose.yml
    "
    
    # Deploy using docker-compose
    ssh -i "$SSH_KEY_PATH" "$SSH_USER@$OCI_INSTANCE_IP" "
        cd ~/vauntico-deployment
        
        # Stop existing containers
        docker-compose down 2>/dev/null || true
        
        # Pull latest images
        docker-compose pull
        
        # Start services
        docker-compose up -d
        
        # Wait for services to be healthy
        sleep 30
        
        # Check service health
        docker-compose ps
    "
    
    if [[ $? -eq 0 ]]; then
        success "Services deployed successfully to OCI instance"
    else
        error "Failed to deploy services to OCI instance"
    fi
}

# Configure OCI Load Balancer
configure_load_balancer() {
    log "Configuring OCI Load Balancer..."
    
    # Get instance details
    INSTANCE_ID=$(oci compute instance list --compartment-id "$COMPARTMENT_ID" --query "data[?\"public-ip\"=='$OCI_INSTANCE_IP'].id | [0]" --raw-output)
    
    if [[ -z "$INSTANCE_ID" ]]; then
        error "Could not find OCI instance with IP: $OCI_INSTANCE_IP"
    fi
    
    # Create load balancer
    LB_NAME="vauntico-api-lb"
    LB_SHAPE="flexible"
    
    # Check if load balancer already exists
    LB_ID=$(oci lb load-balancer list --compartment-id "$COMPARTMENT_ID" --query "data[?\"display-name\"=='$LB_NAME'].id | [0]" --raw-output)
    
    if [[ -z "$LB_ID" ]]; then
        log "Creating new load balancer..."
        
        # Get subnet IDs
        SUBNET_ID=$(oci network subnet list --compartment-id "$COMPARTMENT_ID" --query "data[0].id" --raw-output)
        
        LB_ID=$(oci lb load-balancer create \
            --compartment-id "$COMPARTMENT_ID" \
            --display-name "$LB_NAME" \
            --shape-name "$LB_SHAPE" \
            --subnet-ids '["'"$SUBNET_ID"'"]' \
            --is-private false \
            --shape-details '{"minimumBandwidthInMbps":10,"maximumBandwidthInMbps":100}' \
            --wait-for-state AVAILABLE \
            --query 'data.id' \
            --raw-output)
        
        success "Created load balancer: $LB_ID"
    else
        success "Using existing load balancer: $LB_ID"
    fi
    
    # Create backend set
    BACKEND_SET_NAME="vauntico-backend-set"
    
    oci lb backend-set create \
        --load-balancer-id "$LB_ID" \
        --backend-set-name "$BACKEND_SET_NAME" \
        --policy "ROUND_ROBIN" \
        --health-check-protocol "HTTP" \
        --health-check-port "80" \
        --health-check-return-code "200" \
        --health-check-url-path "/health" \
        --health-check-interval-millis 10000 \
        --health-check-timeout-millis 3000 \
        --health-check-retries 3
    
    # Add instance to backend set
    oci lb backend create \
        --load-balancer-id "$LB_ID" \
        --backend-set-name "$BACKEND_SET_NAME" \
        --instance-id "$INSTANCE_ID" \
        --port 80 \
        --backup false \
        --drain false \
        --offline false \
        --weight 1
    
    # Create listener
    oci lb listener create \
        --load-balancer-id "$LB_ID" \
        --listener-name "vauntico-listener" \
        --default-backend-set-name "$BACKEND_SET_NAME" \
        --port 80 \
        --protocol "HTTP"
    
    # Get load balancer public IP
    LB_IP=$(oci lb load-balancer get --load-balancer-id "$LB_ID" --query 'data.ip-addresses[0].ip-address' --raw-output)
    
    success "Load balancer configured with public IP: $LB_IP"
    log "Update your DNS to point api.vauntico.com to: $LB_IP"
}

# Verify deployment
verify_deployment() {
    log "Verifying deployment..."
    
    # Wait for services to start
    log "Waiting for services to initialize..."
    sleep 60
    
    # Check service health via SSH
    ssh -i "$SSH_KEY_PATH" "$SSH_USER@$OCI_INSTANCE_IP" "
        cd ~/vauntico-deployment
        
        # Check container status
        echo '=== Container Status ==='
        docker-compose ps
        
        echo ''
        echo '=== Service Health Checks ==='
        
        # Check individual services
        for port in 3001 5000; do
            if curl -f -s http://localhost:\$port/health > /dev/null; then
                echo \"✅ Service on port \$port is healthy\"
            else
                echo \"❌ Service on port \$port is not responding\"
            fi
        done
    "
    
    # Test load balancer (if DNS is configured)
    if dig +short api.vauntico.com | grep -q "^[0-9]\+\.[0-9]\+\.[0-9]\+\.[0-9]\+$"; then
        log "Testing load balancer endpoint..."
        
        for service in "${SERVICES[@]}"; do
            if curl -f -s "https://api.vauntico.com/$service/health" > /dev/null; then
                success "✅ $service is accessible via load balancer"
            else
                warning "⚠️ $service is not yet accessible via load balancer"
            fi
        done
    else
        warning "DNS not yet configured for api.vauntico.com. Please update your DNS records."
    fi
}

# Generate deployment summary
generate_summary() {
    log "Generating deployment summary..."
    
    SUMMARY_FILE="oci-deployment-summary-$(date +%Y%m%d-%H%M%S).json"
    
    # Get load balancer IP if it exists
    LB_IP=$(oci lb load-balancer list --compartment-id "$COMPARTMENT_ID" --query "data[?\"display-name\"=='vauntico-api-lab'] | [0].\"ip-addresses\" | [0].\"ip-address\"" --raw-output 2>/dev/null || echo "pending")
    
    cat > "$SUMMARY_FILE" << EOF
{
  "deployment": {
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "environment": "$ENVIRONMENT",
    "infrastructure": "OCI",
    "instance_ip": "$OCI_INSTANCE_IP",
    "load_balancer_ip": "$LB_IP"
  },
  "services": [
EOF

    for service in "${SERVICES[@]}"; do
        echo "    {\"name\": \"$service\", \"status\": \"deployed\", \"registry\": \"ocir.io\"}," >> "$SUMMARY_FILE"
    done
    
    sed -i '$ s/,$//' "$SUMMARY_FILE"  # Remove trailing comma
    
    cat >> "$SUMMARY_FILE" << EOF
  ],
  "next_steps": [
    "Update DNS: api.vauntico.com → $LB_IP",
    "Configure SSL certificates",
    "Update monitoring dashboards",
    "Test all endpoints",
    "Update documentation"
  ],
  "rollback_instructions": "Use scripts/oci-rollback.sh if needed"
}
EOF
    
    success "Deployment summary saved to: $SUMMARY_FILE"
}

# Main execution
main() {
    log "Starting Vauntico MVP OCI deployment..."
    echo ""
    
    check_prerequisites
    validate_inputs
    test_ssh_connection
    build_docker_images
    push_docker_images
    deploy_to_oci
    configure_load_balancer
    verify_deployment
    generate_summary
    
    success "🎉 Vauntico MVP OCI deployment completed successfully!"
    echo ""
    log "Next steps:"
    echo "  1. Update DNS: api.vauntico.com → your load balancer IP"
    echo "  2. Configure SSL certificates"
    echo "  3. Test all service endpoints"
    echo "  4. Update monitoring dashboards"
    echo "  5. Review deployment summary"
}

# Script execution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
