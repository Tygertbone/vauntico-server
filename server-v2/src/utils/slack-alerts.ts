import { pool } from '../db/pool';
import { logger } from './logger';

// Alert types with severity levels
export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Alert categories
export enum AlertCategory {
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  BUSINESS = 'business',
  SYSTEM = 'system',
  DEPLOYMENT = 'deployment'
}

// Enhanced alert interface
interface AlertData {
  title: string;
  message: string;
  severity: AlertSeverity;
  category: AlertCategory;
  details?: any;
  userId?: string;
  ip?: string;
  url?: string;
  tags?: string[];
}

// Production monitoring and alerting system
class AlertManager {
  private webhookUrl: string | null;
  private alertThrottle: Map<string, number> = new Map();
  private readonly THROTTLE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.webhookUrl = process.env.SLACK_WEBHOOK_URL || null;
  }

  // Send alert with throttling to prevent spam
  async sendAlert(data: AlertData): Promise<boolean> {
    const alertKey = `${data.category}:${data.severity}:${data.title}`;
    const now = Date.now();
    const lastSent = this.alertThrottle.get(alertKey) || 0;

    // For high/critical alerts, don't throttle
    if (data.severity === AlertSeverity.CRITICAL || data.severity === AlertSeverity.HIGH) {
      return this.sendToSlack(data);
    }

    // For other alerts, throttle if sent recently
    if (now - lastSent < this.THROTTLE_DURATION) {
      logger.debug('Alert throttled', { alertKey, timeUntilNext: (this.THROTTLE_DURATION - (now - lastSent)) / 1000 });
      return false;
    }

    this.alertThrottle.set(alertKey, now);
    return this.sendToSlack(data);
  }

  // Send formatted Slack message
  private async sendToSlack(data: AlertData): Promise<boolean> {
    if (!this.webhookUrl) {
      logger.warn('SLACK_WEBHOOK_URL not configured, skipping alert', {
        severity: data.severity,
        category: data.category,
        title: data.title
      });
      return false;
    }

    try {
      const color = this.getSeverityColor(data.severity);
      const emoji = this.getSeverityEmoji(data.severity);
      const timestamp = Math.floor(Date.now() / 1000);

      const payload = {
        text: `${emoji} ${data.severity.toUpperCase()}: ${data.title}`,
        attachments: [{
          color,
          fields: [
            {
              title: 'Message',
              value: data.message,
              short: false
            },
            {
              title: 'Category',
              value: data.category,
              short: true
            },
            {
              title: 'Environment',
              value: process.env.NODE_ENV || 'development',
              short: true
            }
          ],
          ts: timestamp
        }]
      };

      // Add details if provided
      if (data.details) {
        if (typeof data.details === 'string') {
          payload.attachments[0].fields.push({
            title: 'Details',
            value: data.details,
            short: false
          });
        } else {
          payload.attachments[0].fields.push({
            title: 'Details',
            value: `\`\`\`${JSON.stringify(data.details, null, 2)}\`\`\``,
            short: false
          });
        }
      }

      // Add context fields
      if (data.userId) {
        payload.attachments[0].fields.push({
          title: 'User ID',
          value: data.userId,
          short: true
        });
      }

      if (data.ip) {
        payload.attachments[0].fields.push({
          title: 'IP Address',
          value: data.ip,
          short: true
        });
      }

      if (data.url) {
        payload.attachments[0].fields.push({
          title: 'URL',
          value: data.url,
          short: true
        });
      }

      // Add tags if provided
      if (data.tags && data.tags.length > 0) {
        payload.attachments[0].fields.push({
          title: 'Tags',
          value: data.tags.join(', '),
          short: false
        });
      }

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Slack API error: ${response.status} ${response.statusText}`);
      }

      logger.info('Alert sent successfully', {
        severity: data.severity,
        category: data.category,
        title: data.title
      });

      return true;
    } catch (error) {
      logger.error('Failed to send Slack alert', {
        error: error instanceof Error ? error.message : 'Unknown error',
        alertData: { ...data, details: data.details ? '[REDACTED]' : undefined }
      });
      return false;
    }
  }

  // Pre-defined alert methods for common scenarios

  async alertSecurityIncident(details: {
    type: string;
    userId?: string;
    ip?: string;
    url?: string;
    severity?: AlertSeverity;
    extraDetails?: any;
  }): Promise<void> {
    await this.sendAlert({
      title: `Security Incident: ${details.type}`,
      message: `Security event detected requiring immediate attention`,
      severity: details.severity || AlertSeverity.HIGH,
      category: AlertCategory.SECURITY,
      userId: details.userId,
      ip: details.ip,
      url: details.url,
      details: details.extraDetails,
      tags: ['security', 'incident']
    });
  }

  async alertPerformanceIssue(details: {
    metric: string;
    value: number;
    threshold: number;
    url?: string;
    severity?: AlertSeverity;
  }): Promise<void> {
    await this.sendAlert({
      title: `Performance Alert: ${details.metric}`,
      message: `${details.metric} exceeded threshold (${details.value} > ${details.threshold})`,
      severity: details.severity || AlertSeverity.MEDIUM,
      category: AlertCategory.PERFORMANCE,
      url: details.url,
      details: details,
      tags: ['performance', 'metric']
    });
  }

  async alertSystemError(details: {
    component: string;
    error: string;
    severity?: AlertSeverity;
    context?: any;
  }): Promise<void> {
    await this.sendAlert({
      title: `System Error: ${details.component}`,
      message: details.error,
      severity: details.severity || AlertSeverity.HIGH,
      category: AlertCategory.SYSTEM,
      details: details.context,
      tags: ['system', 'error', details.component.toLowerCase()]
    });
  }

  async alertBusinessMetric(details: {
    metric: string;
    value: number;
    target?: number;
    severity?: AlertSeverity;
  }): Promise<void> {
    await this.sendAlert({
      title: `Business Metric Alert: ${details.metric}`,
      message: `${details.metric}: ${details.value}${details.target ? ` (target: ${details.target})` : ''}`,
      severity: details.severity || AlertSeverity.MEDIUM,
      category: AlertCategory.BUSINESS,
      details: details,
      tags: ['business', 'metric', details.metric.toLowerCase()]
    });
  }

  async alertDeploymentEvent(details: {
    environment: string;
    status: string;
    version?: string;
    duration?: number;
  }): Promise<void> {
    await this.sendAlert({
      title: `Deployment: ${details.status}`,
      message: `Deployment to ${details.environment} ${details.status}`,
      severity: details.status.includes('fail') ? AlertSeverity.HIGH : AlertSeverity.LOW,
      category: AlertCategory.DEPLOYMENT,
      details: details,
      tags: ['deployment', details.environment, details.status]
    });
  }

  // Health check monitoring
  async performHealthCheck(): Promise<void> {
    try {
      // Check database connectivity
      await pool.query('SELECT 1');

      // Could add more health checks here:
      // - Redis connectivity
      // - External services
      // - Queue health
      // - Memory usage
      // - Response times

      logger.debug('Health check passed');
    } catch (error) {
      await this.alertSystemError({
        component: 'health-check',
        error: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: AlertSeverity.CRITICAL
      });
      throw error;
    }
  }

  // Utility methods
  private getSeverityColor(severity: AlertSeverity): string {
    switch (severity) {
      case AlertSeverity.CRITICAL: return 'danger';
      case AlertSeverity.HIGH: return 'warning';
      case AlertSeverity.MEDIUM: return '#ffa500'; // orange
      case AlertSeverity.LOW: return 'good';
      default: return '#808080'; // gray
    }
  }

  private getSeverityEmoji(severity: AlertSeverity): string {
    switch (severity) {
      case AlertSeverity.CRITICAL: return '🚫';
      case AlertSeverity.HIGH: return '🔴';
      case AlertSeverity.MEDIUM: return '🟠';
      case AlertSeverity.LOW: return '🟡';
      default: return 'ℹ️';
    }
  }

  // Legacy API for backwards compatibility
  async sendSlackAlert(message: string, details?: any): Promise<boolean> {
    return this.sendAlert({
      title: 'Legacy Alert',
      message,
      severity: AlertSeverity.MEDIUM,
      category: AlertCategory.SYSTEM,
      details
    });
  }
}

// Export singleton instance
export const alertManager = new AlertManager();

// Export legacy API
export const sendSlackAlert = (message: string, details?: any) => alertManager.sendSlackAlert(message, details);

export default { alertManager, sendSlackAlert };
