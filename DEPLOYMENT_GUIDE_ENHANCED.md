# Vauntico Enhanced Deployment Guide

## Overview

This guide covers the enhanced Vauntico deployment process using the improved `deploy-vauntico-live.sh` script (v3.0). The script provides comprehensive error handling, multi-component support, monitoring integration, and automated rollback capabilities.

## Prerequisites

### Required Tools

- **Node.js** (v18+)
- **npm** (v8+)
- **Vercel CLI** (`npm i -g vercel`)
- **GitHub CLI** (`gh`)
- **SSH client** with key access to OCI infrastructure
- **curl** for health checks

### Required Environment Variables

Create a `.env` file based on `.env.deployment`:

```bash
cp .env.deployment .env
# Edit .env with your actual values
```

#### Core Required Variables

```bash
# Vercel Configuration
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_FRONTEND_PROJECT_ID=your_frontend_project_id

# OCI Infrastructure
OCI_BASTION_HOST=your.bastion.host.com
OCI_COMPUTE_HOST=your.compute.host.com
```

#### Optional Variables

```bash
# Monitoring
GRAFANA_URL=https://your-grafana-url.com
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK

# Widget Publishing
NPM_TOKEN=your_npm_token_here
```

### SSH Key Setup

Ensure you have the required SSH keys in place:

```bash
# OCI Compute Instance Key
~/.ssh/oci_key

# Bastion Host Key
~/.ssh/bastion_key
```

Set appropriate permissions:

```bash
chmod 600 ~/.ssh/oci_key ~/.ssh/bastion_key
```

## Deployment Components

The enhanced script deploys the following components:

### 1. Frontend (Vercel)
- React/Vite application
- Automatic build and deployment
- Domain verification
- Health checks

### 2. Backend (OCI)
- TypeScript/Express.js API
- PM2 process management
- Automatic backups
- Service restart

### 3. Widget (Optional)
- TypeScript widget library
- Build and test
- Optional npm publishing

### 4. Fulfillment Engine (Optional)
- Node.js microservice
- Dependency installation
- Test execution

## Usage

### Basic Deployment

```bash
# Make script executable
chmod +x deploy-vauntico-live.sh

# Run deployment
./deploy-vauntico-live.sh
```

### With Custom Environment

```bash
# Load custom environment file
export DEPLOYMENT_ENV=staging
source .env.staging
./deploy-vauntico-live.sh
```

### Dry Run (Testing)

```bash
# Test environment validation without deploying
bash -x deploy-vauntico-live.sh 2>&1 | grep -E "(Validating|Missing|found)"
```

## Deployment Process

### 1. Environment Validation
- Checks required environment variables
- Validates tool availability
- Verifies SSH key presence

### 2. Frontend Deployment
- Installs dependencies (`npm ci`)
- Runs code quality checks (`lint`, `build`)
- Deploys to Vercel with retry mechanism
- Verifies domain configuration
- Performs health check

### 3. Backend Deployment
- Connects via OCI bastion host
- Creates backup of current deployment
- Pulls latest changes
- Installs dependencies (workspace-aware)
- Builds TypeScript if needed
- Restarts PM2 services
- Verifies service status

### 4. Widget Deployment (Optional)
- Builds widget library
- Runs tests
- Publishes to npm (if configured)

### 5. Fulfillment Engine Deployment (Optional)
- Installs production dependencies
- Runs test suite

### 6. Health Checks
- Comprehensive endpoint validation
- Timeout-based retry mechanism
- Detailed failure reporting

### 7. CI/CD Validation
- Triggers GitHub Actions workflows
- Validates deployment pipeline

### 8. Monitoring Verification
- Checks monitoring endpoints
- Validates Grafana accessibility
- Verifies Sentry configuration

## Error Handling and Recovery

### Automatic Rollback

The script includes automatic rollback capabilities:

- **Backup Creation**: Before deployment, creates timestamped backups
- **Failure Detection**: Monitors each deployment step
- **Rollback Trigger**: Automatically rolls back on critical failures
- **Notification**: Sends alerts via Slack if configured

### Manual Recovery

If automatic rollback fails:

```bash
# Check backup location
ls -la /tmp/vauntico-backup-*

# Restore from backup (manual)
ssh -i ~/.ssh/oci_key \
  -o ProxyCommand="ssh -W %h:%p -i ~/.ssh/bastion_key bastion_user@${OCI_BASTION_HOST}" \
  oci_user@${OCI_COMPUTE_HOST} << 'EOF'
  cd /srv/vauntico
  # List available backups
  ls -la server-v2.backup.*
  # Restore specific backup
  rm -rf server-v2
  mv server-v2.backup.YYYYMMDD-HHMMSS server-v2
  pm2 restart all
EOF
```

### Log Analysis

```bash
# View deployment logs
tail -f /var/log/vauntico-deployment.log

# View PM2 logs
ssh -i ~/.ssh/oci_key \
  -o ProxyCommand="ssh -W %h:%p -i ~/.ssh/bastion_key bastion_user@${OCI_BASTION_HOST}" \
  oci_user@${OCI_COMPUTE_HOST} "pm2 logs"
```

