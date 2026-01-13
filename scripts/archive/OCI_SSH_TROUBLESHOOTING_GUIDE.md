# OCI SSH Access Troubleshooting Guide

## 🚨 Common SSH Issues and Solutions

Based on your feedback, you're encountering these specific issues:

- Port 22 refused/timed out
- SSH not reachable from external
- chmod command not working (Windows vs Linux)
- Scripts running locally instead of on OCI instance

## ✅ Step-by-Step SSH Fix

### 1. Check OCI Security Rules

**In OCI Console:**

1. Go to **Compute → Instances**
2. Click on your instance
3. Go to **Virtual Cloud Network → Subnet → Security Lists**
4. Check inbound rules include:

```
State: Active
Source CIDR: 0.0.0.0/0
Destination Port Range: 22
Protocol: TCP
```

**If missing, add the rule:**

```bash
# Using OCI CLI
oci network security-list create \
  --compartment-id YOUR_COMPARTMENT_ID \
  --egress-security-rules '[{"destination":"0.0.0.0/0","protocol":"all","isStateless":false}]' \
  --ingress-security-rules '[{"source":"0.0.0.0/0","protocol":"6","tcpOptions":{"destinationPortRange":{"max":22,"min":22}},"isStateless":false}]' \
  --vcn-id YOUR_VCN_ID
```

### 2. Verify SSH Daemon is Running

**Use OCI Console Connection:**

1. Go to **Compute → Instances**
2. Click your instance name
3. Click **Console Connection** → **Create Console Connection**
4. Choose **SSH Key** or **Serial Console**
5. Follow instructions to connect

**Once connected, check SSH status:**

```bash
# Check if SSH is running
sudo systemctl status ssh

# If not active, enable and start
sudo systemctl enable ssh
sudo systemctl start ssh

# Verify SSH is listening
sudo netstat -tlnp | grep :22

# Should show output like:
# tcp        0      0 0.0.0.0:22       0.0.0.0:*        LISTEN      1234/sshd
```

### 3. Check Network Security Groups (NSGs)

**If using NSGs instead of Security Lists:**

1. Go to **Networking → Network Security Groups**
2. Find your instance's NSG
3. Add inbound rule:
   - Source: 0.0.0.0/0
   - Destination Port: 22
   - Protocol: TCP

### 4. Test SSH Connection

**From your local machine:**

```bash
# Test basic connectivity
telnet YOUR_INSTANCE_IP 22

# Should show:
# Trying YOUR_INSTANCE_IP...
# Connected to YOUR_INSTANCE_IP.
# Escape character is '^]'.

# Try SSH with verbose output
ssh -v ubuntu@YOUR_INSTANCE_IP

# Look for these lines:
# debug1: Connecting to YOUR_INSTANCE_IP [YOUR_INSTANCE_IP] port 22.
# debug1: Connection established.
```

## 🔧 Fixed Deployment Process

### Step 1: Upload Scripts (From Local Windows)

```powershell
# In PowerShell, upload to OCI instance
scp backend-deploy-v2-optimized.sh ubuntu@84.8.135.161:~/
scp validate-backend-deployment.sh ubuntu@84.8.135.161:~/
scp BACKEND_DEPLOYMENT_V2_GUIDE.md ubuntu@84.8.135.161:~/
scp test-deployment-scripts.cjs ubuntu@84.8.135.161:~/
```

### Step 2: SSH into OCI Instance

```bash
# SSH into the Ubuntu instance
ssh ubuntu@84.8.135.161

# You should see Ubuntu welcome message
# ubuntu@instance-name:~$
```

### Step 3: Make Scripts Executable (INSIDE Ubuntu)

```bash
# Now you're inside the Linux VM - chmod will work!
chmod +x backend-deploy-v2-optimized.sh
chmod +x validate-backend-deployment.sh

# Verify permissions
ls -la *.sh

# Should show:
# -rwxr-xr-x 1 ubuntu ubuntu 12345 Jan  5 19:10 backend-deploy-v2-optimized.sh
# -rwxr-xr-x 1 ubuntu ubuntu  6789 Jan  5 19:10 validate-backend-deployment.sh
```

### Step 4: Run Deployment (INSIDE Ubuntu)

```bash
# Run the deployment script on the OCI instance
./backend-deploy-v2-optimized.sh

# Watch the deployment progress on the server
# This will install Node.js, create the application, etc.
```

### Step 5: Validate Deployment (INSIDE Ubuntu)

```bash
# After deployment completes, run validation
./validate-backend-deployment.sh

# This will test the running service on the server
```

## 🚨 Common Error Scenarios

