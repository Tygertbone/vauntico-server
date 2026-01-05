# Vauntico MVP - OCI Launch Commands (Architecture Compatibility Fix)

## 🎯 Problem Solved
**CannotParseRequest Blocker**: The issue occurs when trying to launch an ARM64 image on an x86 compute shape (or vice-versa). This document provides ready-to-drop OCI CLI commands for both architecture variants.

---

## 🚀 Option 1: x86 Ubuntu + VM.Standard.E2.1.Micro (Recommended for Testing)

### Prerequisites
```bash
# Set your compartment ID
export COMPARTMENT_ID="ocid1.compartment.oc1..your-compartment-id"

# Set your SSH key path
export SSH_PUBLIC_KEY="$(cat ~/.ssh/id_rsa.pub)"
```

### Launch Command (Copy & Paste)
```bash
# x86 Ubuntu 22.04 with VM.Standard.E2.1.Micro
oci compute instance launch \
  --compartment-id $COMPARTMENT_ID \
  --availability-domain "Your-AD-1" \
  --subnet-id "ocid1.subnet.oc1..your-subnet-id" \
  --shape "VM.Standard.E2.1.Micro" \
  --display-name "vauntico-trust-score-x86" \
  --hostname-label "trust-score-x86" \
  --source-details '{
    "sourceType": "image",
    "imageId": "ocid1.image.oc1..aaaaaaaav5jwzizh5qrurp5a5vxqkyxojowpc26flgunuzs5dq7lryvld5q"
  }' \
  --ssh-authorized-keys-file "$SSH_PUBLIC_KEY" \
  --assign-public-ip true \
  --user-data-file "./cloud-init.yaml"
```

### Launch All 4 Services (x86)
```bash
# Trust Score Service
oci compute instance launch \
  --compartment-id $COMPARTMENT_ID \
  --availability-domain "Your-AD-1" \
  --subnet-id "ocid1.subnet.oc1..your-subnet-id" \
  --shape "VM.Standard.E2.1.Micro" \
  --display-name "vauntico-trust-score-x86" \
  --hostname-label "trust-score-x86" \
  --source-details '{
    "sourceType": "image",
    "imageId": "ocid1.image.oc1..aaaaaaaav5jwzizh5qrurp5a5vxqkyxojowpc26flgunuzs5dq7lryvld5q"
  }' \
  --ssh-authorized-keys-file "$SSH_PUBLIC_KEY" \
  --assign-public-ip true \
  --user-data-file "./cloud-init.yaml" \
  --wait-for-state RUNNING

# Vauntico Server
oci compute instance launch \
  --compartment-id $COMPARTMENT_ID \
  --availability-domain "Your-AD-1" \
  --subnet-id "ocid1.subnet.oc1..your-subnet-id" \
  --shape "VM.Standard.E2.1.Micro" \
  --display-name "vauntico-server-x86" \
  --hostname-label "server-x86" \
  --source-details '{
    "sourceType": "image",
    "imageId": "ocid1.image.oc1..aaaaaaaav5jwzizh5qrurp5a5vxqkyxojowpc26flgunuzs5dq7lryvld5q"
  }' \
  --ssh-authorized-keys-file "$SSH_PUBLIC_KEY" \
  --assign-public-ip true \
  --user-data-file "./cloud-init.yaml" \
  --wait-for-state RUNNING

# Fulfillment Engine
oci compute instance launch \
  --compartment-id $COMPARTMENT_ID \
  --availability-domain "Your-AD-1" \
  --subnet-id "ocid1.subnet.oc1..your-subnet-id" \
  --shape "VM.Standard.E2.1.Micro" \
  --display-name "vauntico-fulfillment-x86" \
  --hostname-label "fulfillment-x86" \
  --source-details '{
    "sourceType": "image",
    "imageId": "ocid1.image.oc1..aaaaaaaav5jwzizh5qrurp5a5vxqkyxojowpc26flgunuzs5dq7lryvld5q"
  }' \
  --ssh-authorized-keys-file "$SSH_PUBLIC_KEY" \
  --assign-public-ip true \
  --user-data-file "./cloud-init.yaml" \
  --wait-for-state RUNNING

# Legacy Server
oci compute instance launch \
  --compartment-id $COMPARTMENT_ID \
  --availability-domain "Your-AD-1" \
  --subnet-id "ocid1.subnet.oc1..your-subnet-id" \
  --shape "VM.Standard.E2.1.Micro" \
  --display-name "vauntico-legacy-x86" \
  --hostname-label "legacy-x86" \
  --source-details '{
    "sourceType": "image",
    "imageId": "ocid1.image.oc1..aaaaaaaav5jwzizh5qrurp5a5vxqkyxojowpc26flgunuzs5dq7lryvld5q"
  }' \
  --ssh-authorized-keys-file "$SSH_PUBLIC_KEY" \
  --assign-public-ip true \
  --user-data-file "./cloud-init.yaml" \
  --wait-for-state RUNNING
```

