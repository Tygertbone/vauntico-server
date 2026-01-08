# Vauntico Trust-Score Backend - Deployment Execution Guide

## 🚀 Complete Deployment Execution

This guide demonstrates the complete deployment process using the enhanced v2.0 deployment system.

## 📋 Prerequisites Checklist

Before starting deployment, ensure you have:

- [ ] OCI instance with Ubuntu 20.04+
- [ ] SSH access with sudo privileges
- [ ] Domain name ready (e.g., trust-score.vauntico.com)
- [ ] SSL certificate (optional, Let's Encrypt can be used)

## 🔄 Step-by-Step Deployment Process

### Step 1: Upload Scripts to OCI Instance

```bash
# From your local machine, upload all deployment scripts
scp backend-deploy-v2-optimized.sh ubuntu@your-instance-ip:~/
scp validate-backend-deployment.sh ubuntu@your-instance-ip:~/
scp BACKEND_DEPLOYMENT_V2_GUIDE.md ubuntu@your-instance-ip:~/
scp test-deployment-scripts.cjs ubuntu@your-instance-ip:~/

# SSH into the instance
ssh ubuntu@your-instance-ip
```

### Step 2: Make Scripts Executable

```bash
# Make deployment scripts executable
chmod +x backend-deploy-v2-optimized.sh
chmod +x validate-backend-deployment.sh
chmod +x test-deployment-scripts.cjs

# Verify scripts are ready
ls -la *.sh *.cjs
```

### Step 3: Run Enhanced Deployment Script

```bash
# Basic deployment with default settings
./backend-deploy-v2-optimized.sh

# Or with custom configuration
PORT=8080 LOG_DIR=/var/log/custom ./backend-deploy-v2-optimized.sh

# Or deploy from custom repository
REPO_URL=https://github.com/your-org/trust-score-backend.git ./backend-deploy-v2-optimized.sh
```

**Expected Output During Deployment:**
```
🚀 Starting Vauntico Trust-Score Backend Deployment v2.0...
📦 Updating system packages...
📦 Installing required packages...
📦 Installing Node.js 18.x...
📦 Installing PM2 process manager...
📁 Creating application directory...
🔧 Creating enhanced Express.js server...
📦 Installing application dependencies...
🔒 Running security audit...
🔧 Applying security hardening...
📊 Setting up monitoring...
🚀 Starting application with PM2...
✅ Application is healthy and responding...
✅ Backend deployment completed successfully!
```

### Step 4: Validate Deployment

```bash
# Run comprehensive validation
./validate-backend-deployment.sh

# Or test specific host/port
HOST=trust-score.vauntico.com PORT=3000 ./validate-backend-deployment.sh
```

**Expected Validation Output:**
```
🧪 Starting Vauntico Trust-Score Backend Validation...
=== Basic Connectivity Tests ===
✅ PASSED: Health Check Endpoint
✅ PASSED: Status Endpoint
✅ PASSED: Root Endpoint
✅ PASSED: API Docs Endpoint

=== Security Tests ===
✅ PASSED: Rate Limiting Test
✅ PASSED: CORS Headers Present
✅ PASSED: Security Headers Present

=== Performance Tests ===
✅ PASSED: Health Endpoint Performance
✅ PASSED: Status Endpoint Performance

🎉 All tests passed! The deployment is working correctly.
```

### Step 5: Monitor the Service

```bash
# Check service status
sudo systemctl status trust-score

# View real-time logs
sudo journalctl -u trust-score -f

# Monitor PM2 processes
pm2 status

# Open PM2 monitoring dashboard
pm2 monit

# View PM2 logs
pm2 logs trust-score
```

### Step 6: Verify Endpoints

```bash
# Test health endpoint
curl http://localhost:3000/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2026-01-05T19:06:53.000Z",
  "version": "2.0.0",
  "uptime": 3600.5,
  "memory": {
    "rss": 134217728,
    "heapTotal": 67108864,
    "heapUsed": 45678901,
    "external": 2097152
  },
  "environment": "production",
  "port": 3000
}

# Test API status
curl http://localhost:3000/api/v1/status

# Test API documentation
curl http://localhost:3000/api/docs
```

## 🔧 Service Management Commands

### Starting/Stopping Service

```bash
# Start service
sudo systemctl start trust-score

# Stop service
sudo systemctl stop trust-score

# Restart service
sudo systemctl restart trust-score

# Enable auto-start on boot
sudo systemctl enable trust-score

# Disable auto-start
sudo systemctl disable trust-score
```

### PM2 Process Management

```bash
# Show PM2 process status
pm2 status

# Show detailed process information
pm2 show trust-score

# Restart PM2 process
pm2 restart trust-score

# Reload without downtime
pm2 reload trust-score

# Stop PM2 process
pm2 stop trust-score

# Delete PM2 process
pm2 delete trust-score

# Save PM2 configuration
pm2 save

# Generate PM2 startup script
pm2 startup
```

### Log Management

```bash
# View system service logs
sudo journalctl -u trust-score -f

# View PM2 logs
pm2 logs trust-score -f

# View application logs
tail -f /var/log/vauntico/access.log
tail -f /var/log/vauntico/error.log
tail -f /var/log/vauntico/requests.log

# View log rotation status
sudo logrotate -d /etc/logrotate.d/vauntico-trust-score
```

## 🔍 Troubleshooting Common Issues

### Service Won't Start

```bash
# Check service status
sudo systemctl status trust-score

# Check logs for errors
sudo journalctl -u trust-score -n 50

# Check PM2 status
pm2 status

# Check PM2 logs
pm2 logs trust-score --lines 50

# Verify configuration
pm2 show trust-score
```

### Port Conflicts

```bash
# Check what's using port 3000
sudo netstat -tlnp | grep :3000

# Kill conflicting process
sudo kill -9 <PID>

# Or use different port
PORT=8080 ./backend-deploy-v2-optimized.sh
```

### High Memory Usage

```bash
# Monitor memory usage
pm2 monit

# Check system resources
top
htop

# Restart if needed
pm2 restart trust-score

# Check memory limits
pm2 show trust-score | grep max_memory_restart
```

### Permission Issues

```bash
# Check file permissions
ls -la /home/ubuntu/trust-score-backend/

# Fix ownership
sudo chown -R trust-score:trust-score /home/ubuntu/trust-score-backend/

# Fix permissions
sudo chmod 755 /home/ubuntu/trust-score-backend/
sudo chmod 644 /home/ubuntu/trust-score-backend/*.js
```

## 📊 Performance Monitoring

### Real-time Monitoring

```bash
# Open PM2 monitoring dashboard
pm2 monit

# Monitor system resources
top
htop
iostat -x 1

# Monitor network connections
netstat -an | grep :3000
```

### Health Checks

```bash
# Continuous health monitoring
watch -n 5 'curl -s http://localhost:3000/health | jq .status'

# Load testing
for i in {1..100}; do
  curl -s http://localhost:3000/health > /dev/null
  echo "Request $i completed"
done

# Performance testing
ab -n 1000 -c 10 http://localhost:3000/health
```

## 🔄 Updates and Maintenance

### Updating Application

```bash
# Update application code
cd /home/ubuntu/trust-score-backend
git pull origin main
npm ci --production
pm2 reload trust-score

# Validate after update
./validate-backend-deployment.sh
```

### System Maintenance

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Node.js (if needed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Update PM2
sudo npm update -g pm2

# Restart service after updates
sudo systemctl restart trust-score
```

### Backup and Recovery

```bash
# Create backup
sudo cp -r /home/ubuntu/trust-score-backend /backup/trust-score-$(date +%Y%m%d-%H%M%S)

# Create PM2 configuration backup
pm2 save
cp ~/.pm2/dump.pm2 /backup/pm2-dump-$(date +%Y%m%d-%H%M%S).pm2

# Restore from backup
sudo systemctl stop trust-score
sudo rm -rf /home/ubuntu/trust-score-backend
sudo cp -r /backup/trust-score-YYYYMMDD-HHMMSS /home/ubuntu/trust-score-backend
sudo systemctl start trust-score
```

## 🌐 External Access Configuration

### DNS Configuration

Add these A records in your DNS provider (e.g., Cloudflare):

```
trust-score.vauntico.com → <YOUR_INSTANCE_IP>
```

### SSL Certificate Setup (Optional)

```bash
# Install Let's Encrypt
sudo apt install certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d trust-score.vauntico.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Firewall Configuration

```bash
# Allow HTTPS traffic
sudo ufw allow 443/tcp
sudo ufw allow 80/tcp

# Check firewall status
sudo ufw status

# Reload firewall
sudo ufw reload
```

## 📈 Scaling and Load Balancing

### PM2 Clustering

The deployment automatically uses clustering with `instances: 'max'` for optimal CPU utilization.

### Horizontal Scaling

```bash
# Deploy additional instances
# 1. Provision new OCI instances
# 2. Run deployment script on each
# 3. Configure load balancer
# 4. Update DNS with multiple A records
```

### Load Balancer Configuration

```nginx
# Example Nginx configuration for load balancing
upstream trust_score_backend {
    server 10.0.0.1:3000;
    server 10.0.0.2:3000;
    server 10.0.0.3:3000;
}

server {
    listen 80;
    server_name trust-score.vauntico.com;
    
    location / {
        proxy_pass http://trust_score_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🎯 Production Deployment Checklist

### Pre-deployment

- [ ] OCI instance provisioned and accessible
- [ ] DNS records configured
- [ ] SSL certificates ready (if using HTTPS)
- [ ] Backup strategy defined
- [ ] Monitoring tools configured
- [ ] Security groups properly configured

### Post-deployment

- [ ] Service running and healthy
- [ ] All endpoints responding correctly
- [ ] Security tests passing
- [ ] Performance metrics within limits
- [ ] Log rotation working
- [ ] Monitoring alerts configured
- [ ] Backup procedures tested

### Ongoing Monitoring

- [ ] Daily health checks
- [ ] Weekly security updates
- [ ] Monthly performance reviews
- [ ] Quarterly capacity planning

## 🆘 Support and Resources

### Documentation

- `BACKEND_DEPLOYMENT_V2_GUIDE.md` - Complete deployment guide
- `validate-backend-deployment.sh -h` - Validation script help
- PM2 documentation: https://pm2.keymetrics.io/docs/

### Getting Help

```bash
# Check all available commands
./backend-deploy-v2-optimized.sh --help
./validate-backend-deployment.sh --help

# Check PM2 help
pm2 --help

# Check system logs for issues
sudo journalctl -u trust-score --since "1 hour ago"
```

---

## 🎉 Success Metrics

After successful deployment, you should have:

✅ **Service Status**: Running and healthy
✅ **Security**: Rate limiting, headers, firewall configured
✅ **Monitoring**: PM2 clustering, comprehensive logging
✅ **Performance**: Optimized for production workloads
✅ **Reliability**: Auto-restart, rollback capabilities
✅ **Scalability**: PM2 clustering for high availability

Your Vauntico Trust-Score Backend is now running in production with enterprise-grade security, monitoring, and reliability features!
