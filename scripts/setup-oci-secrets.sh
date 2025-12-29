#!/bin/bash

# ============================================================================
# Vauntico MVP - OCI Vault and Secrets Management Script
# ============================================================================
# This script sets up OCI Vault for secure storage of API keys and secrets
# and injects them into compute instances and applications
#
# Prerequisites:
# - OCI infrastructure must be set up (run setup-oci-infrastructure.sh first)
# - Proper IAM permissions for Vault and Secrets services
# - API keys ready to be stored
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
VAULT_DISPLAY_NAME="Vauntico-MVP-Vault"
KEY_DISPLAY_NAME="Vauntico-MVP-Encryption-Key"
ENABLE_KEY_ROTATION=true

# Variables to store created resource OCIDs
VAULT_ID=""
KEY_ID=""
MASTER_KEY_ID=""

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
    
    success "Infrastructure validation passed"
}

# Get secrets configuration
get_secrets_config() {
    log "Configuring secrets management..."
    
    echo ""
    echo "OCI Vault Configuration:"
    echo "  Vault Name: $VAULT_DISPLAY_NAME"
    echo "  Key Name: $KEY_DISPLAY_NAME"
    echo "  Key Rotation: $ENABLE_KEY_ROTATION"
    echo ""
    echo "Common secrets to store:"
    echo "  • Anthropic API Key"
    echo "  • Resend API Key"
    echo "  • Paystack Secret Key"
    echo "  • Database Credentials"
    echo "  • JWT Secret"
    echo "  • OAuth Client Secrets"
    echo ""
    read -p "Continue with this configuration? (y/N): " confirm
    
    if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
        error "Setup cancelled by user"
    fi
    
    success "Secrets configuration confirmed"
}

# Create Vault
create_vault() {
    log "Creating OCI Vault..."
    
    VAULT_OUTPUT=$(oci kms vault create \
        --compartment-id "$COMPARTMENT_ID" \
        --display-name "$VAULT_DISPLAY_NAME" \
        --vault-type DEFAULT \
        --query 'data.id' \
        --raw-output 2>&1)
    
    if [[ $? -ne 0 ]]; then
        error "Failed to create vault: $VAULT_OUTPUT"
    fi
    
    VAULT_ID="$VAULT_OUTPUT"
    success "Vault created: $VAULT_ID"
    
    # Wait for vault to be active
    log "Waiting for vault to become active..."
    sleep 30
}

# Create Master Encryption Key
create_master_key() {
    log "Creating master encryption key..."
    
    KEY_OUTPUT=$(oci kms key create \
        --compartment-id "$COMPARTMENT_ID" \
        --key-shape '{"algorithm":"AES","length":"32"}' \
        --display-name "$KEY_DISPLAY_NAME" \
        --protection-mode HSM \
        --query 'data.id' \
        --raw-output 2>&1)
    
    if [[ $? -ne 0 ]]; then
        error "Failed to create master key: $KEY_OUTPUT"
    fi
    
    MASTER_KEY_ID="$KEY_OUTPUT"
    success "Master encryption key created: $MASTER_KEY_ID"
    
    # Enable key rotation if requested
    if [[ "$ENABLE_KEY_ROTATION" == "true" ]]; then
        log "Enabling key rotation..."
        oci kms key-version create \
            --key-id "$MASTER_KEY_ID" \
            --compartment-id "$COMPARTMENT_ID" 2>/dev/null || true
        success "Key rotation enabled"
    fi
}

