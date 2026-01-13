# Vauntico Backend Deployment Runbook

**Date:** January 5, 2026  
**Version:** 1.0  
**Status:** 🎉 **PRODUCTION-READY DEPLOYMENT GUIDE**

---

## 🎯 **DEPLOYMENT OVERVIEW**

This runbook provides a **complete, step-by-step guide** for deploying Vauntico backend services to Oracle Cloud Infrastructure (OCI) with full automation, monitoring, and validation procedures.

### **Target Infrastructure:**

- **Provider:** Oracle Cloud Infrastructure (OCI)
- **Region:** Johannesburg (Uocm:JOHANNESBURG-1-AD-1)
- **Compute Shape:** VM.Standard.E2.1
- **Services:** 4 services (trust-score, vauntico-server, fulfillment, legacy)
- **Ports:** 3000-3003 (one per service)
- **Networking:** Public IP assignment with security groups

---

## 🔧 **PREREQUISITES CHECKLIST**

### **✅ REQUIRED CREDENTIALS:**

- [ ] OCI Compartment OCID
- [ ] OCI User OCID with compute permissions
- [ ] OCI API Signing Key file
- [ ] OCI Availability Domain name
- [ ] OCI Subnet OCID in correct VCN
- [ ] OCI Image OCID for Ubuntu/Oracle Linux
- [ ] OCI Security List OCID for security groups

### **✅ REQUIRED TOOLS:**

- [ ] OCI CLI installed and configured
- [ ] PowerShell 5.1+ for deployment scripts
- [ ] SSH client (plink/PuTTY) for service deployment
- [ ] Docker installed on target instances
- [ ] curl for health and integration testing

### **✅ REQUIRED PERMISSIONS:**

- [ ] Compute instance management in compartment
- [ ] Network management in VCN
- [ ] Security list management for security groups
- [ ] Image list access for base images
- [ ] VNIC assignment for public IP addresses
- [ ] Internet gateway access for public connectivity

### **✅ REQUIRED CONFIGURATION:**

- [ ] OCI CLI configuration with correct region
- [ ] Security groups allowing ports 22, 3000-3003
- [ ] Network security lists allowing required traffic
- [ ] Route tables configured for internet access
- [ ] SSH key management for instance access

---

## 🚀 **DEPLOYMENT PHASES**

### **Phase 1: Environment Setup (5 Minutes)**

```bash
# 1.1 Configure OCI CLI
oci setup config
# Follow prompts for:
# - User OCID
# - Tenancy OCID
# - Region (Johannesburg)
# - Private key file path

# 1.2 Verify OCI CLI configuration
oci iam user get --current-user
oci iam compartment list --query 'data[0]."compartment-name"'
```

### **Phase 2: Instance Provisioning (30-45 Minutes)**

```bash
# 2.1 Launch all 4 instances concurrently
./deploy-vauntico-complete.ps1

# Expected output:
# - Instance OCID for each service
# - Public IP address for each service
# - Launch time: 2-5 minutes per instance
```

### **Phase 3: Service Deployment (15-30 Minutes)**

```bash
# 3.1 Monitor instance status
oci compute instance list --compartment-id $CompartmentId --lifecycle-state RUNNING

# 3.2 Wait for instances to be ready
# instances typically need 2-3 minutes to fully boot

# 3.3 Verify service deployment
# Services will be deployed automatically via cloud-init
# Docker images pulled and started automatically
```

### **Phase 4: Health Verification (10 Minutes)**

```bash
# 4.1 Verify health endpoints
curl -I http://<TRUST_SCORE_IP>:3000/health
curl -I http://<SERVER_IP>:3001/health
curl -I http://<FULFILLMENT_IP>:3002/health
curl -I http://<LEGACY_IP>:3003/health

# 4.2 Expected responses
# HTTP/1.1 200 OK for all services
# Response body with service status and timestamps
```

### **Phase 5: DNS Configuration (15-30 Minutes)**

```bash
# 5.1 Create DNS records
# Use provided PowerShell script commands
# Cloudflare API integration
# A records for all 4 subdomains

# 5.2 Verify DNS propagation
nslookup trust-score.vauntico.com
nslookup vauntico-server.vauntico.com
nslookup fulfillment.vauntico.com
nslookup legacy.vauntico.com

# 5.3 Expected results
# All subdomains resolve to correct public IPs
# TTL: 120 seconds (configured for rapid propagation)
```

### **Phase 6: Integration Testing (20-30 Minutes)**

