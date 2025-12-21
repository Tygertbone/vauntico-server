# Vauntico Monitoring Stack Guide

## Overview

This guide covers the comprehensive monitoring stack included with your Vauntico VPS deployment. The stack provides:

- **Uptime Kuma** - Uptime monitoring and status pages
- **Prometheus** - Metrics collection and storage
- **Grafana** - Visualization and alerting dashboards
- **Node Exporter** - System metrics collection
- **cAdvisor** - Container resource monitoring
- **AlertManager** - Alert routing and notification

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Applications  │    │   Monitoring    │    │   Visualization │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │Trust Score  │ │    │ │ Prometheus  │ │    │ │  Grafana   │ │
│ │ Backend    │ │◄──►│ │             │ │◄──►│ │             │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│ ┌─────────────┐ │    │        ▲        │    │        ▲        │
│ │Vauntico    │ │    │        │        │    │        │        │
│ │Server       │ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ └─────────────┘ │    │ │Node Exporter│ │    │ │AlertManager │ │
└─────────────────┘    │ │             │ │    │ │             │ │
                       │ └─────────────┘ │    │ └─────────────┘ │
┌─────────────────┐    │        ▲        │    └─────────────────┘
│   Infrastructure│    │        │        │
│                 │    │ ┌─────────────┐ │
│ ┌─────────────┐ │    │ │ cAdvisor    │ │
│ │   NGINX     │ │    │ │             │ │
│ │   Proxy      │ │    │ └─────────────┘ │
│ └─────────────┘ │    └─────────────────┘
│ ┌─────────────┐
│ │Uptime Kuma  │
│ └─────────────┘
└─────────────────┘
```

## Service Access

After deployment, monitoring services are available at:

| Service | URL | Default Credentials |
|---------|-----|-------------------|
| Uptime Kuma | http://your-vps-ip:3003 | admin/admin123 |
| Prometheus | http://your-vps-ip:9090 | No authentication |
| Grafana | http://your-vps-ip:3004 | admin/admin123 |
| AlertManager | http://your-vps-ip:9093 | No authentication |
| cAdvisor | http://your-vps-ip:8080 | No authentication |

**⚠️ Security Note:** Change default passwords before going to production!

## Uptime Kuma

### Setup

1. Access Uptime Kuma at `http://your-vps-ip:3003`
2. Create admin account
3. Set up monitors for your services:

#### Monitor Configuration

Add these monitors:

| Name | URL | Type | Interval |
|------|-----|------|----------|
| Trust Score Backend | http://localhost:3001/health | HTTP |
| Vauntico Server | http://localhost:3002/health | HTTP |
| Fulfillment Engine | http://localhost:5000/api/status | HTTP |
| Legacy Server | http://localhost:5001/api/status | HTTP |
| NGINX Proxy | http://localhost/health | HTTP |

#### Status Page Setup

1. Go to Settings → Status Page
2. Create public status page
3. Add monitors to status page
4. Customize with your branding

### Features

- Real-time uptime monitoring
- Incident tracking
- Status page for users
- Email/Webhook notifications
- SSL certificate monitoring

## Prometheus

### Configuration

Prometheus is configured to collect metrics from:

- **Application Services** - Custom metrics from your services
- **Node Exporter** - System metrics (CPU, memory, disk)
- **cAdvisor** - Container metrics
- **Uptime Kuma** - Uptime metrics
- **NGINX** - Web server metrics

### Key Metrics

#### System Metrics (Node Exporter)
- `node_cpu_seconds_total` - CPU usage
- `node_memory_MemAvailable_bytes` - Available memory
- `node_filesystem_avail_bytes` - Disk space
- `node_network_receive_bytes_total` - Network traffic

#### Container Metrics (cAdvisor)
- `container_cpu_usage_seconds_total` - Container CPU usage
- `container_memory_usage_bytes` - Container memory usage
- `container_fs_usage_bytes` - Container disk usage
- `container_network_receive_bytes_total` - Container network traffic

#### Application Metrics
- `http_requests_total` - HTTP request count
- `http_request_duration_seconds` - Request latency
- `database_connections_active` - Active DB connections
- `cache_hits_total` - Cache performance

