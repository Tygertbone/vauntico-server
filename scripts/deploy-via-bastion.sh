#!/bin/bash

# Vauntico Backend Deployment via OCI Bastion
# Enhanced with error handling, logging, and security

set -euo pipefail

# Configuration
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly BASTION_SSH_KEY="${HOME}/.ssh/id_rsa"
readonly OCI_USER="ubuntu"
readonly APP_NAME="vauntico-backend"
readonly APP_DIR="/home/ubuntu/$APP_NAME"
readonly SERVICE_NAME="trust-score"

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m'

# Logging functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $1${NC}"
}

# Error handling
cleanup() {
    log_warning "Cleaning up bastion session..."
    if [[ -n "${SESSION_ID:-}" ]]; then
        oci bastion session terminate --session-id "$SESSION_ID" || true
    fi
    exit 1
}

trap cleanup ERR INT TERM

# Validate prerequisites
validate_prerequisites() {
    log "Validating prerequisites..."
    
    # Check OCI CLI
    if ! command -v oci &> /dev/null; then
        log_error "OCI CLI not found. Please install it first."
        exit 1
    fi
    
    # Check SSH key
    if [[ ! -f "$BASTION_SSH_KEY" ]]; then
        log_error "SSH key not found at $BASTION_SSH_KEY"
        exit 1
    fi
    
    # Check bastion configuration
    if [[ ! -f "bastion-config.json" ]] || [[ ! -f "bastion-cidr.json" ]]; then
        log_error "Bastion configuration files not found"
        exit 1
    fi
    
    log_success "Prerequisites validated"
}

# Create bastion session
create_bastion_session() {
    log "Creating OCI Bastion session..."
    
    # Read configuration
    local bastion_config=$(cat bastion-config.json)
    local compartment_id=$(echo "$bastion_config" | jq -r '.compartment_id')
    local subnet_id=$(echo "$bastion_config" | jq -r '.subnet_id')
    
    # Create session
    local session_output
    session_output=$(oci bastion session create \
        --compartment-id "$compartment_id" \
        --subnet-id "$subnet_id" \
        --ssh-public-key-file "$BASTION_SSH_KEY.pub" \
        --target-private-ip "$(cat server-v2/.env.local | grep INSTANCE_PRIVATE_IP | cut -d'=' -f2)" \
        --target-ssh-username "$OCI_USER" \
        --target-port 22)
    
    if [[ $? -ne 0 ]]; then
        log_error "Failed to create bastion session"
        exit 1
    fi
    
    export SESSION_ID=$(echo "$session_output" | jq -r '.data.id')
    export SSH_CMD="oci bastion session connect --session-id $SESSION_ID --local-port-forwarding 3000"
    
    log_success "Bastion session created: $SESSION_ID"
    log_info "SSH Command: $SSH_CMD"
}

# Upload deployment scripts
upload_scripts() {
    log "Uploading deployment scripts..."
    
    local scripts=(
        "backend-deploy-v2-optimized.sh"
        "validate-backend-deployment.sh"
    )
    
    for script in "${scripts[@]}"; do
        log "Uploading $script..."
        
        # Upload using bastion session
        if ! echo "$SSH_CMD" -- "scp -i \"$BASTION_SSH_KEY\" -o ProxyCommand=\"oci bastion session connect --session-id $SESSION_ID\" \"$script\" ${OCI_USER}@localhost:~/"; then
            log_error "Failed to upload $script"
            return 1
        fi
        
        log_success "Uploaded $script"
    done
    
    # Make scripts executable
    log "Making scripts executable..."
    echo "$SSH_CMD" -- "ssh -i \"$BASTION_SSH_KEY\" -o ProxyCommand=\"oci bastion session connect --session-id $SESSION_ID\" \"chmod +x ~/backend-deploy-v2-optimized.sh ~/validate-backend-deployment.sh\" ${OCI_USER}@localhost" || {
        log_error "Failed to make scripts executable"
        return 1
    }
    
    log_success "Scripts uploaded and made executable"
}