```bash
# 6.1 Test API endpoints
curl -I https://vault.vauntico.com/api/waitlist
curl -I https://trust-score.vauntico.com/health
curl -I https://vauntico-server.vauntico.com/api/waitlist

# 6.2 Test payment processing
curl -X POST https://vauntico-server.vauntico.com/payments/test \
  -H "Content-Type: application/json" \
  -d '{"amount":100,"currency":"ZAR"}'

# 6.3 Expected responses
# API endpoints return HTTP 200 OK
# Payment test returns JSON confirmation
# Health endpoints respond with service status
```

---

## 🔍 **SERVICE CONFIGURATION DETAILS**

### **Trust Score Service (Port 3000)**

```yaml
# Docker configuration
image: vauntico/trust-score:latest
ports:
  - "3000:3000"
environment:
  - NODE_ENV: production
  - DATABASE_URL: $DATABASE_URL
  - REDIS_URL: $REDIS_URL
restart_policy: unless-stopped
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

### **Vauntico Server (Port 3001)**

```yaml
# Docker configuration
image: vauntico/vauntico-server:latest
ports:
  - "3001:3001"
environment:
  - NODE_ENV: production
  - DATABASE_URL: $DATABASE_URL
  - REDIS_URL: $REDIS_URL
  - JWT_SECRET: $JWT_SECRET
  - PAYSTACK_SECRET_KEY: $PAYSTACK_SECRET_KEY
  - STRIPE_SECRET_KEY: $STRIPE_SECRET_KEY
restart_policy: unless-stopped
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

### **Fulfillment Engine (Port 3002)**

```yaml
# Docker configuration
image: vauntico/fulfillment:latest
ports:
  - "3002:3002"
environment:
  - NODE_ENV: production
  - DATABASE_URL: $DATABASE_URL
  - REDIS_URL: $REDIS_URL
restart_policy: unless-stopped
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3002/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

### **Legacy Server (Port 3003)**

```yaml
# Docker configuration
image: vauntico/legacy:latest
ports:
  - "3003:3003"
environment:
  - NODE_ENV: production
  - DATABASE_URL: $DATABASE_URL
  - REDIS_URL: $REDIS_URL
restart_policy: unless-stopped
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3003/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

---

## 🛠️ **TROUBLESHOOTING GUIDE**

### **Common Issues and Solutions**

#### **Issue 1: Instance Launch Fails**

```
Error: AuthorizationFailed
```

**Solutions:**

- Verify OCID and IAM permissions
- Check compartment quotas
- Validate shape availability in AD
- Confirm subnet exists and is accessible
- Check image OCID exists and is accessible

#### **Issue 2: SSH Connection Fails**

```
Error: SSH error: Connection timed out
```

**Solutions:**

- Wait 2-3 minutes after instance launch
- Verify security group allows SSH (port 22)
- Check SSH key is properly configured
- Verify network connectivity to instance

#### **Issue 3: Health Check Fails**

```
Error: HTTP/1.1 503 Service Unavailable
```

**Solutions:**

- Check Docker service status: `docker ps`
- Check service logs: `docker logs <service-name>`
- Restart service: `docker-compose restart <service-name>`
- Verify port mapping in docker-compose.yml

#### **Issue 4: DNS Propagation Delay**

```
Error: Non-existent domain
```

**Solutions:**

- Wait 5-15 minutes for DNS propagation
- Check DNS records in Cloudflare dashboard
- Use `nslookup` to verify resolution
- Check TTL settings (recommend 120 seconds)

#### **Issue 5: API Integration Fails**

```
Error: CORS policy blocked request
```

**Solutions:**

- Check CORS configuration in backend services
- Verify frontend origin in allowed list
- Check API gateway configuration in Vercel
- Test with different HTTP methods (GET, POST, OPTIONS)

---

## 📊 **MONITORING AND VALIDATION**

### **Health Check Automation**

```bash
# Automated health monitoring script
#!/bin/bash
SERVICES=("trust-score" "vauntico-server" "fulfillment" "legacy")
DOMAINS=("trust-score.vauntico.com" "vauntico-server.vauntico.com" "fulfillment.vauntico.com" "legacy.vauntico.com")

for i in "${!SERVICES[@]}"; do
    echo "Checking ${SERVICES[$i]} health..."
    response=$(curl -s -w "%{http_code}" "https://${DOMAINS[$i]}/health" -o /dev/null)
    if [ "$response" = "200" ]; then
        echo "✅ ${SERVICES[$i]} healthy"
    else
        echo "❌ ${SERVICES[$i]} unhealthy: $response"
    fi
    sleep 30
done
```

### **Performance Monitoring**

