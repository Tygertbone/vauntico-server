# Vauntico VPS Deployment Checklist

## Pre-Deployment Checklist

### ✅ VPS Setup

- [ ] Ubuntu 22.04 LTS VPS provisioned (AWS/Oracle Cloud)
- [ ] Security groups configured (SSH:22, HTTP:80, HTTPS:443)
- [ ] Domain names pointing to VPS IP address
- [ ] SSH key access configured
- [ ] Initial system update completed

### ✅ Environment Configuration

- [ ] Repository cloned to VPS
- [ ] `.env.template` copied to `.env`
- [ ] All environment variables filled in:
  - [ ] Database connection string
  - [ ] JWT secret (strong, unique)
  - [ ] API keys (Paystack, Stripe, Resend, Anthropic)
  - [ ] Airtable credentials
  - [ ] Domain names configured
  - [ ] SSL email address
- [ ] `.env` file permissions secured (chmod 600)

### ✅ DNS Configuration

- [ ] A records created for all subdomains:
  - [ ] trust-score.mydomain.com → VPS IP
  - [ ] vauntico-server.mydomain.com → VPS IP
  - [ ] fulfillment.mydomain.com → VPS IP
  - [ ] legacy.mydomain.com → VPS IP
- [ ] DNS propagation verified (nslookup/dig)

## Deployment Process

### ✅ System Preparation

- [ ] Docker and Docker Compose installed
- [ ] NGINX and Certbot installed
- [ ] Directory structure created
- [ ] File permissions set correctly
- [ ] Deployment script made executable

### ✅ Service Deployment

- [ ] Docker images built successfully
- [ ] All containers started:
  - [ ] trust-score-backend (port 3001)
  - [ ] vauntico-server (port 3002)
  - [ ] fulfillment-engine (port 5000)
  - [ ] legacy-server (port 5001)
  - [ ] nginx-proxy (ports 80, 443)
  - [ ] certbot (SSL renewal)

### ✅ Health Checks

- [ ] Local HTTP endpoints responding:
  - [ ] http://localhost:3001/health → 200
  - [ ] http://localhost:3002/health → 200
  - [ ] http://localhost:5000/api/status → 200
  - [ ] http://localhost:5001/api/status → 200

### ✅ SSL Certificate Setup

- [ ] Let's Encrypt certificates generated
- [ ] NGINX configuration updated with SSL
- [ ] HTTP to HTTPS redirects working
- [ ] SSL certificate auto-renewal configured

### ✅ Final Verification

- [ ] HTTPS endpoints accessible:
  - [ ] https://trust-score.mydomain.com/health → 200
  - [ ] https://vauntico-server.mydomain.com/health → 200
  - [ ] https://fulfillment.mydomain.com/api/status → 200
  - [ ] https://legacy.mydomain.com/api/status → 200
- [ ] SSL certificates valid (check browser)
- [ ] Security headers present
- [ ] Rate limiting functional

## Post-Deployment Checklist

### ✅ Monitoring Setup

- [ ] Health check script tested
- [ ] Log monitoring configured
- [ ] System resource monitoring setup
- [ ] SSL expiry monitoring
- [ ] Automated health checks scheduled (crontab)

### ✅ Security Hardening

- [ ] UFW firewall configured and enabled
- [ ] SSH key-only authentication
- [ ] Fail2ban installed and configured
- [ ] System update schedule configured
- [ ] Backup strategy implemented

### ✅ Documentation

- [ ] Deployment guide reviewed
- [ ] Management commands documented
- [ ] Troubleshooting guide available
- [ ] Recovery procedures tested
- [ ] Team access and responsibilities defined

### ✅ Performance Optimization

- [ ] Docker resource limits reviewed
- [ ] NGINX performance tuning applied
- [ ] Database connection pooling configured
- [ ] Caching strategies implemented
- [ ] CDN configuration considered

## Ongoing Maintenance

### Weekly Tasks

- [ ] Run health check script
- [ ] Review application logs
- [ ] Check system resource usage
- [ ] Verify SSL certificate status
- [ ] Monitor for security updates

### Monthly Tasks

- [ ] Apply system security updates
- [ ] Clean up Docker resources
- [ ] Review and rotate secrets if needed
- [ ] Performance metrics review
- [ ] Backup verification

### Quarterly Tasks

- [ ] Full security audit
- [ ] Performance optimization review
- [ ] Disaster recovery testing
- [ ] Documentation updates
- [ ] Capacity planning review

## Emergency Procedures

### 🚨 Service Outage Response

1. [ ] Run health check script to identify issues
2. [ ] Check container status: `sudo docker-compose ps`
3. [ ] Review service logs: `sudo docker-compose logs -f [service]`
4. [ ] Restart affected services: `sudo docker-compose restart [service]`
5. [ ] Verify with health check script

### 🚨 SSL Certificate Issues

1. [ ] Check certificate status: `sudo certbot certificates`
2. [ ] Test NGINX configuration: `sudo nginx -t`
3. [ ] Renew certificates: `sudo certbot renew`
4. [ ] Reload NGINX: `sudo systemctl reload nginx`

### 🚨 High Resource Usage

1. [ ] Check system resources: `htop`, `df -h`
2. [ ] Monitor Docker: `docker stats`
3. [ ] Identify resource-heavy containers
4. [ ] Scale or optimize as needed

## Contact Information

### Primary Contacts

- **System Administrator:** [Name] - [Email] - [Phone]
- **DevOps Engineer:** [Name] - [Email] - [Phone]
- **Application Lead:** [Name] - [Email] - [Phone]

### Service Providers

- **VPS Provider:** [AWS/Oracle Cloud Support]
- **Domain Registrar:** [Registrar Support]
- **SSL Provider:** Let's Encrypt Community

## Quick Reference Commands

### Essential Commands

```bash
# Full deployment
./scripts/vps/deploy.sh

# Health check
./scripts/vps/health-check.sh

# Service management
sudo docker-compose ps
sudo docker-compose logs -f
sudo docker-compose restart
sudo docker-compose down
sudo docker-compose up -d

# SSL management
sudo certbot certificates
sudo certbot renew
sudo nginx -t
sudo systemctl reload nginx

# System monitoring
htop
df -h
docker stats
```

### Emergency Rollback

```bash
# Quick service restart
sudo docker-compose restart

# Full service rebuild
sudo docker-compose down
sudo docker-compose build --no-cache
sudo docker-compose up -d

# SSL certificate regeneration
sudo certbot --nginx -d domain1.com -d domain2.com --force-renewal
```

## Success Criteria

### ✅ Deployment Success

- All 4 services accessible via HTTPS
- Health endpoints returning 200 status
- SSL certificates valid and auto-renewing
- NGINX proxy functioning correctly
- Security headers and rate limiting active

### ✅ Monitoring Success

- Health checks passing consistently
- Log monitoring operational
- Resource usage within acceptable limits
- Automated alerts configured
- Backup procedures tested

---

**Last Updated:** [Date]
**Version:** 1.0
**Next Review:** [Date + 3 months]

This checklist should be reviewed and updated regularly to reflect changes in the deployment architecture and operational requirements.