## Monitoring and Observability

### Health Check Endpoints

- **Frontend**: `https://vauntico.com`
- **API Health**: `https://api.vauntico.com/health`
- **API Status**: `https://api.vauntico.com/api/v1/status`
- **Trust Score**: `https://api.vauntico.com/trust-score`
- **API Docs**: `https://api.vauntico.com/api/docs`

### Monitoring Integration

#### Grafana
- URL: Configured via `GRAFANA_URL`
- Dashboards: Automatically checked for accessibility
- Metrics: Available at `/metrics` endpoint

#### Sentry
- DSN: Configured via `SENTRY_DSN`
- Error tracking: Automatic error capture
- Performance monitoring: Request tracing

#### Slack Notifications
- Webhook: Configured via `SLACK_WEBHOOK_URL`
- Success notifications: Deployment completion
- Failure alerts: Immediate error reporting

## Troubleshooting

### Common Issues

#### 1. Environment Variables Missing
```bash
Error: Missing required environment variables: VERCEL_TOKEN
```
**Solution**: Ensure all required variables are set in `.env`

#### 2. SSH Key Not Found
```bash
Error: OCI SSH key not found at ~/.ssh/oci_key
```
**Solution**: Place SSH keys in correct location with proper permissions

#### 3. Vercel Deployment Failed
```bash
Error: Frontend build failed
```
**Solution**: Check build logs, ensure dependencies are compatible

#### 4. Health Check Timeout
```bash
Error: API Health health check failed after 300s timeout
```
**Solution**: Check service logs, verify PM2 status, check network connectivity

### Debug Mode

Enable verbose logging:

```bash
# Run with bash debugging
bash -x deploy-vauntico-live.sh

# Check specific function
bash -x deploy-vauntico-live.sh 2>&1 | grep -A 10 -B 5 "deploy_backend"
```

### Service Status Checks

```bash
# Check PM2 status
ssh -i ~/.ssh/oci_key \
  -o ProxyCommand="ssh -W %h:%p -i ~/.ssh/bastion_key bastion_user@${OCI_BASTION_HOST}" \
  oci_user@${OCI_COMPUTE_HOST} "pm2 status"

# Check service logs
ssh -i ~/.ssh/oci_key \
  -o ProxyCommand="ssh -W %h:%p -i ~/.ssh/bastion_key bastion_user@${OCI_BASTION_HOST}" \
  oci_user@${OCI_COMPUTE_HOST} "pm2 logs --lines 50"
```

## Advanced Configuration

### Custom Timeouts

```bash
# Override default timeouts
export HEALTH_CHECK_TIMEOUT=180
export DEPLOYMENT_TIMEOUT=600
export MAX_RETRIES=5
./deploy-vauntico-live.sh
```

### Feature Flags

Control deployment behavior via environment variables:

```bash
# Disable widget deployment
export ENABLE_WIDGET_DEPLOYMENT=false

# Disable monitoring checks
export ENABLE_MONITORING_CHECKS=false

# Skip CI/CD validation
export ENABLE_CI_CD_VALIDATION=false
```

### Custom Backup Location

```bash
# Override backup directory
export BACKUP_DIR="/custom/backup/location"
./deploy-vauntico-live.sh
```

## Security Considerations

### SSH Security
- Use key-based authentication only
- Implement bastion host access controls
- Regularly rotate SSH keys

### Environment Variables
- Store sensitive values in secure vaults
- Use environment-specific files
- Never commit secrets to version control

### Network Security
- Implement firewall rules
- Use VPN for bastion access
- Monitor access logs

## Performance Optimization

### Build Optimization
- Use `npm ci` for faster dependency installation
- Enable build caching
- Optimize asset compression

### Deployment Optimization
- Parallel component deployment where possible
- Incremental deployments for large changes
- Health check tuning for faster feedback

## Maintenance

### Regular Tasks

1. **Backup Rotation**: Clean up old backups regularly
2. **Log Rotation**: Monitor and rotate deployment logs
3. **Dependency Updates**: Keep tools and dependencies current
4. **Security Audits**: Regular security scans and updates

### Monitoring

1. **Deployment Metrics**: Track deployment success rates
2. **Performance Metrics**: Monitor deployment times
3. **Error Rates**: Track and analyze deployment failures
4. **Resource Usage**: Monitor system resources during deployment

## Support

For deployment issues:

1. Check deployment logs: `/var/log/vauntico-deployment.log`
2. Review this troubleshooting guide
3. Check GitHub Issues for known problems
4. Contact the DevOps team for critical issues

## Version History

- **v3.0**: Enhanced error handling, multi-component support, monitoring integration
- **v2.0**: Basic OCI and Vercel deployment
- **v1.0**: Initial deployment script

---

*Last updated: January 2026*
*Version: 3.0*