# OCI Bastion Deployment Guide for Vauntico Trust-Score Backend

## 🚨 Current Status

- **OCI Instance**: Running at 84.8.135.161
- **SSH Port 22**: Blocked (confirmed)
- **Cloudflare DNS**: Configured (returns 522 - origin not responding)
- **Goal**: Deploy backend service securely via OCI Bastion

## 📋 Prerequisites Verified

✅ **OCI CLI**: Version 3.71.4 installed and configured
✅ **Compartment**: Vauntico-MVP (ocid1.compartment.oc1..aaaaaaaaqjphq7si5cxb5tvjmoxxhpbohfz637qtx253apiyzzw6myh54zda)
✅ **Subnet**: vaunticosubnet (ocid1.subnet.oc1.af-johannesburg-1.aaaaaaaaosgyyaqwy7zq5ug4seimcwxhc47itvxny2vivusdnriynp3by7zq)
✅ **Instance**: trust-score (ocid1.instance.oc1.af-johannesburg-1.anvg4ljr4eq3kmqc7xrszmhs2geuocplk74cxm3sozcjr7otloapshomte3q)

## 🔧 Step 1: Create OCI Bastion

### Method 1: Using OCI Console (Recommended)

1. **Navigate to OCI Console**
   - Go to: https://console.oracle-cloud.com
   - Sign in with your OCI credentials
   - Navigate to **Identity & Security → Bastion**

2. **Create Bastion**
   - Click **Create Bastion**
   - **Name**: `vauntico-bastion`
   - **Compartment**: `Vauntico-MVP`
   - **Bastion Type**: `Standard`
   - **Target Subnet**: `vaunticosubnet`
   - **Client CIDR Block Allowlist**: `0.0.0.0/0` (allows access from anywhere)
   - **Region**: `af-johannesburg-1`
   - Click **Create**

### Method 2: Using OCI CLI (Alternative)

If you prefer CLI, use this corrected command:

```bash
# Create bastion with proper JSON format
oci bastion bastion create \
  --compartment-id ocid1.compartment.oc1..aaaaaaaaqjphq7si5cxb5tvjmoxxhpbohfz637qtx253apiyzzw6myh54zda \
  --target-subnet-id ocid1.subnet.oc1.af-johannesburg-1.aaaaaaaaosgyyaqwy7zq5ug4seimcwxhc47itvxny2vivusdnriynp3by7zq \
  --name vauntico-bastion \
  --bastion-type standard \
  --client-cidr-list '[{"cidr": "0.0.0.0/0"}]' \
  --region af-johannesburg-1
```

**Note**: The bastion creation may take 2-3 minutes to complete.

## 🔧 Step 2: Create Bastion Session for SSH Port Forwarding

Once the bastion is **ACTIVE**, create a managed SSH session:

### Using OCI Console:

1. **Navigate to your created bastion**
   - Go to **Identity & Security → Bastion**
   - Click on `vauntico-bastion`
   - Click **Create Session**

2. **Configure Session**
   - **Session Type**: `SSH Port Forwarding (Managed SSH Session)`
   - **Target Resource**: Select your `trust-score` instance
   - **Target Port**: `22`
   - **SSH Public Key**: Upload your SSH public key

### Using OCI CLI:

```bash
# First, get the bastion OCID after it's created
BASTION_ID=$(oci bastion bastion list \
  --compartment-id ocid1.compartment.oc1..aaaaaaaaqjphq7si5cxb5tvjmoxxhpbohfz637qtx253apiyzzw6myh54zda \
  --name vauntico-bastion \
  --region af-johannesburg-1 \
  --query "data[0].id" --raw-output)

# Create SSH session
oci bastion session create-port-forwarding \
  --bastion-id $BASTION_ID \
  --target-resource-id ocid1.instance.oc1.af-johannesburg-1.anvg4ljr4eq3kmqc7xrszmhs2geuocplk74cxm3sozcjr7otloapshomte3q \
  --target-port 22 \
  --ssh-public-key-file ~/.ssh/id_rsa.pub \
  --region af-johannesburg-1
```

## 🔧 Step 3: Connect via SSH Using Bastion Tunnel

### Get Connection Details:

After creating the session, you'll receive connection details. Use this format:

```bash
# Get session details
SESSION_ID=$(oci bastion session list \
  --bastion-id $BASTION_ID \
  --region af-johannesburg-1 \
  --query "data[0].id" --raw-output)

# Connect via bastion
ssh -i ~/.ssh/id_rsa \
  -o ProxyCommand="oci bastion session connect --session-id $SESSION_ID" \
  ubuntu@localhost
```

Or use the exact connection string provided in the OCI Console session details.

## 📦 Step 4: Upload Deployment Scripts

Once connected to the instance via bastion tunnel:

```bash
# Upload the deployment scripts (from your local machine to the bastion-tunneled SSH session)
scp -i ~/.ssh/id_rsa \
  -o ProxyCommand="oci bastion session connect --session-id $SESSION_ID" \
  backend-deploy-v2-optimized.sh ubuntu@localhost:~/

scp -i ~/.ssh/id_rsa \
  -o ProxyCommand="oci bastion session connect --session-id $SESSION_ID" \
  validate-backend-deployment.sh ubuntu@localhost:~/
```

## 🔧 Step 5: Make Scripts Executable