```bash
# Performance testing script
#!/bin/bash
ENDPOINTS=("https://trust-score.vauntico.com/health" "https://vauntico-server.vauntico.com/health" "https://fulfillment.vauntico.com/health" "https://legacy.vauntico.com/health")

for endpoint in "${ENDPOINTS[@]}"; do
    echo "Testing $endpoint..."
    start_time=$(date +%s)
    response_time=$(curl -o /dev/null -s -w "%{time_total}" "$endpoint")
    end_time=$(date +%s)
    total_time=$((end_time - start_time))

    echo "Response time: ${total_time}s"
    if [ $total_time -lt 200 ]; then
        echo "✅ $endpoint: Fast response"
    elif [ $total_time -lt 500 ]; then
        echo "✅ $endpoint: Good response"
    else
        echo "⚠️ $endpoint: Slow response"
    fi
    sleep 5
done
```

### **Log Monitoring**

```bash
# Log collection script
#!/bin/bash
SERVICES=("trust-score" "vauntico-server" "fulfillment" "legacy")

for service in "${SERVICES[@]}"; do
    echo "=== $service logs (last 50 lines) ==="
    ssh opc@$service "docker logs --tail=50 $service" 2>/dev/null || echo "Failed to get logs for $service"
    echo ""
done
```

---

## 🔐 **SECURITY CONFIGURATION**

### **OCI Security Best Practices**

```bash
# Security group configuration
oci network security-list create \
  --compartment-id $CompartmentId \
  --display-name "vauntico-security-group" \
  --vcn-id $VcnId \
  --egress-security-rules '[
    {
      "protocol":"all","destination":"0.0.0.0/0"
    }
  ]' \
  --ingress-security-rules '[
    {
      "protocol":"6","source":"0.0.0.0/0","tcpOptions":{"min_port":22,"max_port":22}
    },
    {
      "protocol":"6","source":"0.0.0.0/0","tcpOptions":{"min_port":80,"max_port":80}
    },
    {
      "protocol":"6","source":"0.0.0.0/0","tcpOptions":{"min_port":443,"max_port":443}
    },
    {
      "protocol":"6","source":"0.0.0.0/0","tcpOptions":{"min_port":3000,"max_port":3000}
    },
    {
      "protocol":"6","source":"0.0.0.0/0","tcpOptions":{"min_port":3001,"max_port":3001}
    },
    {
      "protocol":"6","source":"0.0.0.0/0","tcpOptions":{"min_port":3002,"max_port":3002}
    },
    {
      "protocol":"6","source":"0.0.0.0/0","tcpOptions":{"min_port":3003,"max_port":3003}
    }
  ]'
```

### **SSH Key Management**

```bash
# Generate SSH key pair for each service
ssh-keygen -t rsa -b 4096 -C "vauntico-ssh-key" -f "vauntico-ssh-key"
# Copy public key to cloud-init
# Add authorized_keys section to cloud-init.yaml
```

### **Network Security**

```bash
# Network list configuration
oci network vcn list --compartment-id $CompartmentId

# Subnet configuration
oci network subnet list --compartment-id $CompartmentId --vcn-id $VcnId

# Route table configuration
oci route-table create \
  --compartment-id $CompartmentId \
  --vcn-id $VcnId \
  --display-name "vauntico-route-table" \
  --route-rules '[
    {
      "destination":"0.0.0.0/0",
      "destination_type":"INTERNET_GATEWAY",
      "network_entity_id":"<IGW_ID>"
    }
  ]'
```

---

## 📋 **POST-DEPLOYMENT VALIDATION**

### **Success Criteria Checklist**

- [ ] All 4 OCI instances launched successfully
- [ ] All instances have public IP addresses
- [ ] Docker services deployed on all instances
- [ ] All health endpoints responding with HTTP 200 OK
- [ ] DNS A records created for all subdomains
- [ ] DNS propagation completed successfully
- [ ] API integration tests passing
- [ ] Payment processing working in sandbox mode
- [ ] SSL certificates valid on all domains
- [ ] Security groups properly configured
- [ ] Monitoring and alerting configured

### **Performance Requirements**

- [ ] API response times < 200ms
- [ ] Database query times < 100ms
- [ ] Uptime > 99.9%
- [ ] Load handling > 1000 concurrent users
- [ ] Page load times < 2 seconds

### **Business Requirements**

- [ ] All revenue-generating services operational
- [ ] User onboarding workflows functional
- [ ] Payment processing with Paystack working
- [ ] Trust score calculations operational
- [ ] Content recovery system functional
- [ ] Monitoring and alerting active
- [ ] Backup and recovery procedures tested

---

## 📞 **ESCALATION CONTACTS**

