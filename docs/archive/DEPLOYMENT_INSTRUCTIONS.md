# Vauntico MVP - Production Deployment Instructions

## 🚀 Complete Production Deployment Guide

This document provides step-by-step instructions for deploying the Vauntico MVP emergency revenue system to production.

---

## 📋 Prerequisites Checklist

### ✅ Required Access & Credentials

- [ ] OCI server SSH access with key pair
- [ ] Domain name access (api.vauntico.com)
- [ ] Vercel account access
- [ ] SSL certificate management access
- [ ] DNS management access
- [ ] PM2 installed on OCI server
- [ ] Nginx installed on OCI server

### ✅ Infrastructure Ready

- [ ] Neon PostgreSQL database running
- [ ] OCI server provisioned and accessible
- [ ] Domain pointing to OCI server
- [ ] Vercel project configured

---

## 🌐 Step 1: Backend Deployment (OCI + PM2)

### 1.1 Prepare OCI Server

```bash
# SSH into OCI server
ssh -i ~/.ssh/your-oci-key.pem ubuntu@your-oci-server-ip

# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+ if not installed
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx if not installed
sudo apt install -y nginx

# Create deployment directory
sudo mkdir -p /var/www/vauntico-server
sudo mkdir -p /var/log/vauntico
sudo mkdir -p /etc/letsencrypt/live/api.vauntico.com/
```

### 1.2 Deploy Backend Code

```bash
# Exit OCI server and run deployment from local
exit

# From local machine (Windows)
cd c:/Users/admin/vauntico-mvp
chmod +x deploy-to-oci.sh

# Update OCI server IP in deploy-to-oci.sh
# Edit line 8: OCI_SERVER="your-oci-server-ip"
# Replace with actual OCI server IP

# Run deployment
./deploy-to-oci.sh
```

### 1.3 Verify Backend Deployment

```bash
# Check PM2 status
ssh -i ~/.ssh/your-oci-key.pem ubuntu@your-oci-server-ip "pm2 status"

# Check application logs
ssh -i ~/.ssh/your-oci-key.pem ubuntu@your-oci-server-ip "pm2 logs vauntico-backend --lines 50"

# Test health endpoint
curl -I http://your-oci-server-ip/health
# Should return: HTTP/1.1 200 OK

# Test API endpoints
curl -I http://your-oci-server-ip/api/v1/health
curl -I http://your-oci-server-ip/api/v1/payment-bridge/status
```

---

## 🌍 Step 2: Nginx Reverse Proxy + SSL

### 2.1 Install SSL Certificates

```bash
# Install Certbot for Let's Encrypt
ssh -i ~/.ssh/your-oci-key.pem ubuntu@your-oci-server-ip "
sudo apt install -y certbot python3-certbot-nginx
sudo certbot certonly --nginx -d api.vauntico.com --email admin@vauntico.com --agree-tos --no-eff-email
"

# Setup automatic renewal
ssh -i ~/.ssh/your-oci-key.pem ubuntu@your-oci-server-ip "
echo '0 2 * * * /usr/bin/certbot renew --quiet --nginx --deploy-hook \"nginx -s reload\"' | sudo crontab -
"
```

### 2.2 Configure Nginx

```bash
# Copy Nginx configuration
scp -i ~/.ssh/your-oci-key.pem nginx/vauntico.conf ubuntu@your-oci-server-ip:/tmp/

# Install Nginx configuration
ssh -i ~/.ssh/your-oci-key.pem ubuntu@your-oci-server-ip "
sudo cp /tmp/vauntico.conf /etc/nginx/sites-available/
sudo ln -sf /etc/nginx/sites-available/vauntico.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
"

# Test Nginx configuration
ssh -i ~/.ssh/your-oci-key.pem ubuntu@your-oci-server-ip "
sudo nginx -t
sudo systemctl status nginx
"
```

### 2.3 Verify SSL Setup

```bash
# Test SSL certificate
curl -I https://api.vauntico.com/health

# Check SSL certificate details
openssl s_client -connect api.vauntico.com:443 -servername api.vauntico.com </dev/null 2>&1 | openssl x509 -noout -text
```

---

## 🎨 Step 3: Frontend Deployment (Vercel)

### 3.1 Install Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login
```

### 3.2 Deploy Frontend

```bash
# Deploy to production
cd c:/Users/admin/vauntico-mvp
vercel --prod --scope vauntico-mvp

# Or use Vercel Dashboard:
# 1. Go to vercel.com/dashboard
# 2. Connect GitHub repository
# 3. Configure environment variables
# 4. Deploy to production
```

### 3.3 Configure Vercel Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

```env
# Backend API Configuration
NEXT_PUBLIC_API_URL=https://api.vauntico.com

# Payment Configuration
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_07d44998c884b4d12e9b8524c72b9dbddb6263c9

