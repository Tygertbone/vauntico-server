# Vauntico Trust-Score Backend Deployment Guide v2.0

## Overview

This guide covers the enhanced deployment system for the Vauntico Trust-Score Backend, featuring improved security, monitoring, error handling, and validation capabilities.

## 🚀 What's New in v2.0

### Key Improvements

1. **Enhanced Security**
   - Dedicated service user with restricted permissions
   - Security headers (Helmet.js)
   - Rate limiting
   - Input validation
   - Firewall configuration
   - Security auditing with `npm audit`

2. **Production-Ready Monitoring**
   - PM2 process management with clustering
   - Comprehensive logging (access, error, request logs)
   - Log rotation configuration
   - Health checks with detailed metrics
   - Performance monitoring

3. **Robust Error Handling**
   - Automatic rollback on failure
   - Graceful shutdown handling
   - Comprehensive error logging
   - Status code validation

4. **Enhanced Deployment Features**
   - Backup and restore capabilities
   - Progress tracking with colored output
   - Validation scripts
   - Environment configuration
   - Zero-downtime deployment options

## 📁 Files Overview

### Core Deployment Files

- **`backend-deploy-v2-optimized.sh`** - Main deployment script with all enhancements
- **`validate-backend-deployment.sh`** - Comprehensive validation and testing script
- **`backend-deploy.sh`** - Original deployment script (for reference)

### Configuration Files (Generated)

- **`server.js`** - Enhanced Express.js server with security and monitoring
- **`package.json`** - Updated dependencies with security-focused packages
- **`.env`** - Environment configuration
- **`ecosystem.config.js`** - PM2 configuration for process management

## 🛠️ Prerequisites

### System Requirements

- Ubuntu 20.04+ or compatible Linux distribution
- Node.js 18.x or higher
- At least 1GB RAM (2GB recommended for production)
- 10GB available disk space
- SSH access with sudo privileges

### Required Tools

```bash
# Basic tools (usually pre-installed)
curl, wget, git, sudo

# Optional but recommended
jq (for JSON parsing in validation)
bc (for performance calculations)
```

## 🚀 Quick Start

### 1. Basic Deployment

```bash
# SSH into your OCI instance
ssh ubuntu@your-instance-ip

# Download and run the deployment script
curl -fsSL https://raw.githubusercontent.com/your-repo/backend-deploy-v2-optimized.sh | bash

# Or upload and run manually
scp backend-deploy-v2-optimized.sh ubuntu@your-instance-ip:~/
ssh ubuntu@your-instance-ip
chmod +x backend-deploy-v2-optimized.sh
./backend-deploy-v2-optimized.sh
```

### 2. Custom Configuration

```bash
# Set custom port
PORT=8080 ./backend-deploy-v2-optimized.sh

# Deploy from custom repository
REPO_URL=https://github.com/your-org/trust-score-backend.git ./backend-deploy-v2-optimized.sh

# Custom log directory
LOG_DIR=/var/log/custom ./backend-deploy-v2-optimized.sh
```

### 3. Validation

```bash
# Run validation tests
./validate-backend-deployment.sh

# Test different host/port
HOST=api.example.com PORT=8080 ./validate-backend-deployment.sh
```

## 📋 Detailed Deployment Process

### Phase 1: System Preparation

1. **System Update**

   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Install Required Packages**
   - `curl`, `wget`, `git` - Download and version control
   - `ufw` - Firewall management
   - `fail2ban` - Intrusion prevention
   - `unattended-upgrades` - Automatic security updates

3. **Node.js Installation**
   - Uses NodeSource repository for latest stable version
   - Verifies existing installation
   - Installs Node.js 18.x if not present

### Phase 2: Application Setup

1. **Directory Structure**

   ```
   /home/ubuntu/trust-score-backend/
   ├── server.js                 # Main application
   ├── package.json             # Dependencies
   ├── ecosystem.config.js      # PM2 configuration
   └── .env                     # Environment variables
   ```

2. **User Management**
   - Creates dedicated `trust-score` system user
   - Sets appropriate file permissions
   - Configures secure access controls

3. **Security Hardening**
   - Configures UFW firewall rules
   - Sets up fail2ban
   - Implements security headers
   - Enables rate limiting

