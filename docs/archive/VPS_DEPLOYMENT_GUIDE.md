# Vauntico VPS Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the Vauntico application stack on a VPS with Docker Compose and NGINX reverse proxy.

## Architecture

The deployment consists of:

- **4 Backend Services:**
  - Trust Score Backend (server-v2) → Port 3001
  - Vauntico Server → Port 3002
  - Fulfillment Engine → Port 5000
  - Legacy Server → Port 5001

- **Infrastructure:**
  - Docker & Docker Compose
  - NGINX Reverse Proxy
  - Let's Encrypt SSL Certificates
  - Automatic SSL renewal

## Prerequisites

### VPS Requirements

- Ubuntu 22.04 LTS
- Minimum 2GB RAM, 2 CPU cores
- 20GB+ storage
- Public IP address
- Domain names configured to point to VPS IP

### Domain Setup

Before starting, ensure you have these domains configured:

- `trust-score.mydomain.com`
- `vauntico-server.mydomain.com`
- `fulfillment.mydomain.com`
- `legacy.mydomain.com`

Replace `mydomain.com` with your actual domain.

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/your-username/vauntico-mvp.git
cd vauntico-mvp
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.template .env

# Edit with your actual values
nano .env
```

### 3. Run Deployment

```bash
chmod +x scripts/vps/deploy.sh
./scripts/vps/deploy.sh
```

## Detailed Deployment Steps

### Step 1: VPS Provisioning

#### Option A: AWS Free Tier

1. Sign up for AWS Free Tier
2. Launch Ubuntu 22.04 LTS t2.micro instance
3. Configure security groups:
   - SSH (Port 22)
   - HTTP (Port 80)
   - HTTPS (Port 443)

#### Option B: Oracle Cloud Always Free

1. Sign up for Oracle Cloud Free Tier
2. Create Ubuntu 22.04 VM instance
3. Add ingress rules for ports 22, 80, 443

### Step 2: Initial VPS Setup

SSH into your VPS:

```bash
ssh ubuntu@your-vps-ip
```

Update system:

```bash
sudo apt update && sudo apt upgrade -y
```

### Step 3: Environment Configuration

Create `.env` file with your actual values:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# API Keys
JWT_SECRET=your-super-secret-jwt-key
PAYSTACK_SECRET_KEY=your-paystack-secret
STRIPE_SECRET_KEY=your-stripe-secret
UPSTASH_REDIS_URL=redis://host:6379
SENDER_EMAIL=admin@yourdomain.com
RESEND_API_KEY=your-resend-key
ANTHROPIC_API_KEY=your-anthropic-key

# Fulfillment Services
AIRTABLE_API_KEY=your-airtable-key
AIRTABLE_BASE_ID=your-base-id
AIRTABLE_TABLE_NAME=your-table-name
CLAUDE_API_KEY=your-claude-key

# Domains
TRUST_SCORE_DOMAIN=trust-score.yourdomain.com
VAUNTICO_SERVER_DOMAIN=vauntico-server.yourdomain.com
FULFILLMENT_DOMAIN=fulfillment.yourdomain.com
LEGACY_DOMAIN=legacy.yourdomain.com
SSL_EMAIL=admin@yourdomain.com
```

### Step 4: Run Deployment Script

The deployment script handles:

- System updates
- Docker installation
- Service deployment
- SSL certificate generation
- Health checks

```bash
chmod +x scripts/vps/deploy.sh
./scripts/vps/deploy.sh
```

### Step 5: Verification

After deployment, run health checks:

```bash
./scripts/vps/health-check.sh
```

## Service Endpoints

Once deployed, your services will be available at:

### Application Services

| Service             | URL                                    | Health Endpoint |
| ------------------- | -------------------------------------- | --------------- |
| Trust Score Backend | https://trust-score.yourdomain.com     | /health         |
| Vauntico Server     | https://vauntico-server.yourdomain.com | /health         |
| Fulfillment Engine  | https://fulfillment.yourdomain.com     | /api/status     |
| Legacy Server       | https://legacy.yourdomain.com          | /api/status     |

### Monitoring Services

| Service       | URL                     | Default Credentials |
| ------------- | ----------------------- | ------------------- |
| Uptime Kuma   | http://your-vps-ip:3003 | admin/admin123      |
| Prometheus    | http://your-vps-ip:9090 | No authentication   |
| Grafana       | http://your-vps-ip:3004 | admin/admin123      |
| AlertManager  | http://your-vps-ip:9093 | No authentication   |
| cAdvisor      | http://your-vps-ip:8080 | No authentication   |
| Node Exporter | http://your-vps-ip:9100 | No authentication   |

**⚠️ Important:** Change default passwords before production use!

## Management Commands

### View Logs

```bash
# View all service logs
sudo docker-compose logs -f

# View specific service logs
sudo docker-compose logs -f trust-score-backend
sudo docker-compose logs -f vauntico-server
sudo docker-compose logs -f fulfillment-engine
sudo docker-compose logs -f legacy-server
sudo docker-compose logs -f nginx
```

### Service Management

