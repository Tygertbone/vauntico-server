#!/bin/bash

# Automated Vauntico Backend Deployment via OCI Bastion
set -euo pipefail

# Configuration
readonly COMPARTMENT_ID="ocid1.compartment.oc1..aaaaaaaaqjphq7si5cxb5tvjmoxxhpbohfz637qtx253apiyzzw6myh54zda"
readonly SUBNET_ID="ocid1.subnet.oc1.af-johannesburg-1.aaaaaaaaosgyyaqwy7zq5ug4seimcwxhc47itvxny2vivusdnriynp3by7zq"
readonly INSTANCE_ID="ocid1.instance.oc1.af-johannesburg-1.anvg4ljr4eq3kmqc7xrszmhs2geuocplk74cxm3sozcjr7otloapshomte3q"
readonly REGION="af-johannesburg-1"
readonly BASTION_NAME="vauntico-bastion"

# Colors
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅ $1${NC}"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $1${NC}"
}

# Step 1: Create Bastion
log "Step 1: Creating OCI Bastion..."
BASTION_ID=$(oci bastion bastion create \
    --compartment-id "$COMPARTMENT_ID" \
    --target-subnet-id "$SUBNET_ID" \
    --name "$BASTION_NAME" \
    --bastion-type standard \
    --client-cidr-list '["0.0.0.0/0"]' \
    --region "$REGION" \
    --query "data[0].id" \
    --raw-output 2>/dev/null || {
        log_error "Failed to create bastion"
        exit 1
    })

if [[ -z "$BASTION_ID" ]]; then
    log_error "Bastion ID is empty"
    exit 1
fi

log_success "Bastion created with ID: $BASTION_ID"

# Step 2: Wait for Bastion to be ACTIVE
log "Step 2: Waiting for bastion to become ACTIVE..."
for i in {1..12}; do
    STATUS=$(oci bastion bastion get \
        --bastion-id "$BASTION_ID" \
        --region "$REGION" \
        --query "data[0].\"lifecycle-state\"" \
        --raw-output 2>/dev/null)
    
    if [[ "$STATUS" == "ACTIVE" ]]; then
        log_success "Bastion is ACTIVE"
        break
    fi
    
    if [[ $i -eq 12 ]]; then
        log_error "Bastion did not become ACTIVE within 2 minutes"
        exit 1
    fi
    
    sleep 10
done

# Step 3: Create SSH Session
log "Step 3: Creating SSH session..."
SESSION_ID=$(oci bastion session create-port-forwarding \
    --bastion-id "$BASTION_ID" \
    --target-resource-id "$INSTANCE_ID" \
    --target-port 22 \
    --ssh-public-key-file "$HOME/.ssh/id_rsa.pub" \
    --region "$REGION" \
    --query "data[0].id" \
    --raw-output 2>/dev/null || {
        log_error "Failed to create SSH session"
        exit 1
    })

log_success "SSH session created with ID: $SESSION_ID"

# Step 4: Upload deployment scripts
log "Step 4: Uploading deployment scripts..."

# Create SSH command for file transfer
SSH_CMD="ssh -i $HOME/.ssh/id_rsa -o ProxyCommand=\"oci bastion session connect --session-id $SESSION_ID\" ubuntu@localhost"

# Upload scripts using scp with bastion proxy
echo "$SSH_CMD" << 'EOF' > /tmp/bastion-ssh.sh
chmod +x /tmp/bastion-ssh.sh

# Upload deployment scripts
scp -i "$HOME/.ssh/id_rsa" -o ProxyCommand="oci bastion session connect --session-id $SESSION_ID" \
    backend-deploy-v2-optimized.sh ubuntu@localhost:~/ 2>/dev/null || {
    log_error "Failed to upload backend-deploy-v2-optimized.sh"
    exit 1
}

scp -i "$HOME/.ssh/id_rsa" -o ProxyCommand="oci bastion session connect --session-id $SESSION_ID" \
    validate-backend-deployment.sh ubuntu@localhost:~/ 2>/dev/null || {
    log_error "Failed to upload validate-backend-deployment.sh"
    exit 1
}

log_success "Scripts uploaded successfully"

# Step 5: Execute deployment
log "Step 5: Executing deployment on remote instance..."

# Execute deployment commands via bastion SSH
echo "$SSH_CMD" << 'REMOTE_SCRIPT'
#!/bin/bash
set -euo pipefail

# Make scripts executable
chmod +x ~/backend-deploy-v2-optimized.sh
chmod +x ~/validate-backend-deployment.sh

# Run deployment
echo "Running backend deployment..."
./backend-deploy-v2-optimized.sh

if [[ $? -eq 0 ]]; then
    echo "✅ Deployment completed successfully"
else
    echo "❌ Deployment failed"
    exit 1
fi

# Test health endpoint
echo "Testing health endpoint..."
curl -f -s http://localhost:3000/health > /dev/null && echo "✅ Health check passed" || echo "❌ Health check failed"

# Run validation
echo "Running validation..."
./validate-backend-deployment.sh

REMOTE_SCRIPT
EOF

chmod +x /tmp/bastion-ssh.sh

# Execute remote commands
/tmp/bastion-ssh.sh

# Get exit code
REMOTE_EXIT_CODE=$?

if [[ $REMOTE_EXIT_CODE -eq 0 ]]; then
    log_success "✅ Deployment completed successfully via bastion!"
    log_success "🌍 Backend should now be accessible at:"
    echo "   Local: http://localhost:3000/health"
    echo "   External: https://trust-score.vauntico.com/health"
    echo "   Status API: https://trust-score.vauntico.com/api/v1/status"
else
    log_error "❌ Deployment failed via bastion"
    exit 1
fi

# Cleanup
log "Cleaning up..."

# Delete session
oci bastion session delete --session-id "$SESSION_ID" --region "$REGION" 2>/dev/null

# Delete bastion
oci bastion bastion delete --bastion-id "$BASTION_ID" --region "$REGION" 2>/dev/null

log_success "Cleanup completed"