# Execute deployment
execute_deployment() {
    log "Executing deployment on remote instance..."
    
    # Run deployment via bastion
    log "Running backend deployment..."
    if ! echo "$SSH_CMD" -- "ssh -i \"$BASTION_SSH_KEY\" -o ProxyCommand=\"oci bastion session connect --session-id $SESSION_ID\" \"cd ~ && ./backend-deploy-v2-optimized.sh\" ${OCI_USER}@localhost"; then
        log_error "Backend deployment failed"
        return 1
    fi
    
    log_success "Backend deployment completed"
}

# Validate deployment
validate_deployment() {
    log "Validating deployment..."
    
    # Run validation via bastion
    log "Running deployment validation..."
    if ! echo "$SSH_CMD" -- "ssh -i \"$BASTION_SSH_KEY\" -o ProxyCommand=\"oci bastion session connect --session-id $SESSION_ID\" \"cd ~ && ./validate-backend-deployment.sh http://localhost:3000\" ${OCI_USER}@localhost"; then
        log_error "Deployment validation failed"
        return 1
    fi
    
    log_success "Deployment validation completed"
}

# Display connection information
show_connection_info() {
    log "Connection Information:"
    echo ""
    echo -e "${BLUE}🔗 Direct SSH via Bastion:${NC}"
    echo -e "   Command: $SSH_CMD${NC}"
    echo ""
    echo -e "${BLUE}🌐 Service Endpoints (after deployment):${NC}"
    echo -e "   Health: http://localhost:3000/health"
    echo -e "   Status: http://localhost:3000/api/v1/status"
    echo -e "   API Docs: http://localhost:3000/api/docs"
    echo ""
}

# Cleanup function
cleanup_session() {
    log "Terminating bastion session..."
    if [[ -n "${SESSION_ID:-}" ]]; then
        oci bastion session terminate --session-id "$SESSION_ID" || true
        log_success "Bastion session terminated"
    else
        log_warning "No active session to terminate"
    fi
}

# Main function
main() {
    local action="${1:-deploy}"
    
    echo "=================================================="
    echo "🚀 Vauntico Backend Deployment via Bastion"
    echo "=================================================="
    
    case "$action" in
        "deploy")
            validate_prerequisites
            create_bastion_session
            upload_scripts
            execute_deployment
            validate_deployment
            show_connection_info
            ;;
        "connect")
            validate_prerequisites
            create_bastion_session
            show_connection_info
            ;;
        "validate")
            validate_prerequisites
            create_bastion_session
            validate_deployment
            ;;
        "cleanup")
            cleanup_session
            ;;
        "help"|"-h"|"--help")
            echo "Usage: $0 [action]"
            echo ""
            echo "Actions:"
            echo "  deploy    - Full deployment workflow"
            echo "  connect   - Create bastion session and show connection info"
            echo "  validate  - Run deployment validation"
            echo "  cleanup   - Terminate bastion session"
            echo ""
            echo "Examples:"
            echo "  $0 deploy     # Deploy backend via bastion"
            echo "  $0 connect    # Connect to bastion"
            echo "  $0 validate   # Validate deployment"
            echo "  $0 cleanup    # Clean up session"
            ;;
        *)
            log_error "Unknown action: $action"
            echo "Use '$0 --help' for usage information"
            exit 1
            ;;
    esac
}

# Help function
show_help() {
    echo "Vauntico Backend Deployment via OCI Bastion"
    echo ""
    echo "This script provides secure deployment of the Vauntico backend service"
    echo "through an OCI Bastion host, eliminating the need for open SSH ports."
    echo ""
    echo "Prerequisites:"
    echo "  - OCI CLI installed and configured"
    echo "  - SSH key pair generated"
    echo "  - Bastion configuration files present"
    echo "  - Sufficient IAM permissions"
    echo ""
    echo "Security Features:"
    echo "  - No open SSH ports required"
    echo "  - Temporary bastion sessions"
    echo "  - Encrypted tunneling"
    echo "  - Session-based access control"
    echo ""
    echo "Files Required:"
    echo "  - bastion-config.json"
    echo "  - bastion-cidr.json"
    echo "  - ~/.ssh/id_rsa (private key)"
    echo "  - ~/.ssh/id_rsa.pub (public key)"
}

# Run main function
main "$@"