### Phase 3: Application Deployment

1. **Dependency Installation**

   ```bash
   npm ci --production  # Faster, more reliable than npm install
   npm audit --audit-level moderate  # Security vulnerability check
   ```

2. **Process Management**
   - PM2 clustering for high availability
   - Automatic restarts on failure
   - Memory limits and monitoring
   - Graceful shutdown handling

3. **Service Integration**
   - Systemd service for auto-start
   - Log rotation setup
   - Health check endpoints

### Phase 4: Monitoring & Validation

1. **Health Checks**
   - Application health endpoint (`/health`)
   - System resource monitoring
   - Performance metrics

2. **Logging System**
   ```
   /var/log/vauntico/
   ├── access.log       # HTTP access logs
   ├── error.log        # Application errors
   ├── requests.log     # Detailed request logging
   └── combined.log     # PM2 combined logs
   ```

## 🔧 Configuration Options

### Environment Variables

| Variable      | Default           | Description                   |
| ------------- | ----------------- | ----------------------------- |
| `PORT`        | 3000              | Application port              |
| `NODE_ENV`    | production        | Node environment              |
| `LOG_DIR`     | /var/log/vauntico | Log directory                 |
| `API_VERSION` | 2.0.0             | API version                   |
| `REPO_URL`    | -                 | Git repository URL (optional) |

### PM2 Configuration

The `ecosystem.config.js` file includes:

- **Clustering**: `instances: 'max'` for CPU utilization
- **Memory Management**: `max_memory_restart: '1G'`
- **Restart Strategy**: Up to 10 restarts with 4-second delay
- **Logging**: Separate error and output logs
- **Monitoring**: Built-in PM2 monitoring

### Security Features

1. **Helmet.js** - Security headers
2. **Rate Limiting** - 100 requests per 15 minutes per IP
3. **Input Validation** - Request size limits
4. **CORS** - Cross-origin resource sharing
5. **Compression** - Response compression
6. **Request Logging** - Detailed audit trail

## 🧪 Validation & Testing

### Automated Validation

The `validate-backend-deployment.sh` script performs:

1. **Connectivity Tests**
   - All endpoints respond correctly
   - Proper HTTP status codes
   - JSON response format validation

2. **Security Tests**
   - Rate limiting effectiveness
   - Security headers presence
   - CORS configuration
   - Error handling

3. **Performance Tests**
   - Response time validation
   - Concurrent request handling
   - Load testing

4. **Load Testing**
   - 50 concurrent requests
   - Response time validation
   - Error rate monitoring

### Manual Testing

```bash
# Health check
curl http://localhost:3000/health

# API status
curl http://localhost:3000/api/v1/status

# API documentation
curl http://localhost:3000/api/docs

# Performance test
for i in {1..100}; do curl -s http://localhost:3000/health > /dev/null; done
```

## 🔄 Service Management

### System Commands

```bash
# Start service
sudo systemctl start trust-score

# Stop service
sudo systemctl stop trust-score

# Restart service
sudo systemctl restart trust-score

# Check status
sudo systemctl status trust-score

# View logs
sudo journalctl -u trust-score -f

# Check PM2 status
pm2 status

# PM2 monitoring
pm2 monit

# View PM2 logs
pm2 logs trust-score
```

### Maintenance Tasks

1. **Log Rotation** (Automatic)
   - Daily rotation
   - 30-day retention
   - Compressed archives

2. **Updates**

   ```bash
   # Update application
   cd /home/ubuntu/trust-score-backend
   git pull origin main
   npm ci --production
   pm2 restart trust-score
   ```

3. **Backup**
   ```bash
   # Backup application
   sudo cp -r /home/ubuntu/trust-score-backend /backup/trust-score-$(date +%Y%m%d)
   ```

## 🚨 Troubleshooting

### Common Issues

1. **Service Won't Start**

   ```bash
   # Check logs
   sudo journalctl -u trust-score -n 50
   pm2 logs trust-score --lines 50

   # Check configuration
   pm2 show trust-score
   ```

2. **High Memory Usage**

   ```bash
   # Monitor memory
   pm2 monit

   # Restart if needed
   pm2 restart trust-score
   ```