# Feature Flags
NEXT_PUBLIC_ENABLE_PAYMENT_BRIDGE=true
NEXT_PUBLIC_ENABLE_VERIFICATION=true
NEXT_PUBLIC_ENABLE_CONTENT_RECOVERY=true

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_MIXPANEL_TOKEN=xxxxxxxx
```

### 3.4 Configure Custom Domain

In Vercel Dashboard → Settings → Domains:

```
# Add custom domain
Domain: api.vauntico.com (for backend API)
Domain: vauntico.com (for frontend)
```

---

## 🔧 Step 4: Environment Variables Configuration

### 4.1 Backend Environment Variables

Update `server-v2/.env` on OCI server:

```bash
ssh -i ~/.ssh/your-oci-key.pem ubuntu@your-oci-server-ip "
cd /var/www/vauntico-server
nano .env
"

# Update these values:
NODE_ENV=production
DATABASE_URL=postgresql://neondb_owner:npg_laWfvsB7Rb1y@ep-sparkling-bush-ahi9wjg6-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
BACKEND_URL=https://api.vauntico.com
FRONTEND_URL=https://vauntico.com
```

### 4.2 Restart Backend

```bash
ssh -i ~/.ssh/your-oci-key.pem ubuntu@your-oci-server-ip "
pm2 restart vauntico-backend
"
```

---

## 🔍 Step 5: Testing & Verification

### 5.1 Backend API Testing

```bash
# Test health endpoints
curl -I https://api.vauntico.com/health
curl -I https://api.vauntico.com/api/v1/health

# Test emergency revenue endpoints
curl -X GET https://api.vauntico.com/api/v1/payment-bridge/status
curl -X GET https://api.vauntico.com/api/v1/verify/status
curl -X GET https://api.vauntico.com/api/v1/recovery/status

# Test CORS preflight
curl -H "Origin: https://vauntico.com" -H "Access-Control-Request-Method: POST" -X OPTIONS https://api.vauntico.com/api/v1/payment-bridge/request
```

### 5.2 Frontend Testing

```bash
# Test frontend accessibility
curl -I https://vauntico.com/
curl -I https://vauntico.com/payment-bridge
curl -I https://vauntico.com/services/verification
curl -I https://vauntico.com/services/recovery

# Test API communication from browser
# Open browser: https://vauntico.com
# Check Network tab for API calls
# Test forms: Payment Bridge, Verification, Content Recovery
```

### 5.3 End-to-End Workflow Testing

```bash
# Create test user
curl -X POST https://api.vauntico.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "firstName": "Test",
    "lastName": "User"
  }'

# Test payment bridge flow
# 1. Login via frontend
# 2. Navigate to /payment-bridge
# 3. Fill form and submit
# 4. Check backend for request creation
# 5. Verify webhook processing

# Test verification flow
# 1. Navigate to /services/verification
# 2. Submit verification request
# 3. Check admin panel for verification status

# Test content recovery flow
# 1. Navigate to /services/recovery
# 2. Submit recovery case
# 3. Check case number generation
# 4. Verify admin panel for case status
```

---

## 📊 Step 6: Monitoring Setup

### 6.1 Backend Monitoring (Already Configured)

```bash
# Sentry is already configured in .env
SENTRY_DSN=https://5d94454fcc0960e8d36f67aefd0d05c5@o4510480205807616.ingest.us.sentry.io/4510480214851584

# Check Sentry dashboard for error tracking
# Visit: https://sentry.io/settings/
```

### 6.2 Additional Monitoring Setup

```bash
# Install monitoring on OCI server
ssh -i ~/.ssh/your-oci-key.pem ubuntu@your-oci-server-ip "
sudo apt install -y htop iotop nethogs
"

# Setup log rotation
ssh -i ~/.ssh/your-oci-key.pem ubuntu@your-oci-server-ip "
sudo nano /etc/logrotate.d/vauntico
"

# Content:
/var/log/vauntico/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644
    postrotate
        systemctl reload pm2
        systemctl reload nginx
}
```

---

## 🔄 Step 7: Backup & Disaster Recovery

### 7.1 Database Backup

```bash
# Neon has automatic backups, verify in dashboard
# Visit: https://console.neon.tech/
# Check backup schedule and retention
```

### 7.2 Application Backup

```bash
# Setup application backup script
ssh -i ~/.ssh/your-oci-key.pem ubuntu@your-oci-server-ip "
sudo nano /usr/local/bin/backup-vauntico.sh
"

# Content:
#!/bin/bash
DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/www/vauntico-server-backups/\$DATE"

mkdir -p \$BACKUP_DIR
cp -r /var/www/vauntico-server \$BACKUP_DIR
tar -czf \$BACKUP_DIR.tar.gz \$BACKUP_DIR

# Keep only last 7 days
find /var/www/vauntico-server-backups -type d -mtime +7 -exec rm -rf {} \;

echo "Backup completed: \$BACKUP_DIR.tar.gz"

chmod +x /usr/local/bin/backup-vauntico.sh

