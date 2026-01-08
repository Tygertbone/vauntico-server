# OCI Deployment Guide

## Overview

This guide covers deploying Vauntico MVP services to Oracle Cloud Infrastructure (OCI) after migrating from Railway. The new OCI-first architecture provides enterprise-grade infrastructure with better reliability, scalability, and monitoring capabilities.

## Architecture

### Infrastructure Components

- **OCI Compute**: Docker containers running on flexible compute instances
- **OCI Load Balancer**: High-availability load balancing for API services
- **OCI Container Registry**: Private container registry for Docker images
- **OCI Autonomous Database**: Managed PostgreSQL database service
- **Monitoring**: Prometheus + Grafana stack deployed on OCI

### Service Endpoints

- **Frontend**: `https://vauntico.com` (Vercel - unchanged)
- **API Gateway**: `https://api.vauntico.com` (OCI Load Balancer)
- **Backend Services**:
  - `server-v2`: `https://api.vauntico.com/server-v2`
  - `fulfillment-engine`: `https://api.vauntico.com/fulfillment-engine`
  - `vault-landing`: `https://api.vauntico.com/vault-landing`

### Health Check Endpoints

All services expose standardized health endpoints for monitoring:

- **Frontend Health**: `https://vauntico.com/api/health`
- **Backend API Health**: `https://api.vauntico.com/health`
- **Fulfillment Engine Health**: `https://api.vauntico.com/fulfillment/health`
- **Vault Landing Health**: `https://api.vauntico.com/vault/health`

Each health endpoint returns a standardized JSON response:
```json
{
  "status": "ok",
  "service": "<service-name>",
  "timestamp": "<ISO_TIMESTAMP>",
  "uptime": <SECONDS>,
  "environment": "production"
}
```

## Prerequisites

### OCI Setup

1. **OCI Account**: Active OCI account with appropriate permissions
2. **CLI Installation**: OCI CLI installed and configured
3. **Authentication**: API key or security token configured
4. **Compartment**: Dedicated compartment for Vauntico resources

### Required Permissions

- `OCI_COMPARTMENT_INSPECT` for target compartment
- `OCI_COMPUTE_INSTANCE_MANAGE` for compute operations
- `OCI_LOAD_BALANCER_MANAGE` for load balancer operations
- `OCI_CONTAINER_REGISTRY_MANAGE` for container registry operations
- `OCI_NETWORK_MANAGE` for networking operations

### Local Environment

- **Docker**: Docker Desktop or Docker Engine installed
- **Docker Compose**: For local development and testing
- **SSH Key**: RSA key pair for OCI instance access
- **Git**: For version control and deployments

## Quick Start

### 1. Infrastructure Setup

```bash
# Set up OCI infrastructure
./scripts/setup-oci-infrastructure.sh

# Set up compute instances
./scripts/setup-oci-compute.sh

# Set up database
./scripts/setup-oci-database.sh

# Set up monitoring
./scripts/setup-oci-monitoring.sh
```

### 2. Manual Deployment

```bash
# Export environment variables
export COMPARTMENT_ID="ocid1.compartment.oc1..."
export OCI_INSTANCE_IP="203.0.113.1"
export ENVIRONMENT="prod"

# Deploy all services
./scripts/oci-deploy-all.sh
```

### 3. Automated Deployment

Use GitHub Actions workflow "OCI Deployment" for automated deployments:

1. Go to Actions > OCI Deployment in GitHub
2. Click "Run workflow"
3. Fill in required parameters:
   - Environment: `dev` | `staging` | `prod`
   - Compartment ID: Your OCI compartment OCID
   - Instance IP: Public IP of your OCI compute instance
   - Services: Comma-separated list of services to deploy
   - Configure Load Balancer: `true`/`false`

## Service Configuration

### Environment Variables

Each service requires specific environment variables:

#### Common Variables