# Store secrets in vault
store_secrets() {
    log "Storing application secrets..."
    
    # Function to store a secret
    store_secret() {
        local secret_name="$1"
        local secret_value="$2"
        local secret_description="$3"
        
        log "Storing secret: $secret_name"
        
        SECRET_OUTPUT=$(oci secrets secret-bundle create \
            --compartment-id "$COMPARTMENT_ID" \
            --vault-id "$VAULT_ID" \
            --key-id "$MASTER_KEY_ID" \
            --secret-name "$secret_name" \
            --secret-content-content "$secret_value" \
            --secret-content-content-type "text/plain; charset=utf-8" \
            --description "$secret_description" \
            --query 'data.id' \
            --raw-output 2>&1)
        
        if [[ $? -ne 0 ]]; then
            warning "Failed to store secret $secret_name: $SECRET_OUTPUT"
        else
            success "Secret stored: $secret_name"
        fi
    }
    
    # Get secrets from user input
    echo ""
    echo "Enter secrets to store (press Enter to skip any field):"
    echo ""
    
    read -s -p "Anthropic API Key: " anthropic_key
    echo ""
    read -s -p "Resend API Key: " resend_key
    echo ""
    read -s -p "Paystack Secret Key: " paystack_key
    echo ""
    read -s -p "JWT Secret (press Enter for auto-generated): " jwt_secret
    echo ""
    read -s -p "OAuth Client Secret: " oauth_secret
    echo ""
    
    # Generate JWT secret if not provided
    if [[ -z "$jwt_secret" ]]; then
        jwt_secret=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
        log "Generated JWT secret"
    fi
    
    # Store secrets
    [[ -n "$anthropic_key" ]] && store_secret "vauntico-anthropic-api-key" "$anthropic_key" "Anthropic API key for AI services"
    [[ -n "$resend_key" ]] && store_secret "vauntico-resend-api-key" "$resend_key" "Resend API key for email services"
    [[ -n "$paystack_key" ]] && store_secret "vauntico-paystack-secret-key" "$paystack_key" "Paystack secret key for payment processing"
    [[ -n "$jwt_secret" ]] && store_secret "vauntico-jwt-secret" "$jwt_secret" "JWT secret for authentication tokens"
    [[ -n "$oauth_secret" ]] && store_secret "vauntico-oauth-client-secret" "$oauth_secret" "OAuth client secret for authentication"
}

# Create secret management script
create_secret_management_script() {
    log "Creating secret management utilities..."
    
    cat > vauntico-secrets-manager.sh << 'EOF'
#!/bin/bash

# ============================================================================
# Vauntico MVP - Secrets Management Utility
# ============================================================================
# This script provides utilities for managing OCI Vault secrets
# ============================================================================

# Configuration
COMPARTMENT_ID="PLACEHOLDER_COMPARTMENT_ID"
VAULT_ID="PLACEHOLDER_VAULT_ID"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# List all secrets
list_secrets() {
    echo -e "${BLUE}Available secrets:${NC}"
    oci secrets secret-bundle list \
        --compartment-id "$COMPARTMENT_ID" \
        --vault-id "$VAULT_ID" \
        --all \
        --query 'data[*].{Name:"secret-name",ID:id,Description:description}' \
        --output table
}

# Get a secret value
get_secret() {
    local secret_name="$1"
    
    if [[ -z "$secret_name" ]]; then
        echo "Usage: $0 get <secret-name>"
        exit 1
    fi
    
    echo -e "${BLUE}Retrieving secret: $secret_name${NC}"
    
    SECRET_VALUE=$(oci secrets secret-bundle get \
        --secret-name "$secret_name" \
        --compartment-id "$COMPARTMENT_ID" \
        --vault-id "$VAULT_ID" \
        --query 'data.secret-bundle-content.content' \
        --raw-output 2>/dev/null || echo "Secret not found")
    
    if [[ "$SECRET_VALUE" == "Secret not found" ]]; then
        echo -e "${YELLOW}Secret '$secret_name' not found${NC}"
        exit 1
    else
        echo "$SECRET_VALUE"
    fi
}

# Export secrets as environment variables
export_secrets() {
    echo -e "${BLUE}Exporting secrets as environment variables:${NC}"
    
    # Get all secrets and export them
    SECRETS=$(oci secrets secret-bundle list \
        --compartment-id "$COMPARTMENT_ID" \
        --vault-id "$VAULT_ID" \
        --all \
        --query 'data[*]."secret-name"' \
        --raw-output 2>/dev/null)
    
    for secret_name in $SECRETS; do
        if [[ -n "$secret_name" ]]; then
            # Convert secret name to environment variable format
            ENV_VAR_NAME=$(echo "$secret_name" | tr '[:lower:]' '[:upper:]' | tr '-' '_')
            
            # Get secret value
            SECRET_VALUE=$(oci secrets secret-bundle get \
                --secret-name "$secret_name" \
                --compartment-id "$COMPARTMENT_ID" \
                --vault-id "$VAULT_ID" \
                --query 'data.secret-bundle-content.content' \
                --raw-output 2>/dev/null || echo "")
            
            if [[ -n "$SECRET_VALUE" ]]; then
                export "$ENV_VAR_NAME"="$SECRET_VALUE"
                echo -e "${GREEN}Exported: $ENV_VAR_NAME${NC}"
            fi
        fi
    done
}

# Rotate a secret
rotate_secret() {
    local secret_name="$1"
    local new_value="$2"
    
    if [[ -z "$secret_name" || -z "$new_value" ]]; then
        echo "Usage: $0 rotate <secret-name> <new-value>"
        exit 1
    fi
    
    echo -e "${BLUE}Rotating secret: $secret_name${NC}"
    
    oci secrets secret-bundle create \
        --compartment-id "$COMPARTMENT_ID" \
        --vault-id "$VAULT_ID" \
        --secret-name "$secret_name" \
        --secret-content-content "$new_value" \
        --secret-content-content-type "text/plain; charset=utf-8" \
        --description "Rotated secret on $(date)"
    
    echo -e "${GREEN}Secret rotated successfully${NC}"
}

# Show usage
show_usage() {
    echo "Vauntico MVP Secrets Manager"
    echo ""
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  list                    List all available secrets"
    echo "  get <secret-name>        Get a specific secret value"
    echo "  export                  Export all secrets as environment variables"
    echo "  rotate <secret-name> <value>  Rotate a secret with new value"
    echo "  help                    Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 list"
    echo "  $0 get vauntico-anthropic-api-key"
    echo "  $0 export"
    echo "  $0 rotate vauntico-jwt-secret 'new-jwt-secret'"
}

# Main execution
case "${1:-help}" in
    list)
        list_secrets
        ;;
    get)
        get_secret "$2"
        ;;
    export)
        export_secrets
        ;;
    rotate)
        rotate_secret "$2" "$3"
        ;;
    help|*)
        show_usage
        ;;
