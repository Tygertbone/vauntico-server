# Vauntico MVP - Complete Deployment Guide

## 🎯 Overview

This is the **official deployment guide** for Vauntico MVP. It consolidates all previous documentation into a single, authoritative source.

**Services:**
- Frontend: React/Vite application (deployed to Vercel)
- Backend: Node.js/TypeScript API (deployed to OCI)
- Payments: Fulfillment engine (deployed to Vercel)

**Deployment Targets:**
- Frontend: Vercel (Primary)
- Backend: Oracle Cloud Infrastructure (OCI)
- DNS: Cloudflare
- Monitoring: Built-in health checks

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- OCI CLI installed and configured
- Vercel account connected to GitHub
- Domain managed in Cloudflare
- Git access to repository

### Deployment Commands
```bash
# 1. Deploy Backend (OCI)
./backend-deploy-v2-optimized.sh

# 2. Deploy Frontend (Vercel)
# Push to main branch → Auto-deploys to Vercel

# 3. Configure DNS
./cloudflare-dns-setup.sh

# 4. Validate Deployment
./validate-backend-deployment.sh
```

---

## 📋 Detailed Deployment Process

### Phase 1: Backend Deployment (OCI)

#### 1.1 Prepare OCI Environment
```bash
# Install OCI CLI (if not done)
curl -L https://raw.githubusercontent.com/oracle/oci-cli/master/scripts/install/install.sh | bash

# Configure OCI CLI
oci setup config
```

#### 1.2 Deploy Backend Service
```bash
# Make script executable
chmod +x backend-deploy-v2-optimized.sh

# Run deployment
./backend-deploy-v2-optimized.sh
```

**What this does:**
- Creates OCI compute instance
- Installs Node.js, PM2, Nginx
- Deploys backend application
- Configures systemd service
- Sets up monitoring and logging
- Implements security hardening

#### 1.3 Verify Backend Deployment
```bash
# Run validation script
./validate-backend-deployment.sh http://your-backend-ip:3000
```

**Expected endpoints:**
- Health: `http://your-backend-ip:3000/health`
- Status: `http://your-backend-ip:3000/api/v1/status`
- API Docs: `http://your-backend-ip:3000/api/docs`

---

### Phase 2: Frontend Deployment (Vercel)

#### 2.1 Configure Environment Variables
In Vercel dashboard, set:
```bash
VITE_API_URL=https://api.vauntico.com
VITE_APP_URL=https://vauntico.com
VITE_PAYSTACK_PUBLIC_KEY=pk_live_your_key_here
```

#### 2.2 Deploy to Vercel
```bash
# Push to main branch (auto-deploys)
git add .
git commit -m "deploy: update frontend for production"
git push origin main
```

---

### Phase 3: DNS Configuration (Cloudflare)

#### 3.1 Configure DNS Records
```bash
# Run DNS setup script
./cloudflare-dns-setup.sh
```

**Manual DNS Records:**
```
A    api.vauntico.com    → OCI_BACKEND_IP
A    vauntico.com        → VERCEL_IPV4
CNAME www.vauntico.com   → vauntico.vercel.app
```

---

### Phase 4: SSL & Security

#### 4.1 SSL Certificates
- Vercel: Automatic SSL included
- OCI: Configure SSL certificate in load balancer
- Cloudflare: SSL/TLS encryption enabled

#### 4.2 Security Headers
Backend includes security headers via Helmet:
- CSP (Content Security Policy)
- HSTS (HTTP Strict Transport Security)
- X-Frame-Options
- X-Content-Type-Options

---

## 🔧 Configuration Management

### Environment Variables

#### Backend (.env)
```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=your-jwt-secret-here
RESEND_API_KEY=your-resend-api-key
PAYSTACK_SECRET_KEY=sk_live_your_secret_key
```

#### Frontend (Vercel)
```bash
VITE_API_URL=https://api.vauntico.com
VITE_APP_URL=https://vauntico.com
VITE_PAYSTACK_PUBLIC_KEY=pk_live_your_public_key
```

### Service Configuration