```bash
NODE_ENV=production
PORT=8080
DATABASE_URL=postgresql://user:pass@adb-host:1521/db
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

#### Service-Specific Variables

**server-v2**:
```bash
JWT_SECRET=your-jwt-secret
PAYSTACK_SECRET_KEY=your-paystack-secret
EMAIL_SERVICE_API_KEY=your-email-api-key
```

**fulfillment-engine**:
```bash
FULFILLMENT_API_KEY=your-fulfillment-key
PAYMENT_WEBHOOK_SECRET=your-webhook-secret
```

**vault-landing**:
```bash
VAULT_API_TOKEN=your-vault-token
STATIC_ASSET_URL=https://cdn.vauntico.com
```

### Docker Configuration

Services are containerized using service-specific Dockerfiles:

- `Dockerfile.trust-score`: For server-v2
- `Dockerfile.fulfillment-engine`: For fulfillment-engine
- `Dockerfile.vauntico-server`: For vault-landing

Each Dockerfile includes:
- Multi-stage builds for optimized images
- Health checks for monitoring
- Proper signal handling
- Security best practices

## Networking

### Load Balancer Configuration

The OCI Load Balancer provides:

- **High Availability**: Multiple backend instances
- **Health Checks**: Automatic unhealthy instance detection
- **SSL Termination**: HTTPS support (requires certificate configuration)
- **Path-based Routing**: Route to different services based on URL path

### Security Rules

Default security configuration:

```yaml
Ingress Rules:
  - Port: 22 (SSH) - Source: 0.0.0.0/0
  - Port: 80 (HTTP) - Source: 0.0.0.0/0
  - Port: 443 (HTTPS) - Source: 0.0.0.0/0

Egress Rules:
  - All outbound traffic allowed
```

### DNS Configuration

Update your DNS records:

```dns
# A Record for API Gateway
api.vauntico.com. 3600 IN A 203.0.113.100

# CNAME for Load Balancer (if using LB hostname)
api.vauntico.com. 3600 IN CNAME lb-hostname.oraclecloud.com.
```

## Monitoring and Observability

### Prometheus Metrics

All services expose metrics on `/metrics` endpoint:

- HTTP request metrics
- Application-specific metrics
- System resource metrics
- Custom business metrics

### Grafana Dashboards

Pre-configured dashboards:

- **Service Health**: Overall service status and uptime
- **Performance**: Response times, error rates, throughput
- **Infrastructure**: CPU, memory, disk usage
- **Business Metrics**: User registrations, transactions, etc.

### Alerting

AlertManager configuration for:

- Service downtime
- High error rates
- Performance degradation
- Infrastructure issues

Alert channels:
- Email notifications
- Slack integration
- PagerDuty integration (optional)

## Database Management

### Autonomous Database

OCI Autonomous Database provides:

- **Automated Backups**: 7-day retention
- **High Availability**: Multi-AZ deployment
- **Scaling**: Automatic CPU and storage scaling
- **Security**: Data encryption at rest and in transit

### Connection Management

```javascript
// Connection string format
const connectionString = 'postgresql://user:pass@adb-host:1521/db?sslmode=require';