```bash
# Restart all services
sudo docker-compose restart

# Restart specific service
sudo docker-compose restart trust-score-backend

# Stop all services
sudo docker-compose down

# Start all services
sudo docker-compose up -d

# Update and rebuild
sudo docker-compose pull
sudo docker-compose build --no-cache
sudo docker-compose up -d
```

### SSL Certificate Management

```bash
# Check certificate status
sudo certbot certificates

# Renew certificates manually
sudo certbot renew

# Test renewal process
sudo certbot renew --dry-run
```

### NGINX Management

```bash
# Test NGINX configuration
sudo nginx -t

# Reload NGINX configuration
sudo systemctl reload nginx

# Restart NGINX
sudo systemctl restart nginx

# View NGINX logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Monitoring

### Health Monitoring

Run regular health checks:

```bash
# One-time check
./scripts/vps/health-check.sh

# Continuous monitoring (run every 5 minutes)
while true; do
    ./scripts/vps/health-check.sh
    sleep 300
done
```

### System Monitoring

```bash
# Check disk usage
df -h

# Check memory usage
free -h

# Check CPU usage
htop

# Check Docker resource usage
docker stats
```

## Troubleshooting

### Common Issues

#### Services Not Starting

```bash
# Check container status
sudo docker-compose ps

# Check container logs
sudo docker-compose logs [service-name]

# Restart specific service
sudo docker-compose restart [service-name]
```

#### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Re-generate certificates
sudo certbot --nginx -d domain1.com -d domain2.com

# Check NGINX SSL configuration
sudo nginx -t
```

#### NGINX Proxy Issues

```bash
# Test NGINX configuration
sudo nginx -t

# Check NGINX logs
sudo tail -f /var/log/nginx/error.log

# Reload NGINX
sudo systemctl reload nginx
```

#### Database Connection Issues

```bash
# Test database connection from container
sudo docker-compose exec trust-score-backend node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT NOW()').then(() => console.log('DB OK')).catch(console.error);
"
```

### Log Locations

- **Application Logs:** `sudo docker-compose logs -f [service]`
- **NGINX Access Logs:** `/var/log/nginx/access.log`
- **NGINX Error Logs:** `/var/log/nginx/error.log`
- **SSL Certificate Logs:** `/var/log/letsencrypt/`
- **System Logs:** `journalctl -u docker -f`

## Security Considerations

### Firewall Configuration

```bash
# Configure UFW firewall
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw status
```

### Security Updates

```bash
# Regular system updates
sudo apt update && sudo apt upgrade -y

# Check for security updates
sudo apt list --upgradable
```

### Backup Strategy

```bash
# Backup Docker volumes
sudo docker run --rm -v vauntico-mvp_data:/data -v $(pwd):/backup alpine tar czf /backup/vauntico-data-backup.tar.gz -C /data .

# Backup configuration files
tar czf vauntico-config-backup.tar.gz .env nginx/ scripts/vps/
```

## Performance Optimization

### Docker Optimization

```bash
# Clean up unused Docker resources
sudo docker system prune -a

# Monitor resource usage
docker stats --no-stream
```

### NGINX Optimization

The NGINX configuration includes:

- Gzip compression
- Rate limiting
- Security headers
- Connection pooling

### Database Optimization

- Use connection pooling
- Implement proper indexing
- Regular maintenance and backups

## Scaling Considerations

### Horizontal Scaling

- Load balancer configuration
- Multiple service instances
- Database clustering

### Vertical Scaling

- Increase VPS resources
- Optimize Docker resource limits
- Monitor performance metrics

## Maintenance

### Regular Tasks

1. **Weekly:**
   - Run health checks
   - Check system updates
   - Review logs for errors

2. **Monthly:**
   - Apply system updates
   - Check SSL certificate expiry
   - Clean up Docker resources

3. **Quarterly:**
   - Review and rotate secrets
   - Backup configuration and data
   - Performance audit

### Automation

```bash
# Add to crontab for automated health checks
crontab -e

# Add this line for health checks every 15 minutes
*/15 * * * * /path/to/vauntico-mvp/scripts/vps/health-check.sh >> /var/log/vauntico-health.log 2>&1
```

## Support

For issues and support:

1. Check the troubleshooting section above
2. Review service logs for error messages
3. Run the health check script to identify issues
4. Check system resources and connectivity

## Recovery Procedures

### Full System Recovery

```bash
# Stop all services
sudo docker-compose down

# Restore from backup
# 1. Restore configuration files
tar xzf vauntico-config-backup.tar.gz

# 2. Restore Docker volumes
sudo docker run --rm -v vauntico-mvp_data:/data -v $(pwd):/backup alpine tar xzf /backup/vauntico-data-backup.tar.gz -C /data

# 3. Restart services
sudo docker-compose up -d

# 4. Verify with health check
./scripts/vps/health-check.sh
```

### Service-Specific Recovery

```bash
# Rebuild specific service
sudo docker-compose build --no-cache [service-name]
sudo docker-compose up -d [service-name]

# Re-generate SSL certificates
sudo certbot --nginx -d domain1.com -d domain2.com --force-renewal
```