```bash
# SSH into the instance (you're already connected via bastion)
ssh -i ~/.ssh/id_rsa \
  -o ProxyCommand="oci bastion session connect --session-id $SESSION_ID" \
  ubuntu@localhost

# Make scripts executable
chmod +x backend-deploy-v2-optimized.sh
chmod +x validate-backend-deployment.sh

# Verify permissions
ls -la *.sh
```

## 🚀 Step 6: Run Backend Deployment

```bash
# Run the deployment script
./backend-deploy-v2-optimized.sh

# This will:
# - Update system packages
# - Install Node.js 18.x and PM2
# - Create Express.js application with security features
# - Set up PM2 process management
# - Configure systemd service
# - Set up firewall and monitoring
# - Deploy to /home/ubuntu/trust-score-backend
```

**Expected Deployment Time**: 10-15 minutes

## 🧪 Step 7: Validate Service Locally

```bash
# Test the health endpoint locally
curl http://localhost:3000/health

# Run the validation script
./validate-backend-deployment.sh
```

## 🌐 Step 8: Validate External Access

From your **local machine** (not via bastion):

```bash
# Test health endpoint through Cloudflare
curl -I https://trust-score.vauntico.com/health

# Test status API through Cloudflare
curl -I https://trust-score.vauntico.com/api/v1/status

# Expected: HTTP 200 OK responses
```

## 🎯 Success Criteria

✅ **SSH tunnel established via Bastion** (no open port 22)
✅ **Backend service running on port 3000**
✅ **Health check returns HTTP 200 OK locally and via Cloudflare**
✅ **Status API responds with JSON payload**
✅ **Backend service running persistently (systemd + PM2)**

## 🚨 Troubleshooting

### If Bastion Creation Fails:

```bash
# Check subnet permissions
oci network subnet get \
  --subnet-id ocid1.subnet.oc1.af-johannesburg-1.aaaaaaaaosgyyaqwy7zq5ug4seimcwxhc47itvxny2vivusdnriynp3by7zq \
  --region af-johannesburg-1

# Check compartment permissions
oci iam compartment get \
  --compartment-id ocid1.compartment.oc1..aaaaaaaaqjphq7si5cxb5tvjmoxxhpbohfz637qtx253apiyzzw6myh54zda \
  --region af-johannesburg-1
```

### If SSH Connection Fails:

```bash
# Check bastion status
oci bastion bastion get \
  --bastion-id $BASTION_ID \
  --region af-johannesburg-1

# Check session status
oci bastion session get \
  --session-id $SESSION_ID \
  --region af-johannesburg-1
```

### If Deployment Fails:

```bash
# Check instance logs
oci compute instance console-history get \
  --instance-id ocid1.instance.oc1.af-johannesburg-1.anvg4ljr4eq3kmqc7xrszmhs2geuocplk74cxm3sozcjr7otloapshomte3q \
  --region af-johannesburg-1

# Check service status
sudo systemctl status trust-score
pm2 status
```

## 📞 Additional Commands

### Cleanup Bastion (when done):

```bash
# Delete session
oci bastion session delete --session-id $SESSION_ID --region af-johannesburg-1

# Delete bastion
oci bastion bastion delete --bastion-id $BASTION_ID --region af-johannesburg-1
```

### Monitoring Deployment:

```bash
# PM2 monitoring
pm2 monit

# View logs
pm2 logs trust-score

# System logs
sudo journalctl -u trust-score -f

# Application logs
tail -f /var/log/vauntico/*.log
```

---

## 🚀 Quick Start Commands

Once you have your bastion and session ready:

```bash
# 1. Set variables
export COMPARTMENT_ID="ocid1.compartment.oc1..aaaaaaaaqjphq7si5cxb5tvjmoxxhpbohfz637qtx253apiyzzw6myh54zda"
export SUBNET_ID="ocid1.subnet.oc1.af-johannesburg-1.aaaaaaaaosgyyaqwy7zq5ug4seimcwxhc47itvxny2vivusdnriynp3by7zq"
export INSTANCE_ID="ocid1.instance.oc1.af-johannesburg-1.anvg4ljr4eq3kmqc7xrszmhs2geuocplk74cxm3sozcjr7otloapshomte3q"
export REGION="af-johannesburg-1"

# 2. Create bastion
BASTION_ID=$(oci bastion bastion create \
  --compartment-id $COMPARTMENT_ID \
  --target-subnet-id $SUBNET_ID \
  --name vauntico-bastion \
  --bastion-type standard \
  --client-cidr-list '[{"cidr": "0.0.0.0/0"}]' \
  --region $REGION \
  --query "data[0].id" --raw-output)

echo "Bastion ID: $BASTION_ID"

# 3. Create session (wait for bastion to be ACTIVE first)
sleep 60
SESSION_ID=$(oci bastion session create-port-forwarding \
  --bastion-id $BASTION_ID \
  --target-resource-id $INSTANCE_ID \
  --target-port 22 \
  --ssh-public-key-file ~/.ssh/id_rsa.pub \
  --region $REGION \
  --query "data[0].id" --raw-output)

echo "Session ID: $SESSION_ID"

# 4. Connect and deploy
ssh -i ~/.ssh/id_rsa \
  -o ProxyCommand="oci bastion session connect --session-id $SESSION_ID" \
  ubuntu@localhost << 'EOF'
# Upload and run deployment scripts here
EOF
```

---

**This approach provides secure, managed access to your OCI instance without exposing port 22 to the internet, following OCI security best practices.**