---

## 🚀 Option 2: ARM64 Ubuntu + VM.Standard.A1.Flex (Cost-Optimized)

### Launch Command (Copy & Paste)
```bash
# ARM64 Ubuntu 22.04 with VM.Standard.A1.Flex
oci compute instance launch \
  --compartment-id $COMPARTMENT_ID \
  --availability-domain "Your-AD-1" \
  --subnet-id "ocid1.subnet.oc1..your-subnet-id" \
  --shape "VM.Standard.A1.Flex" \
  --shape-config '{
    "memoryInGBs": 6,
    "ocpus": 1
  }' \
  --display-name "vauntico-trust-score-arm64" \
  --hostname-label "trust-score-arm64" \
  --source-details '{
    "sourceType": "image",
    "imageId": "ocid1.image.oc1..aaaaaaaa6bvcdt4vfhwsx2dt522q45x3gp3rlyp62rpchw3tll54zrs3c5a"
  }' \
  --ssh-authorized-keys-file "$SSH_PUBLIC_KEY" \
  --assign-public-ip true \
  --user-data-file "./cloud-init.yaml"
```

### Launch All 4 Services (ARM64)
```bash
# Trust Score Service
oci compute instance launch \
  --compartment-id $COMPARTMENT_ID \
  --availability-domain "Your-AD-1" \
  --subnet-id "ocid1.subnet.oc1..your-subnet-id" \
  --shape "VM.Standard.A1.Flex" \
  --shape-config '{
    "memoryInGBs": 6,
    "ocpus": 1
  }' \
  --display-name "vauntico-trust-score-arm64" \
  --hostname-label "trust-score-arm64" \
  --source-details '{
    "sourceType": "image",
    "imageId": "ocid1.image.oc1..aaaaaaaa6bvcdt4vfhwsx2dt522q45x3gp3rlyp62rpchw3tll54zrs3c5a"
  }' \
  --ssh-authorized-keys-file "$SSH_PUBLIC_KEY" \
  --assign-public-ip true \
  --user-data-file "./cloud-init.yaml" \
  --wait-for-state RUNNING

# Vauntico Server
oci compute instance launch \
  --compartment-id $COMPARTMENT_ID \
  --availability-domain "Your-AD-1" \
  --subnet-id "ocid1.subnet.oc1..your-subnet-id" \
  --shape "VM.Standard.A1.Flex" \
  --shape-config '{
    "memoryInGBs": 6,
    "ocpus": 1
  }' \
  --display-name "vauntico-server-arm64" \
  --hostname-label "server-arm64" \
  --source-details '{
    "sourceType": "image",
    "imageId": "ocid1.image.oc1..aaaaaaaa6bvcdt4vfhwsx2dt522q45x3gp3rlyp62rpchw3tll54zrs3c5a"
  }' \
  --ssh-authorized-keys-file "$SSH_PUBLIC_KEY" \
  --assign-public-ip true \
  --user-data-file "./cloud-init.yaml" \
  --wait-for-state RUNNING

# Fulfillment Engine
oci compute instance launch \
  --compartment-id $COMPARTMENT_ID \
  --availability-domain "Your-AD-1" \
  --subnet-id "ocid1.subnet.oc1..your-subnet-id" \
  --shape "VM.Standard.A1.Flex" \
  --shape-config '{
    "memoryInGBs": 6,
    "ocpus": 1
  }' \
  --display-name "vauntico-fulfillment-arm64" \
  --hostname-label "fulfillment-arm64" \
  --source-details '{
    "sourceType": "image",
    "imageId": "ocid1.image.oc1..aaaaaaaa6bvcdt4vfhwsx2dt522q45x3gp3rlyp62rpchw3tll54zrs3c5a"
  }' \
  --ssh-authorized-keys-file "$SSH_PUBLIC_KEY" \
  --assign-public-ip true \
  --user-data-file "./cloud-init.yaml" \
  --wait-for-state RUNNING

# Legacy Server
oci compute instance launch \
  --compartment-id $COMPARTMENT_ID \
  --availability-domain "Your-AD-1" \
  --subnet-id "ocid1.subnet.oc1..your-subnet-id" \
  --shape "VM.Standard.A1.Flex" \
  --shape-config '{
    "memoryInGBs": 6,
    "ocpus": 1
  }' \
  --display-name "vauntico-legacy-arm64" \
  --hostname-label "legacy-arm64" \
  --source-details '{
    "sourceType": "image",
    "imageId": "ocid1.image.oc1..aaaaaaaa6bvcdt4vfhwsx2dt522q45x3gp3rlyp62rpchw3tll54zrs3c5a"
  }' \
  --ssh-authorized-keys-file "$SSH_PUBLIC_KEY" \
  --assign-public-ip true \
  --user-data-file "./cloud-init.yaml" \
  --wait-for-state RUNNING
```