### Error: "Port 22 refused"

**Cause:** SSH daemon not running or firewall blocking
**Solution:**

```bash
# Check SSH status
sudo systemctl status ssh

# If inactive, start it
sudo systemctl start ssh
sudo systemctl enable ssh
```

### Error: "Port 22 timed out"

**Cause:** Security rules not allowing SSH
**Solution:**

```bash
# Check security list rules
oci network security-list list --compartment-id YOUR_COMPARTMENT_ID

# Add SSH rule if missing
oci network security-list update \
  --security-list-id YOUR_SECURITY_LIST_ID \
  --ingress-security-rules '[{"source":"0.0.0.0/0","protocol":"6","tcpOptions":{"destinationPortRange":{"max":22,"min":22}},"isStateless":false}]'
```

### Error: "chmod not recognized"

**Cause:** Running chmod on Windows instead of Linux
**Solution:**

```bash
# WRONG (Windows PowerShell):
chmod +x script.sh

# CORRECT (Inside SSH session on Ubuntu):
ssh ubuntu@your-instance-ip
chmod +x script.sh
```

### Error: "Script runs on local machine"

**Cause:** Running scripts before SSH connection
**Solution:**

```bash
# WRONG (runs locally):
./backend-deploy-v2-optimized.sh

# CORRECT (run on server):
ssh ubuntu@your-instance-ip
./backend-deploy-v2-optimized.sh
```

## 🔍 Debugging SSH Issues

### 1. Network Connectivity Test

```bash
# From your local machine
# Test if port 22 is reachable
nmap -p 22 84.8.135.161

# Expected output:
# PORT     STATE SERVICE
# 22/tcp   open  ssh
```

### 2. Check Firewall Settings

```bash
# On OCI instance, check local firewall
sudo ufw status

# If active, allow SSH
sudo ufw allow ssh
sudo ufw reload
```

### 3. Verify Instance Details

```bash
# Get instance details
oci compute instance get --instance-id YOUR_INSTANCE_ID

# Check public IP and VCN configuration
```

## 🆘 Emergency Access Methods

### If SSH Still Fails:

**Method 1: OCI Console Connection**

1. Go to OCI Console
2. Compute → Instances → Your Instance
3. Console Connection → Create SSH Console Connection
4. Upload your SSH public key
5. Connect using provided command

**Method 2: Serial Console**

1. Go to Console Connection → Create Serial Console Connection
2. Follow instructions for serial access
3. Login with default credentials
4. Debug SSH daemon issues

**Method 3: Recreate Security Rules**

```bash
# Completely recreate security rules
# First, remove all existing rules
oci network security-list update \
  --security-list-id YOUR_SECURITY_LIST_ID \
  --ingress-security-rules '[]'

# Then add SSH rule
oci network security-list update \
  --security-list-id YOUR_SECURITY_LIST_ID \
  --ingress-security-rules '[{"source":"0.0.0.0/0","protocol":"6","tcpOptions":{"destinationPortRange":{"max":22,"min":22}},"isStateless":false}]'
```

## 📋 Pre-Deployment Checklist

Before attempting deployment:

- [ ] **OCI Security Rules**: Port 22 allowed from 0.0.0.0/0
- [ ] **SSH Daemon**: Active and listening on port 22
- [ ] **Instance Public IP**: Correct and accessible
- [ ] **Local Firewall**: Not blocking outbound connections
- [ ] **SSH Key**: Correct key pair configured

## 🎯 Quick Test Commands

**From Local Machine:**

```bash
# Test SSH connectivity
ssh -o ConnectTimeout=10 ubuntu@84.8.135.161 'echo "SSH Works"'

# Should return: SSH Works
```

**From OCI Instance:**

```bash
# Test deployment prerequisites
which node || echo "Node.js not installed"
which npm || echo "NPM not installed"
which git || echo "Git not installed"
```

## 📞 Getting Help

**If still stuck:**

1. **OCI Documentation**: https://docs.oracle.com/en-us/iaas/Content/Compute/Tasks/accessingcomputeinstance.htm
2. **OCI Support**: Create support ticket in OCI Console
3. **Check Instance Logs**: OCI Console → Instances → Your Instance → Logs

---

## ✅ Success Indicators

When SSH is working correctly:

- ✅ `ssh ubuntu@84.8.135.161` connects immediately
- ✅ No "port 22 refused" or "timeout" errors
- ✅ Can run `chmod +x` commands successfully
- ✅ Scripts execute on OCI instance, not local machine
- ✅ Deployment script runs with Ubuntu prompts

Once SSH is working, the deployment will proceed smoothly on the OCI instance as intended.