### Query Examples

```promql
# CPU usage by instance
rate(node_cpu_seconds_total[5m]) * 100

# Memory usage
(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100

# Container memory usage
container_memory_usage_bytes{container_label_com_docker_compose_service!=""

# HTTP request rate
rate(http_requests_total[5m])

# Error rate
rate(http_requests_total{status=~"5.."}[5m])
```

## Grafana

### Dashboard Setup

Grafana is pre-configured with:

1. **Prometheus Datasource** - Connected to Prometheus
2. **Uptime Kuma Datasource** - Connected to Uptime Kuma
3. **Provisioned Dashboards** - Auto-loaded dashboards

### Key Dashboards

#### 1. System Overview
- CPU, Memory, Disk usage
- Network traffic
- System load
- Uptime metrics

#### 2. Application Performance
- Request rate and latency
- Error rates
- Database performance
- Cache hit rates

#### 3. Container Monitoring
- Resource usage by container
- Container health
- Restart counts
- Network I/O

#### 4. Infrastructure Health
- Service availability
- SSL certificate status
- NGINX performance
- Alert status

### Creating Custom Dashboards

1. Go to Dashboards → New Dashboard
2. Add panels with Prometheus queries
3. Use variables for dynamic filtering
4. Set up alerts on panels

### Alerting in Grafana

```promql
# High CPU usage alert
rate(node_cpu_seconds_total[5m]) * 100 > 80

# High memory usage
(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100 > 85

# Service down
up{job="trust-score-backend"} == 0

# High error rate
rate(http_requests_total{status=~"5.."}[5m]) > 0.1
```

## AlertManager

### Configuration

AlertManager routes alerts to:

- **Email notifications** - Critical alerts
- **Webhook notifications** - Uptime Kuma integration
- **Slack/Discord** - Custom webhooks (configurable)

### Alert Types

#### Critical Alerts
- Service down
- High resource usage (>90%)
- SSL certificate expiry (<7 days)
- Database connection failures

#### Warning Alerts
- High error rates (>5%)
- Slow response times (>2s)
- Disk space low (<20%)

### Notification Channels

#### Email Setup
Update `monitoring/alertmanager.yml`:
```yaml
global:
  smtp_smarthost: 'your-smtp-server:587'
  smtp_from: 'alerts@yourdomain.com'
  smtp_auth_username: 'your-email@yourdomain.com'
  smtp_auth_password: 'your-app-password'
```

#### Webhook Setup
```yaml
receivers:
  - name: 'webhook'
    webhook_configs:
      - url: 'https://your-webhook-url.com/alert'
        send_resolved: true
        http_config:
          bearer_token: 'your-token'
```

## Security Configuration

### Grafana Security

1. Change admin password
2. Disable user registration
3. Set up API keys
4. Configure role-based access

### Prometheus Security

1. Add authentication (optional)
2. Configure network policies
3. Set up firewall rules
4. Enable TLS (if needed)

### General Security

- Change all default passwords
- Use HTTPS for external access
- Implement network segmentation
- Regular security updates
- Monitor access logs

## Performance Optimization

### Data Retention

Configure Prometheus retention in `monitoring/prometheus.yml`:
```yaml
global:
  storage.tsdb.retention.time: 30d  # 30 days
```

### Resource Limits

Add to docker-compose.yml:
```yaml
services:
  prometheus:
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
```

### Query Optimization

- Use recording rules for complex queries
- Implement proper labeling
- Use appropriate time ranges
- Cache expensive queries

## Troubleshooting

### Common Issues

#### Services Not Starting
```bash
# Check logs
docker-compose logs prometheus
docker-compose logs grafana

# Check configuration
docker exec prometheus promtool check config /etc/prometheus/prometheus.yml
```

#### Metrics Not Appearing
```bash
# Check Prometheus targets
curl http://localhost:9090/api/v1/targets

# Check scrape status
curl http://localhost:9090/api/v1/scrape_pool
```

#### Grafana Dashboard Issues
```bash
# Check datasource connection
curl -u admin:admin123 http://localhost:3004/api/datasources

# Verify Prometheus queries
curl http://localhost:9090/api/v1/query?query=up
```