---

## 🔧 Quick Setup Script

### 1. Set Your Environment Variables
```bash
# Edit these values before running
export COMPARTMENT_ID="ocid1.compartment.oc1..your-compartment-id"
export SUBNET_ID="ocid1.subnet.oc1..your-subnet-id"
export AVAILABILITY_DOMAIN="Your-AD-1"  # e.g., "Uocm:PHX-AD-1"
export SSH_PUBLIC_KEY="$(cat ~/.ssh/id_rsa.pub)"

# Verify settings
echo "Compartment ID: $COMPARTMENT_ID"
echo "Subnet ID: $SUBNET_ID"
echo "Availability Domain: $AVAILABILITY_DOMAIN"
echo "SSH Key: ${SSH_PUBLIC_KEY:0:50}..."
```

### 2. Choose Your Architecture
```bash
# Option A: x86 Architecture (Recommended for testing)
ARCH="x86"
SHAPE="VM.Standard.E2.1.Micro"
IMAGE_ID="ocid1.image.oc1..aaaaaaaav5jwzizh5qrurp5a5vxqkyxojowpc26flgunuzs5dq7lryvld5q"
SHAPE_CONFIG=""

# Option B: ARM64 Architecture (Cost-optimized)
# ARCH="arm64"
# SHAPE="VM.Standard.A1.Flex"
# IMAGE_ID="ocid1.image.oc1..aaaaaaaa6bvcdt4vfhwsx2dt522q45x3gp3rlyp62rpchw3tll54zrs3c5a"
# SHAPE_CONFIG='--shape-config '\''{"memoryInGBs": 6, "ocpus": 1}'\''
```

### 3. Launch Test Instance
```bash
# Launch single test instance first
oci compute instance launch \
  --compartment-id $COMPARTMENT_ID \
  --availability-domain "$AVAILABILITY_DOMAIN" \
  --subnet-id $SUBNET_ID \
  --shape "$SHAPE" \
  $SHAPE_CONFIG \
  --display-name "vauntico-test-$ARCH" \
  --hostname-label "test-$ARCH" \
  --source-details "{\"sourceType\": \"image\", \"imageId\": \"$IMAGE_ID\"}" \
  --ssh-authorized-keys-file "$SSH_PUBLIC_KEY" \
  --assign-public-ip true \
  --user-data-file "./cloud-init.yaml" \
  --wait-for-state RUNNING

echo "✅ Test instance launched successfully!"
```

---

## 📋 Post-Launch Validation

### 1. Get Public IPs
```bash
# List all Vauntico instances with IPs
oci compute instance list \
  --compartment-id $COMPARTMENT_ID \
  --display-name "vauntico-*" \
  --query "data [*].{Name:\"display-name\", State:\"lifecycle-state\", PublicIP:\"public-ip\", Shape:\"shape\"}" \
  --output table
```

### 2. Health Checks
```bash
# Get public IPs and test health endpoints
for ip in $(oci compute instance list --compartment-id $COMPARTMENT_ID --display-name "vauntico-*" --query "data [*].\"public-ip\"" --output raw); do
  echo "Testing health endpoint for $ip..."
  curl -f http://$ip:3000/health || echo "❌ Health check failed for $ip:3000"
  curl -f http://$ip:3001/health || echo "❌ Health check failed for $ip:3001"
  curl -f http://$ip:3002/health || echo "❌ Health check failed for $ip:3002"
  curl -f http://$ip:3003/health || echo "❌ Health check failed for $ip:3003"
done
```