3. **Port Conflicts**

   ```bash
   # Check what's using the port
   sudo netstat -tlnp | grep :3000

   # Kill conflicting process
   sudo kill -9 <PID>
   ```

### Performance Issues

1. **High Response Times**

   ```bash
   # Check system resources
   top
   htop
   iostat

   # Check PM2 metrics
   pm2 show trust-score
   ```

2. **Database Connection Issues**

   ```bash
   # Check network connectivity
   ping database-host

   # Test connection
   nc -zv database-host 5432
   ```

## 📊 Monitoring & Alerting

### Built-in Monitoring

1. **PM2 Monitoring**
   - Real-time metrics
   - Memory usage
   - CPU utilization
   - Restart tracking

2. **Application Logs**
   - Structured JSON logging
   - Error tracking
   - Performance metrics

3. **Health Endpoints**
   ```json
   {
     "status": "healthy",
     "timestamp": "2026-01-05T18:54:31.000Z",
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
   ```

### External Monitoring Integration

The service is ready for integration with:

- **Prometheus** - Metrics collection
- **Grafana** - Visualization dashboards
- **ELK Stack** - Log aggregation
- **New Relic/DataDog** - APM monitoring

## 🔒 Security Considerations

### Implemented Security Measures

1. **Network Security**
   - UFW firewall configuration
   - Only necessary ports open
   - Fail2ban intrusion prevention

2. **Application Security**
   - Security headers (Helmet.js)
   - Rate limiting
   - Input validation
   - CORS configuration

3. **System Security**
   - Dedicated service user
   - Minimal file permissions
   - Regular security updates

### Regular Security Tasks

```bash
# Security audit
npm audit

# System updates
sudo apt update && sudo apt upgrade -y

# Check for vulnerabilities
curl -s https://api.github.com/advisories | jq '.[] | select(.severity == "high")'

# Review logs for suspicious activity
sudo grep -i "error\|warning\|attack" /var/log/vauntico/*.log
```

## 📈 Performance Optimization

### Built-in Optimizations

1. **Caching**
   - HTTP compression
   - Static asset optimization
   - Response caching headers

2. **Load Balancing**
   - PM2 clustering
   - CPU affinity
   - Memory management

3. **Database Optimization**
   - Connection pooling
   - Query optimization
   - Index management

### Performance Tuning

```bash
# Optimize PM2 for your server
pm2 delete trust-score
pm2 start ecosystem.config.js --env production

# Tune Linux kernel parameters
echo 'net.core.somaxconn = 65535' | sudo tee -a /etc/sysctl.conf
echo 'net.ipv4.tcp_max_syn_backlog = 65535' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

## 🚀 Advanced Deployment

### Zero-Downtime Deployment

```bash
# Deploy with zero downtime
cd /home/ubuntu/trust-score-backend
git pull origin main
npm ci --production
pm2 reload trust-score  # Reloads without downtime
```

### Blue-Green Deployment

```bash
# Setup blue-green deployment
cp -r /home/ubuntu/trust-score-backend /home/ubuntu/trust-score-backend-green
cd /home/ubuntu/trust-score-backend-green
git pull origin main
npm ci --production
pm2 start ecosystem.config.js --env production --name trust-score-green

# Switch traffic (using load balancer)
# Update DNS or load balancer configuration

# Stop old version
pm2 delete trust-score
```

## 📞 Support & Maintenance

### Contact Information

- **Technical Support**: support@vauntico.com
- **Documentation**: https://docs.vauntico.com
- **Issue Tracking**: https://github.com/vauntico/issues

### Regular Maintenance Schedule

1. **Daily**
   - Check service health
   - Review error logs
   - Monitor performance metrics

2. **Weekly**
   - Security updates
   - Log rotation verification
   - Backup verification

3. **Monthly**
   - Performance review
   - Security audit
   - Dependency updates

---

## 🎉 Conclusion

The Vauntico Trust-Score Backend v2.0 provides a production-ready, secure, and monitored deployment solution. With enhanced security features, comprehensive monitoring, and robust error handling, it ensures reliable operation in production environments.

For questions or support, please refer to the contact information above or consult the comprehensive documentation at docs.vauntico.com.