// Pool configuration
const pool = new Pool({
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### Migration Process

```bash
# Run database migrations
npm run migrate

# Rollback migrations if needed
npm run migrate:rollback

# Create new migration
npm run migrate:create -- migration_name
```

## Security

### Container Security

- **Base Images**: Use official minimal base images
- **Vulnerability Scanning**: Regular security scans
- **Non-root User**: Run containers as non-root user
- **Resource Limits**: CPU and memory limits enforced

### Network Security

- **VPC Isolation**: Private subnets for backend services
- **Security Lists**: Restrictive inbound/outbound rules
- **WAF**: Web Application Firewall (optional)
- **DDoS Protection**: OCI DDoS protection enabled

### Secrets Management

Use OCI Vault for secrets:

```bash
# Store secret
oci kms secret create --compartment-id $COMPARTMENT_ID \
  --key-id $KEY_ID \
  --secret-name "database-password" \
  --secret-content "super-secret-password"

# Retrieve secret in application
const secret = await oci.secret.getSecret({ secretId: secretOcid });
```

## Deployment Process

### Manual Deployment

1. **Build Images**:
   ```bash
   docker build -f Dockerfile.trust-score -t vauntico-server-v2:latest .
   ```

2. **Push to Registry**:
   ```bash
   docker tag vauntico-server-v2:latest your-tenancy.ocir.io/vauntico/server-v2:latest
   docker push your-tenancy.ocir.io/vauntico/server-v2:latest
   ```

3. **Deploy to Instance**:
   ```bash
   ssh -i ~/.ssh/oci-vauntico ubuntu@$INSTANCE_IP
   cd ~/vauntico-deployment
   docker-compose pull
   docker-compose up -d
   ```

### Automated Deployment

The GitHub Actions workflow handles:

1. **Validation**: Input validation and pre-flight checks
2. **Build**: Multi-architecture Docker builds
3. **Push**: Container registry upload with tagging
4. **Deploy**: SSH-based deployment with health checks
5. **Verification**: Post-deployment health verification
6. **Notification**: Slack notifications on completion

### Rollback Process

```bash
# Quick rollback to previous version
ssh -i ~/.ssh/oci-vauntico ubuntu@$INSTANCE_IP
cd ~/vauntico-deployment
docker-compose down
docker-compose pull  # Pulles previous tag
docker-compose up -d

# Full rollback script
./scripts/oci-rollback.sh --service server-v2 --version previous
```

## Troubleshooting

### Common Issues

#### Service Not Starting

```bash
# Check container logs
docker logs vauntico-server-v2

# Check container status
docker-compose ps

# Restart service
docker-compose restart server-v2
```

#### Health Checks Failing

```bash
# Test health endpoint locally
curl -f http://localhost:3001/health

# Check health check configuration
docker inspect vauntico-server-v2 | grep Health
```

#### Load Balancer Issues

```bash
# Check backend health
oci lb backend-set get --backend-set-name $BACKEND_SET_NAME \
  --load-balancer-id $LB_ID

# Check listener configuration
oci lb listener get --listener-name $LISTENER_NAME \
  --load-balancer-id $LB_ID
```

### Performance Issues

#### High Response Times

1. Check resource utilization:
   ```bash
   docker stats
   top
   ```

2. Check database performance:
   ```sql
   SELECT * FROM v$session WHERE status = 'ACTIVE';
   ```

3. Check network latency:
   ```bash
   ping api.vauntico.com
   traceroute api.vauntico.com
   ```

#### Memory Issues

1. Check container memory usage:
   ```bash
   docker stats --no-stream
   ```

2. Check system memory:
   ```bash
   free -h
   vmstat 1 5
   ```

3. Adjust memory limits:
   ```yaml
   # In docker-compose.yml
   deploy:
     resources:
       limits:
         memory: 1G
       reservations:
         memory: 512M
   ```

## Best Practices

### Development

1. **Local Development**: Use Docker Compose for local development
2. **Environment Parity**: Keep dev/staging/prod environments consistent
3. **Configuration Management**: Use environment variables for all config
4. **Health Checks**: Implement proper health endpoints

### Deployment

1. **Blue-Green Deployment**: Use blue-green for zero-downtime updates
2. **Canary Releases**: Gradually roll out new versions
3. **Monitoring**: Comprehensive monitoring and alerting
4. **Rollback Plan**: Always have a rollback strategy

### Security

1. **Least Privilege**: Minimize permissions and access
2. **Regular Updates**: Keep dependencies and base images updated
3. **Security Scanning**: Regular vulnerability assessments
4. **Audit Logging**: Enable comprehensive audit logging

## Support and Maintenance

### Regular Tasks

- **Weekly**: Review logs and metrics
- **Monthly**: Update dependencies and base images
- **Quarterly**: Security audit and penetration testing
- **Annually**: Disaster recovery testing

### Emergency Procedures

1. **Service Outage**:
   - Check health dashboard
   - Verify load balancer status
   - Check individual service health
   - Initiate rollback if needed

2. **Security Incident**:
   - Isolate affected systems
   - Review audit logs
   - Apply security patches
   - Rotate credentials

3. **Data Loss**:
   - Initiate database restore
   - Verify data integrity
   - Review backup procedures

### Documentation

- **Runbooks**: Detailed operational procedures
- **Architecture Diagrams**: Current infrastructure layout
- **API Documentation**: Service API specifications
- **Incident Reports**: Post-incident analysis documents

## Migration Checklist

- [ ] OCI infrastructure provisioned
- [ ] Services containerized and tested
- [ ] Load balancer configured
- [ ] DNS records updated
- [ ] Monitoring set up
- [ ] SSL certificates configured
- [ ] Health checks verified
- [ ] Rollback procedures tested
- [ ] Team training completed
- [ ] Documentation updated

---

For additional support, refer to:
- [OCI Infrastructure Setup Guide](OCI_INFRASTRUCTURE_SETUP_GUIDE.md)
- [OCI Quick Reference](OCI_QUICK_REFERENCE.md)
- [Monitoring Guide](MONITORING_GUIDE.md)
- [Railway to OCI Migration](RAILWAY_TO_OCI_MIGRATION_COMPLETE.md)