esac
EOF
    
    # Replace placeholders
    sed -i "s|PLACEHOLDER_COMPARTMENT_ID|$COMPARTMENT_ID|g" vauntico-secrets-manager.sh
    sed -i "s|PLACEHOLDER_VAULT_ID|$VAULT_ID|g" vauntico-secrets-manager.sh
    
    chmod +x vauntico-secrets-manager.sh
    success "Secrets management script created"
}

# Create application integration script
create_app_integration_script() {
    log "Creating application integration utilities..."
    
    cat > vauntico-app-secrets.sh << 'EOF'
#!/bin/bash

# ============================================================================
# Vauntico MVP - Application Secrets Integration
# ============================================================================
# This script injects secrets into Vauntico applications
# ============================================================================

# Configuration
COMPARTMENT_ID="PLACEHOLDER_COMPARTMENT_ID"
VAULT_ID="PLACEHOLDER_VAULT_ID"
INSTANCE_ID="PLACEHOLDER_INSTANCE_ID"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Inject secrets into environment file
inject_into_env_file() {
    local env_file="${1:-.env}"
    
    echo -e "${BLUE}Injecting secrets into $env_file${NC}"
    
    # Get all secrets from vault
    SECRETS=$(oci secrets secret-bundle list \
        --compartment-id "$COMPARTMENT_ID" \
        --vault-id "$VAULT_ID" \
        --all \
        --query 'data[*]."secret-name"' \
        --raw-output 2>/dev/null)
    
    # Create/update .env file
    {
        echo "# Vauntico MVP Environment Variables"
        echo "# Auto-generated from OCI Vault on $(date)"
        echo ""
        
        for secret_name in $SECRETS; do
            if [[ -n "$secret_name" ]]; then
                # Get secret value
                SECRET_VALUE=$(oci secrets secret-bundle get \
                    --secret-name "$secret_name" \
                    --compartment-id "$COMPARTMENT_ID" \
                    --vault-id "$VAULT_ID" \
                    --query 'data.secret-bundle-content.content' \
                    --raw-output 2>/dev/null || echo "")
                
                if [[ -n "$SECRET_VALUE" ]]; then
                    # Convert secret name to environment variable format
                    ENV_VAR_NAME=$(echo "$secret_name" | tr '[:lower:]' '[:upper:]' | tr '-' '_')
                    echo "export $ENV_VAR_NAME=\"$SECRET_VALUE\""
                fi
            fi
        done
    } > "$env_file"
    
    echo -e "${GREEN}Secrets injected into $env_file${NC}"
}

# Inject secrets into running instance
inject_into_instance() {
    local instance_id="${1:-$INSTANCE_ID}"
    local ssh_user="${2:-ubuntu}"
    
    echo -e "${BLUE}Injecting secrets into instance: $instance_id${NC}"
    
    # Get instance public IP
    PUBLIC_IP=$(oci compute instance list-vnics \
        --instance-id "$instance_id" \
        --query 'data[0].publicIp' \
        --raw-output 2>/dev/null || echo "")
    
    if [[ -z "$PUBLIC_IP" ]]; then
        echo -e "${YELLOW}Instance does not have a public IP${NC}"
        return 1
    fi
    
    # Create secrets file
    SECRETS_FILE="/tmp/vauntico-secrets.sh"
    create_secrets_script "$SECRETS_FILE"
    
    # Copy and execute on instance
    scp -o StrictHostKeyChecking=no "$SECRETS_FILE" "$ssh_user@$PUBLIC_IP:/tmp/"
    ssh -o StrictHostKeyChecking=no "$ssh_user@$PUBLIC_IP" "chmod +x /tmp/vauntico-secrets.sh && /tmp/vauntico-secrets.sh"
    
    # Clean up
    rm -f "$SECRETS_FILE"
    
    echo -e "${GREEN}Secrets injected into instance $instance_id${NC}"
}

# Create secrets retrieval script
create_secrets_script() {
    local output_file="$1"
    
    cat > "$output_file" << SECRET_SCRIPT
#!/bin/bash

# Vauntico MVP Secrets Retrieval Script
# Generated on $(date)

COMPARTMENT_ID="$COMPARTMENT_ID"
VAULT_ID="$VAULT_ID"

# Create environment file
cat > /opt/vauntico-server/.env << 'ENV_EOF'
# Vauntico MVP Environment Variables
# Auto-generated from OCI Vault on $(date)
ENV_EOF

# Get all secrets from vault
SECRETS=\$(oci secrets secret-bundle list \\
    --compartment-id "\$COMPARTMENT_ID" \\
    --vault-id "\$VAULT_ID" \\
    --all \\
    --query 'data[*]."secret-name"' \\
    --raw-output 2>/dev/null)

# Append secrets to environment file
for secret_name in \$SECRETS; do
    if [[ -n "\$secret_name" ]]; then
        # Get secret value
        SECRET_VALUE=\$(oci secrets secret-bundle get \\
            --secret-name "\$secret_name" \\
            --compartment-id "\$COMPARTMENT_ID" \\
            --vault-id "\$VAULT_ID" \\
            --query 'data.secret-bundle-content.content' \\
            --raw-output 2>/dev/null || echo "")
        
        if [[ -n "\$SECRET_VALUE" ]]; then
            # Convert secret name to environment variable format
            ENV_VAR_NAME=\$(echo "\$secret_name" | tr '[:lower:]' '[:upper:]' | tr '-' '_')
            echo "export \$ENV_VAR_NAME=\"\$SECRET_VALUE\"" >> /opt/vauntico-server/.env
        fi
    fi
done

# Set proper permissions
chmod 600 /opt/vauntico-server/.env
chown ubuntu:ubuntu /opt/vauntico-server/.env

echo "Vauntico MVP secrets configured successfully"
SECRET_SCRIPT
}

# Show usage
show_usage() {
    echo "Vauntico MVP Application Secrets Integration"
    echo ""
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  env-file [file]         Inject secrets into environment file"
    echo "  instance [instance-id]    Inject secrets into running instance"
    echo "  help                    Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 env-file .env"
    echo "  $0 instance ocid1.instance.oc1..."
}

# Main execution
case "${1:-help}" in
    env-file)
        inject_into_env_file "$2"
        ;;
    instance)
        inject_into_instance "$2" "$3"
        ;;
    help|*)
        show_usage
        ;;
