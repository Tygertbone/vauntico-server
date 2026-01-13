# OCI Health Check Guide

## Overview

This guide covers the health check implementation for Vauntico services deployed on Oracle Cloud Infrastructure (OCI). The health check system provides standardized endpoints for monitoring service status across all components.

## Health Check Architecture

### Service Endpoints

| Service            | Health Endpoint       | Expected Response                                                              | Infrastructure |
| ------------------ | --------------------- | ------------------------------------------------------------------------------ | -------------- |
| Frontend           | `/api/health`         | `{"status":"ok","timestamp":"<ISO_TIMESTAMP>","uptime":<SECONDS>}`             | Vercel         |
| Backend API        | `/health`             | `{"status":"ok","service":"backend-api","timestamp":"<ISO_TIMESTAMP>"}`        | OCI Compute    |
| Fulfillment Engine | `/fulfillment/health` | `{"status":"ok","service":"fulfillment-engine","timestamp":"<ISO_TIMESTAMP>"}` | OCI Compute    |
| Vault Landing      | `/vault/health`       | `{"status":"ok","service":"vault-landing","timestamp":"<ISO_TIMESTAMP>"}`      | OCI Compute    |

### Standard Response Format

All health endpoints follow this standard format:

```json
{
  "status": "ok",
  "service": "<service-name>",
  "timestamp": "<ISO-8601-TIMESTAMP>",
  "uptime": <SECONDS>,
  "environment": "production"
}
```

## Implementation Details

### Backend API (server-v2)

**File:** `server-v2/src/routes/health.ts`

```typescript
import { Router } from "express";
const router = Router();

router.get("/health", (req, res) => {
  return res.status(200).json({
    status: "ok",
    service: "backend-api",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "production",
  });
});

export default router;
```

### Fulfillment Engine

**File:** `vauntico-fulfillment-engine/health.js`

```javascript
const express = require("express");
const router = express.Router();

// Main health endpoint
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "fulfillment-engine",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "production",
  });
});

// Alternative endpoint for nginx routing
router.get("/fulfillment/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "fulfillment-engine",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "production",
  });
});

module.exports = router;
```

### Vault Landing

**File:** `vault-landing/health.js`

```javascript
const express = require("express");
const router = express.Router();

// Main health endpoint
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "vault-landing",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "production",
  });
});

// Alternative endpoint for nginx routing
router.get("/vault/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "vault-landing",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "production",
  });
});

module.exports = router;
```

### Frontend (Vercel)

**File:** `homepage-redesign/app/api/health/route.ts`

```typescript
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
}
```

## Monitoring Configuration

### Prometheus Configuration

**File:** `monitoring/prometheus.yml`

```yaml
# OCI Backend API Health Check
- job_name: "oci-backend-api"
  static_configs:
    - targets: ["api.vauntico.com"]
  metrics_path: /health
  scrape_interval: 60s
  scheme: https
  relabel_configs:
    - source_labels: [__address__]
      target_label: service
      regex: "(.+)"
      replacement: "backend-api"
    - source_labels: [__address__]
      target_label: instance
      regex: "(.+)"
      replacement: "oci-backend-api"

# OCI Fulfillment Engine Health Check
- job_name: "oci-fulfillment-engine"
  static_configs:
    - targets: ["api.vauntico.com"]
  metrics_path: /fulfillment/health
  scrape_interval: 60s
  scheme: https
  relabel_configs:
    - source_labels: [__address__]
      target_label: service
      regex: "(.+)"
      replacement: "fulfillment-engine"
    - source_labels: [__address__]
      target_label: instance
      regex: "(.+)"
      replacement: "oci-fulfillment-engine"

# OCI Vault Landing Health Check
- job_name: "oci-vault-landing"
  static_configs:
    - targets: ["api.vauntico.com"]
  metrics_path: /vault/health
  scrape_interval: 60s
  scheme: https
  relabel_configs:
    - source_labels: [__address__]
      target_label: service
      regex: "(.+)"
      replacement: "vault-landing"
    - source_labels: [__address__]
      target_label: instance
      regex: "(.+)"
      replacement: "oci-vault-landing"

# Frontend Health Check (Vercel)
- job_name: "frontend-vercel"
  static_configs:
    - targets: ["vauntico.com"]
  metrics_path: /api/health
  scrape_interval: 60s
  scheme: https
  relabel_configs:
    - source_labels: [__address__]
      target_label: service
      regex: "(.+)"
      replacement: "frontend"
    - source_labels: [__address__]
      target_label: instance
      regex: "(.+)"
      replacement: "vercel-frontend"
```

### Services Configuration

**File:** `services.json`

```json
{
  "services": [
    {
      "name": "Frontend",
      "url": "https://vauntico.com",
      "health_endpoint": "/api/health",
      "infrastructure": "Vercel",
      "expected_response": {
        "status": "ok",
        "timestamp": "<ISO_TIMESTAMP>",
        "uptime": "<SECONDS>"
      }
    },
    {
      "name": "Backend API",
      "url": "https://api.vauntico.com",
      "health_endpoint": "/health",
      "infrastructure": "OCI",
      "service": "backend-api",
      "expected_response": {
        "status": "ok",
        "service": "backend-api",
        "timestamp": "<ISO_TIMESTAMP>"
      }
    },
    {
      "name": "Fulfillment Engine",
      "url": "https://api.vauntico.com",
      "health_endpoint": "/fulfillment/health",
      "infrastructure": "OCI",
      "service": "fulfillment-engine",
      "expected_response": {
        "status": "ok",
        "service": "fulfillment-engine",
        "timestamp": "<ISO_TIMESTAMP>"
      }
    },
    {
      "name": "Vault Landing",
      "url": "https://api.vauntico.com",
      "health_endpoint": "/vault/health",
      "infrastructure": "OCI",
      "service": "vault-landing",
      "expected_response": {
        "status": "ok",
        "service": "vault-landing",
        "timestamp": "<ISO_TIMESTAMP>"
      }
    }
  ],
  "health_check_configuration": {
    "timeout_seconds": 30,
    "retry_attempts": 3,
    "alert_threshold": 2,
    "monitoring_interval": "60s"
  }
}
```