#### AlertManager Not Working
```bash
# Check AlertManager logs
docker-compose logs alertmanager

# Test configuration
docker exec alertmanager amtool config routes test
```

### Log Locations

- **Prometheus:** `docker-compose logs prometheus`
- **Grafana:** `docker-compose logs grafana`
- **AlertManager:** `docker-compose logs alertmanager`
- **Uptime Kuma:** `docker-compose logs uptime-kuma`

## Backup and Recovery

### Data Backup

```bash
# Backup Prometheus data
sudo docker exec prometheus tar czf /tmp/prometheus-backup.tar.gz /prometheus
sudo docker cp prometheus:/tmp/prometheus-backup.tar.gz ./

# Backup Grafana data
sudo docker exec grafana tar czf /tmp/grafana-backup.tar.gz /var/lib/grafana
sudo docker cp grafana:/tmp/grafana-backup.tar.gz ./

# Backup Uptime Kuma data
sudo docker cp uptime-kuma:/app/data ./uptime-kuma-backup
```

### Configuration Backup

```bash
# Backup all monitoring configs
tar czf monitoring-config-backup.tar.gz monitoring/
```

### Recovery

```bash
# Restore Prometheus data
sudo docker cp prometheus-backup.tar.gz prometheus:/tmp/
sudo docker exec prometheus tar xzf /tmp/prometheus-backup.tar.gz -C /

# Restore Grafana data
sudo docker cp grafana-backup.tar.gz grafana:/tmp/
sudo docker exec grafana tar xzf /tmp/grafana-backup.tar.gz -C /

# Restore Uptime Kuma data
sudo docker cp uptime-kuma-backup/* uptime-kuma:/app/data/
```

## Advanced Configuration

### Custom Metrics

Add metrics to your applications:

```javascript
// Express.js example
const prometheus = require('prom-client');

const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status']
});

const httpRequestTotal = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration);
    httpRequestTotal
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .inc();
  });
  next();
});
```

### Recording Rules

Add to `monitoring/prometheus.yml`:
```yaml
rule_files:
  - "recording_rules.yml"

# recording_rules.yml
groups:
  - name: application
    rules:
      - record: job:http_requests:rate5m
        expr: rate(http_requests_total[5m])
      
      - record: job:http_request_errors:rate5m
        expr: rate(http_requests_total{status=~"5.."}[5m])
```

### Alerting Rules

Create `monitoring/alert_rules.yml`:
```yaml
groups:
  - name: application
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors/second"
```

## Maintenance

### Regular Tasks

#### Daily
- Check alert status
- Review dashboard anomalies
- Verify data collection

#### Weekly
- Update monitoring configurations
- Review alert thresholds
- Check storage usage

#### Monthly
- Update monitoring tools
- Review and rotate secrets
- Performance optimization

### Automation

```bash
# Health check for monitoring stack
#!/bin/bash
services=("prometheus" "grafana" "alertmanager" "uptime-kuma")

for service in "${services[@]}"; do
    if curl -f http://localhost:${service}_PORT >/dev/null 2>&1; then
        echo "✓ $service is healthy"
    else
        echo "✗ $service is down"
        # Send alert
    fi
done
```

## Integration with External Services

### Slack Integration

```yaml
# AlertManager configuration
receivers:
  - name: 'slack'
    slack_configs:
      - api_url: 'YOUR_SLACK_WEBHOOK_URL'
        channel: '#alerts'
        title: 'Vauntico Alert'
        text: '{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'
```

### Discord Integration

```yaml
receivers:
  - name: 'discord'
    webhook_configs:
      - url: 'YOUR_DISCORD_WEBHOOK_URL'
        title: 'Vauntico Alert'
        message: '{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'
```

### PagerDuty Integration

```yaml
receivers:
  - name: 'pagerduty'
    pagerduty_configs:
      - routing_key: 'YOUR_PAGERDUTY_KEY'
        description: '{{ .GroupLabels.alertname }}'
```

This comprehensive monitoring stack provides enterprise-grade observability for your Vauntico deployment, ensuring you can monitor, alert on, and troubleshoot issues effectively.