#### PM2 (Process Manager)
Backend runs with PM2 cluster mode:
- Instances: `max` (CPU cores)
- Memory limit: 1GB
- Auto-restart: enabled
- Graceful reload: supported

#### Nginx (Web Server)
- Reverse proxy to backend
- SSL termination
- Static file serving
- Rate limiting
- Logging

---

## 📊 Monitoring & Health Checks

### Health Endpoints
```bash
# Backend health
curl https://api.vauntico.com/health

# Response example
{
  "status": "healthy",
  "timestamp": "2025-01-05T11:30:00.000Z",
  "version": "2.0.0",
  "uptime": 3600,
  "memory": {
    "used": "150MB",
    "total": "1GB"
  },
  "environment": "production"
}
```

### Monitoring Dashboard
Access via:
- Backend logs: `pm2 logs vauntico-backend`
- System metrics: `pm2 monit`
- Nginx logs: `/var/log/nginx/`

---

## 🚨 Troubleshooting

### Common Issues

#### Backend Deployment Fails
```bash
# Check OCI CLI configuration
oci setup config

# Verify compartment permissions
oci iam compartment list

# Check instance status
oci compute instance list --compartment-id YOUR_COMPARTMENT_ID
```

#### Frontend Build Errors
```bash
# Clear Vercel cache
vercel --prod --force

# Check environment variables
vercel env list
```

#### DNS Issues
```bash
# Verify DNS propagation
nslookup api.vauntico.com
dig vauntico.com

# Check Cloudflare settings
curl -I https://vauntico.com
```

### Health Check Failures
```bash
# Check backend service status
pm2 status

# Restart backend service
pm2 restart vauntico-backend

# Check system resources
df -h
free -m
```

---

## 🔄 Deployment Rollback

### Backend Rollback
```bash
# SSH into OCI instance
ssh -i ~/.ssh/your-key.pem ubuntu@your-instance-ip

# Roll PM2 to previous version
pm2 reload vauntico-backend

# Or stop service
pm2 stop vauntico-backend
```

### Frontend Rollback
```bash
# Rollback to previous commit
git log --oneline
git revert <commit-hash>
git push origin main
```

---

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] OCI CLI configured and tested
- [ ] Vercel account connected
- [ ] Environment variables prepared
- [ ] SSL certificates ready
- [ ] DNS zone accessible

### During Deployment
- [ ] Backend instance created successfully
- [ ] Backend health checks passing
- [ ] Frontend builds without errors
- [ ] DNS records configured
- [ ] SSL certificates active

### Post-Deployment
- [ ] All health endpoints responding
- [ ] SSL certificates valid
- [ ] DNS resolving correctly
- [ ] Monitoring alerts configured
- [ ] Performance baseline established

---

## 🚀 Production Optimization

### Performance
- Frontend: Vite build optimization
- Backend: PM2 cluster mode
- Database: Connection pooling
- CDN: Cloudflare caching

### Security
- Rate limiting implemented
- Security headers configured
- Input validation enabled
- Secrets management via environment variables

### Scalability
- Horizontal scaling via PM2
- Load balancer configuration
- Database read replicas (if needed)
- CDN for static assets

---

## 📞 Support & Contacts

### Technical Support
- Backend issues: Check PM2 logs
- Frontend issues: Check Vercel dashboard
- DNS issues: Check Cloudflare settings
- Infrastructure: Check OCI console

### Monitoring Alerts
Configure alerts for:
- Backend health check failures
- High memory/CPU usage
- SSL certificate expiration
- DNS resolution failures

---

## 📚 Additional Resources

### Documentation
- API Documentation: `/api/docs` endpoint
- Architecture Guide: See repository docs/
- Security Policies: See repository docs/

### Scripts Reference
- `backend-deploy-v2-optimized.sh` - Main deployment
- `validate-backend-deployment.sh` - Health checks
- `deploy-via-bastion.sh` - OCI Bastion deployment
- `cloudflare-dns-setup.sh` - DNS configuration

---

**Last Updated**: January 5, 2025  
**Version**: 2.0.0  
**Status**: Production Ready  

For issues or questions, see repository issues or contact the development team.