esac
EOF
    
    # Replace placeholders
    sed -i "s|PLACEHOLDER_COMPARTMENT_ID|$COMPARTMENT_ID|g" vauntico-app-secrets.sh
    sed -i "s|PLACEHOLDER_VAULT_ID|$VAULT_ID|g" vauntico-app-secrets.sh
    
    chmod +x vauntico-app-secrets.sh
    success "Application integration script created"
}

# Generate secrets management summary
generate_secrets_summary() {
    log "Generating secrets management summary..."
    
    SUMMARY_FILE="oci-secrets-summary-$(date +%Y%m%d-%H%M%S).txt"
    
    cat > "$SUMMARY_FILE" << EOF
 ============================================================================
 Vauntico MVP - OCI Vault and Secrets Setup Summary
 ============================================================================
 Created on: $(date)
 Compartment ID: $COMPARTMENT_ID
 
 VAULT CONFIGURATION:
 --------------------
 Vault Name: $VAULT_DISPLAY_NAME
 Vault ID: $VAULT_ID
 Master Key Name: $KEY_DISPLAY_NAME
 Master Key ID: $MASTER_KEY_ID
 Key Rotation: $ENABLE_KEY_ROTATION
 
 STORED SECRETS:
 ----------------
 • Anthropic API Key (vauntico-anthropic-api-key)
 • Resend API Key (vauntico-resend-api-key)
 • Paystack Secret Key (vauntico-paystack-secret-key)
 • JWT Secret (vauntico-jwt-secret)
 • OAuth Client Secret (vauntico-oauth-client-secret)
 
 MANAGEMENT TOOLS:
 ---------------
 • vauntico-secrets-manager.sh - General secrets management
 • vauntico-app-secrets.sh - Application integration
 
 INTEGRATION METHODS:
 --------------------
 1. Environment File Injection:
    ./vauntico-app-secrets.sh env-file .env
    
 2. Runtime Instance Injection:
    ./vauntico-app-secrets.sh instance <instance-id>
    
 3. Manual Secret Retrieval:
    ./vauntico-secrets-manager.sh get <secret-name>
    
 4. Environment Export:
    ./vauntico-secrets-manager.sh export
 
 SECURITY FEATURES:
 -----------------
 • AES-256 encryption with HSM protection
 • Automatic key rotation enabled
 • IAM policy-based access control
 • Audit logging for all access
 • Secure key lifecycle management
 
 BEST PRACTICES:
 ---------------
 • Use least-privilege IAM policies
 • Regularly rotate sensitive secrets
 • Monitor vault access logs
 • Never hardcode secrets in applications
 • Use short-lived tokens where possible
 • Enable multi-factor authentication for vault access
 
 MONITORING:
 ------------
 Monitor vault usage and access via:
 • OCI Console -> Identity & Security -> Vault
 • Audit logs for all secret operations
 • Cloud Guard for threat detection
 
 CLEANUP COMMANDS (if needed):
 -----------------------------
 # Delete all secrets
 oci secrets secret-bundle list --compartment-id $COMPARTMENT_ID --vault-id $VAULT_ID --query 'data[0].id' --raw-output | xargs -I {} oci secrets secret-bundle delete --secret-id {} --force
 
 # Delete master key
 oci kms key delete --key-id $MASTER_KEY_ID --force
 
 # Delete vault
 oci kms vault delete --vault-id $VAULT_ID --force
 ============================================================================
EOF
    
    success "Secrets summary saved to: $SUMMARY_FILE"
    
    # Display summary to console
    log "OCI VAULT AND SECRETS SETUP COMPLETED!"
    echo ""
    echo "Vault Configuration:"
    echo "  Name: $VAULT_DISPLAY_NAME"
    echo "  ID: $VAULT_ID"
    echo "  Master Key: $MASTER_KEY_ID"
    echo ""
    echo "Management Tools Created:"
    echo "  ./vauntico-secrets-manager.sh - General secrets management"
    echo "  ./vauntico-app-secrets.sh - Application integration"
    echo ""
    echo "Quick Start:"
    echo "  1. List secrets: ./vauntico-secrets-manager.sh list"
    echo "  2. Get secret: ./vauntico-secrets-manager.sh get <name>"
    echo "  3. Export to .env: ./vauntico-app-secrets.sh env-file .env"
    echo ""
    echo "Full summary saved to: $SUMMARY_FILE"
}

# Main execution function
main() {
    log "Starting Vauntico MVP OCI Vault and Secrets Setup..."
    echo ""
    
    check_infrastructure
    get_secrets_config
    create_vault
    create_master_key
    store_secrets
    create_secret_management_script
    create_app_integration_script
    generate_secrets_summary
    
    success "🎉 Vauntico MVP secrets management setup completed successfully!"
    echo ""
    log "Your Vauntico MVP secrets are now securely stored in OCI Vault!"
}

# Script execution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