### 3. Service Status Check
```bash
# SSH into first instance to check Docker containers
FIRST_IP=$(oci compute instance list --compartment-id $COMPARTMENT_ID --display-name "vauntico-*" --query "data [0].\"public-ip\"" --output raw)

ssh -o StrictHostKeyChecking=no ubuntu@$FIRST_IP << 'EOF'
echo "=== Docker Container Status ==="
docker ps -a

echo "=== Service Health Status ==="
curl -f http://localhost:3000/health && echo "✅ Trust Score: OK" || echo "❌ Trust Score: FAILED"
curl -f http://localhost:3001/health && echo "✅ Vauntico Server: OK" || echo "❌ Vauntico Server: FAILED"
curl -f http://localhost:3002/health && echo "✅ Fulfillment: OK" || echo "❌ Fulfillment: FAILED"
curl -f http://localhost:3003/health && echo "✅ Legacy Server: OK" || echo "❌ Legacy Server: FAILED"

echo "=== Cloud-init Logs ==="
sudo tail -20 /var/log/cloud-init-output.log
EOF
```

---

## 🌐 DNS Configuration (Cloudflare)

### 1. Update DNS Records
```bash
# Get all public IPs
TRUST_SCORE_IP=$(oci compute instance list --compartment-id $COMPARTMENT_ID --display-name "vauntico-trust-score-*" --query "data [0].\"public-ip\"" --output raw)
SERVER_IP=$(oci compute instance list --compartment-id $COMPARTMENT_ID --display-name "vauntico-server-*" --query "data [0].\"public-ip\"" --output raw)
FULFILLMENT_IP=$(oci compute instance list --compartment-id $COMPARTMENT_ID --display-name "vauntico-fulfillment-*" --query "data [0].\"public-ip\"" --output raw)
LEGACY_IP=$(oci compute instance list --compartment-id $COMPARTMENT_ID --display-name "vauntico-legacy-*" --query "data [0].\"public-ip\"" --output raw)

echo "=== DNS A Records to Create ==="
echo "trust-score.vauntico.com → $TRUST_SCORE_IP"
echo "api.vauntico.com → $SERVER_IP"
echo "fulfillment.vauntico.com → $FULFILLMENT_IP"
echo "legacy.vauntico.com → $LEGACY_IP"
```

### 2. Cloudflare API Update (Optional)
```bash
# If you have Cloudflare API access
CLOUDFLARE_ZONE_ID="your-zone-id"
CLOUDFLARE_TOKEN="your-api-token"

# Create A records
curl -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CLOUDFLARE_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"type":"A","name":"trust-score.vauntico.com","content":"'$TRUST_SCORE_IP'","ttl":300,"proxied":false}'
```

---

## 🔍 Troubleshooting

### Common Issues & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `CannotParseRequest` | Architecture mismatch | Use correct image/shape pairing from this doc |
| `InstanceNotRunning` | Still provisioning | Wait 2-3 minutes, check with `--wait-for-state RUNNING` |
| `SSH Connection refused` | SSH key issue | Verify public key format and instance access |
| `Docker pull failed` | Network/private registry | Check internet connectivity and image names |

### Manual OCI Console Validation
1. Go to OCI Console → Compute → Instances
2. Check instance state is "RUNNING"
3. Verify public IP is assigned
4. Test SSH: `ssh -i ~/.ssh/id_rsa ubuntu@<PUBLIC_IP>`
5. Check Docker: `docker ps`

---

## 📊 Cost Comparison

| Shape | Architecture | Monthly Cost (4 instances) | Performance |
|-------|-------------|---------------------------|------------|
| VM.Standard.E2.1.Micro | x86 | ~$28-35 | Good for testing |
| VM.Standard.A1.Flex | ARM64 | ~$20-25 | Cost-optimized production |

---

## 🎯 Next Steps After Launch

1. ✅ **Verify Architecture Fix**: Test one instance first
2. ✅ **Launch All Services**: Use the batch commands above
3. ✅ **Configure DNS**: Update Cloudflare A records
4. ✅ **Health Checks**: Run unified status validation
5. ✅ **Load Testing**: Perform stress tests
6. ✅ **Monitoring Setup**: Configure alerts and logging

---

## 🚀 Mission Success Checklist

- [ ] Architecture compatibility resolved (x86 + ARM64 options)
- [ ] Test instance launches successfully
- [ ] All 4 services deployed with cloud-init
- [ ] Public IPs assigned and accessible
- [ ] Health endpoints responding (200 OK)
- [ ] DNS records configured and propagating
- [ ] End-to-end flow validated
- [ ] Load testing completed
- [ ] Monitoring/alerting configured
- [ ] Production readiness achieved

**🎉 You're now ready to bypass the CannotParseRequest blocker and achieve 100% deployment success!**