## Health Check Scripts

### Bash Script

**File:** `scripts/oci-health-report.sh`

Generates comprehensive health reports for all Vauntico services:

```bash
./scripts/oci-health-report.sh
```

Features:

- Tests all configured endpoints
- Generates timestamped markdown reports
- Validates JSON responses
- Measures response times
- Provides root cause analysis
- Includes troubleshooting steps

### PowerShell Script

**File:** `scripts/oci-health-report.ps1`

Windows-compatible version of the health check script:

```powershell
.\scripts\oci-health-report.ps1
```

## Deployment Integration

### Nginx Configuration

Ensure nginx routes include health check endpoints:

```nginx
# Backend API
location /health {
    proxy_pass http://backend-api:3001/health;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}

# Fulfillment Engine
location /fulfillment/health {
    proxy_pass http://fulfillment-engine:3001/health;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}

# Vault Landing
location /vault/health {
    proxy_pass http://vault-landing:3001/health;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

### Docker Compose

Services should expose health endpoints:

```yaml
services:
  backend-api:
    build: ./server-v2
    ports:
      - "3001:3001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  fulfillment-engine:
    build: ./vauntico-fulfillment-engine
    ports:
      - "5000:3001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  vault-landing:
    build: ./vault-landing
    ports:
      - "6000:3001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

## Testing Health Endpoints

### Manual Testing

```bash
# Test Frontend
curl -s https://vauntico.com/api/health | jq

# Test Backend API
curl -s https://api.vauntico.com/health | jq

# Test Fulfillment Engine
curl -s https://api.vauntico.com/fulfillment/health | jq

# Test Vault Landing
curl -s https://api.vauntico.com/vault/health | jq
```

### Automated Testing

```bash
# Run comprehensive health check
./scripts/oci-health-report.sh

# Run with custom timeout
./scripts/oci-health-report.sh --timeout 60

# Run specific services
./scripts/oci-health-report.sh --services "backend-api,fulfillment-engine"
```

## Troubleshooting

### Common Issues

1. **Service Not Responding**
   - Check container status: `docker ps`
   - Check container logs: `docker logs <container-name>`
   - Verify port mapping: `docker-compose ps`

2. **Invalid JSON Response**
   - Check service code for syntax errors
   - Verify environment variables are set
   - Review service logs for errors

3. **Network Issues**
   - Test internal connectivity: `curl http://localhost:<port>/health`
   - Check nginx configuration: `nginx -t`
   - Verify load balancer health checks

4. **Monitoring Alerts**
   - Check Prometheus targets: http://prometheus:9090/targets
   - Verify alertmanager rules: http://alertmanager:9093/#/alerts
   - Review Grafana dashboards

### Recovery Steps

1. **Restart Services**

   ```bash
   docker-compose down
   docker-compose up -d
   ```

2. **Force Update**

   ```bash
   docker-compose pull
   docker-compose up -d --force-recreate
   ```

3. **Rollback**
   ```bash
   docker-compose down
   docker-compose up -d --force-recreate --no-deps <service-name>
   ```

## Monitoring Integration

### Grafana Dashboards

Key metrics to monitor:

- HTTP response codes (2xx, 4xx, 5xx)
- Response time trends
- Service uptime percentages
- Error rates by service

### Alerting Rules

Configure alerts for:

- Service downtime > 2 minutes
- Response time > 5 seconds
- Error rate > 5%
- Failed health checks > 3 consecutive attempts

## Migration from Railway

### Removed Endpoints

- `https://server-v2.up.railway.app/health`
- `https://vauntico-fulfillment-engine.up.railway.app/health`
- `https://vault-landing.up.railway.app/health.json`

### New OCI Endpoints

- `https://api.vauntico.com/health` (Backend API)
- `https://api.vauntico.com/fulfillment/health` (Fulfillment Engine)
- `https://api.vauntico.com/vault/health` (Vault Landing)
- `https://vauntico.com/api/health` (Frontend - unchanged)

### Update Checklist

- [ ] Remove Railway URLs from monitoring tools
- [ ] Update Prometheus configuration
- [ ] Update Grafana dashboards
- [ ] Update alerting rules
- [ ] Test new endpoints
- [ ] Update documentation
- [ ] Verify load balancer configuration

## Security Considerations

### Health Endpoint Security

- Health endpoints should not expose sensitive data
- Rate limiting may be applied to prevent abuse
- Authentication is not required for basic health checks
- Consider IP whitelisting for monitoring systems

### Best Practices

- Use consistent response formats
- Include uptime metrics
- Provide environment information
- Implement proper HTTP status codes
- Add logging for health check requests

## Future Enhancements

### Planned Features

1. **Enhanced Metrics**
   - Database connectivity status
   - External API dependencies
   - Resource utilization metrics
   - Custom business metrics

2. **Advanced Monitoring**
   - Distributed tracing integration
   - Custom alert thresholds
   - Automated remediation
   - Predictive health analysis

3. **Dashboard Improvements**
   - Real-time service topology
   - Historical trend analysis
   - Performance baselines
   - Capacity planning metrics

---

**Last Updated:** 2025-12-22  
**Version:** 1.0.0  
**Maintainer:** Vauntico DevOps Team