### **Immediate Support (24/7)**

- **Infrastructure Team:** OCI deployment issues, networking problems
- **DevOps Team:** Service deployment failures, automation issues
- **Security Team:** Security incidents, access problems
- **Application Team:** Service functionality issues, integration problems

### **Escalation Process**

1. **Level 1:** Use runbook troubleshooting procedures
2. **Level 2:** Contact appropriate support team
3. **Level 3:** Executive notification for production issues
4. **Level 4:** Emergency rollback procedures

### **Contact Information**

- **Infrastructure Lead:** [Infrastructure Team Lead]
- **DevOps Lead:** [DevOps Team Lead]
- **Security Officer:** [Security Team Lead]
- **Application Architect:** [Application Team Lead]

---

## 📈 **BACKUP AND RECOVERY**

### **Automated Backups**

```bash
# Database backup script
#!/bin/bash
BACKUP_DIR="/srv/backups/vauntico"
DATE=$(date +%Y-%m-%d)
BACKUP_FILE="$BACKUP_DIR/vauntico-backup-$DATE.sql"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create database backup
pg_dump $DATABASE_URL > $BACKUP_FILE

# Upload backup to OCI Object Storage
oci os object put \
  --bucket "vauntico-backups" \
  --file $BACKUP_FILE \
  --name "database-backup-$DATE"
```

### **Disaster Recovery**

```bash
# Recovery procedures
1. Stop all services: `docker-compose down`
2. Restore database from backup
3. Restart all services: `docker-compose up -d`
4. Verify all health endpoints
5. Run integration tests
```

### **Rollback Procedures**

```bash
# Rollback to previous version
git checkout <previous-stable-tag>

# Redeploy with previous configuration
./deploy-vauntico-complete.ps1

# Verify rollback success
curl -I https://vault.vauntico.com/health
```

---

## 🎯 **OPTIMIZATION TIPS**

### **Performance Optimization**

- Use OCI Compute Optimizer for shape selection
- Implement Redis caching for frequently accessed data
- Use connection pooling for database connections
- Implement CDN for static assets
- Enable gzip compression for API responses

### **Cost Optimization**

- Use spot instances for non-critical workloads
- Implement auto-scaling for variable traffic
- Use resource tagging for cost allocation
- Regularly review and terminate unused resources

### **Security Optimization**

- Implement rate limiting for all API endpoints
- Use WAF (Web Application Firewall) for protection
- Regular security audits and penetration testing
- Implement least privilege access for all systems
- Use encrypted communication for all data transfer

---

## 📚 **MAINTENANCE OPERATIONS**

### **Daily Checks**

- [ ] Verify all health endpoints (every 30 minutes)
- [ ] Monitor system resource utilization
- [ ] Check error logs for anomalies
- [ ] Verify DNS resolution for all subdomains
- [ ] Monitor SSL certificate expiration dates
- [ ] Review security group rules for compliance

### **Weekly Maintenance**

- [ ] Update all Docker images to latest versions
- [ ] Apply security patches and updates
- [ ] Review and rotate SSH keys
- [ ] Backup database and configuration files
- [ ] Review and update IAM policies
- [ ] Test disaster recovery procedures

### **Monthly Tasks**

- [ ] Comprehensive security audit
- [ ] Performance testing and optimization
- [ ] Cost analysis and optimization
- [ ] Review and update documentation
- [ ] Capacity planning and resource allocation
- [ ] Team training and knowledge sharing

---

## 📋 **COMPLIANCE AND AUDIT**

### **Security Compliance**

- [ ] GDPR compliance for data handling
- [ ] PCI DSS compliance for payment processing
- [ ] SOC 2 Type II audit for security controls
- [ ] Regular vulnerability assessments
- [ ] Penetration testing by certified third parties
- [ ] Data encryption at rest and in transit

### **Infrastructure Compliance**

- [ ] ISO 27001 certification for information security
- [ ] SOC 2 Type I report for organizational controls
- [ ] Cloud Security Alliance (CSA) membership verification
- [ ] Regular third-party security assessments
- [ ] Data residency and sovereignty compliance

---

**Runbook Created:** January 5, 2026  
**Version:** 1.0  
**Status:** 🎉 **PRODUCTION-READY**

---

**Next Steps:**

1. **Complete Prerequisites:** Ensure all required credentials and permissions
2. **Execute Deployment:** Run `deploy-vauntico-complete.ps1`
3. **Monitor Progress:** Use health monitoring and validation scripts
4. **Validate Success:** Ensure all success criteria are met

**Deployment Timeline:** 1.5-3.5 hours from start to production readiness