# Add to cron
echo '0 2 * * * /usr/local/bin/backup-vauntico.sh' | sudo crontab -
"
```

### 7.3 Disaster Recovery Procedures

```bash
# Create recovery documentation
ssh -i ~/.ssh/your-oci-key.pem ubuntu@your-oci-server-ip "
sudo nano /var/www/DISASTER_RECOVERY.md
"

# Content:
# Vauntico MVP - Disaster Recovery Procedures

## Database Recovery
1. Access Neon Dashboard: https://console.neon.tech/
2. Navigate to project database
3. Use point-in-time recovery if needed
4. Restore from backup using SQL restore

## Application Recovery
1. SSH into OCI server
2. Stop PM2: pm2 stop vauntico-backend
3. Restore from backup:
   cp -r /var/www/vauntico-server-backups/20251230_120000/* /var/www/vauntico-server/
4. Restart PM2: pm2 start vauntico-backend
5. Verify health: curl http://localhost:3000/health

## Frontend Recovery
1. Access Vercel Dashboard
2. Use rollback to previous deployment
3. Redeploy if needed
```

---

## 📱 Step 8: Final Production Verification

### 8.1 Complete System Check

```bash
# Frontend Checklist
[ ] https://vauntico.com loads properly
[ ] All forms submit successfully
[ ] API calls show in Network tab
[ ] No console errors
[ ] Responsive design works on mobile
[ ] SSL certificate valid (green padlock)

# Backend Checklist
[ ] https://api.vauntico.com/health returns 200
[ ] All API endpoints respond correctly
[ ] PM2 processes running stable
[ ] Nginx serving HTTPS properly
[ ] Database connections working
[ ] Error monitoring shows no critical errors
[ ] Log files rotating properly

# Integration Checklist
[ ] Payment Bridge: Frontend → Backend → Paystack working
[ ] Verification: API verification requests processing
[ ] Content Recovery: Case creation and management
[ ] Webhooks: Paystack webhooks receiving events
[ ] Monitoring: Sentry capturing errors, Slack alerts working
```

### 8.2 Performance Verification

```bash
# Load testing
ab -n 100 -c 10 https://vauntico.com/
ab -n 100 -c 10 https://api.vauntico.com/health

# Database performance
ssh -i ~/.ssh/your-oci-key.pem ubuntu@your-oci-server-ip "
cd /var/www/vauntico-server
node -e "
const { Client } = require('pg');
const client = new Client({
  connectionString: process.env.DATABASE_URL
});
client.connect().then(() => {
  console.log('✅ Database connection successful');
  return client.end();
}).catch(err => {
  console.error('❌ Database connection failed:', err.message);
});
"
```

### 8.3 Security Verification

```bash
# SSL Certificate Check
echo "SSL Certificate expiry:"
openssl s_client -connect api.vauntico.com:443 -servername api.vauntico.com 2>/dev/null </dev/null | openssl x509 -noout -dates | grep "notAfter"

# Security Headers Check
curl -I https://api.vauntico.com/health

# Rate Limiting Test
for i in {1..15}; do
  curl -s https://api.vauntico.com/health &
done
wait
echo "Rate limiting test completed"
```

---

## 🚀 GO-LIVE AUTHORIZATION

### Final Sign-off Checklist

- [ ] All health checks passing
- [ ] Load tests completed successfully
- [ ] Security verification complete
- [ ] Monitoring systems active
- [ ] Backup procedures tested
- [ ] Team notification sent
- [ ] Documentation updated
- [ ] Support team trained

### Production Launch Decision

When ALL items above are checked:

1. Send team notification: "Vauntico MVP GO-LIVE approved"
2. Update status page: https://status.vauntico.com
3. Begin user onboarding
4. Monitor first 24 hours closely
5. Schedule post-launch review meeting

---

## 📞 Emergency Contacts

### Technical Support

- **Backend Issues**: [Backend Dev Contact]
- **Frontend Issues**: [Frontend Dev Contact]
- **Database Issues**: [DBA Contact]
- **Infrastructure**: [DevOps Contact]
- **Security**: [Security Team Contact]

### Critical Systems

- **OCI Console**: https://console.oracle-cloud.com/
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Neon Dashboard**: https://console.neon.tech/
- **Sentry Monitoring**: https://sentry.io/settings/
- **Domain Management**: [Domain Provider]
- **SSL Provider**: [Certificate Provider]

---

## 📚 Post-Deployment Monitoring

### First 24 Hours

- Monitor error rates in Sentry
- Check PM2 process stability
- Verify SSL certificate functioning
- Monitor database performance
- Track user sign-up conversion
- Watch payment processing success rates

### Ongoing Monitoring

- Daily error report review
- Weekly performance metrics
- Monthly security scans
- Quarterly backup verification
- Annual architecture review

---

**Deployment Version**: 1.0  
**Last Updated**: 2025-12-30  
**Next Review**: 2026-01-30
