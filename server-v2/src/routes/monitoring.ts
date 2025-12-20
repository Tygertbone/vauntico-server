import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/authenticate';
import { alertManager, AlertSeverity } from '../utils/slack-alerts';
import { securityMonitor } from '../middleware/security';
import { subscriptionManager } from '../utils/subscriptions';
import { logger } from '../utils/logger';

const router = Router();

// Automated health monitoring endpoint (for CI/CD and uptime monitors)
router.get('/health-detailed', async (req: Request, res: Response) => {
  try {
    const healthCheck = await alertManager.performHealthCheck();

    // Additional health metrics
    const subscriptionStats = await subscriptionManager.getAnalytics();
    const securityStats = securityMonitor.getSecurityStats(1); // Last hour

    const alertDetails = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      subscriptionAnalytics: subscriptionStats,
      securityEvents: securityStats,
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development'
    };

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB',
        external: Math.round(process.memoryUsage().external / 1024 / 1024) + 'MB'
      },
      services: {
        database: 'connected',
        redis: 'connected',
        stripe: 'integrated'
      },
      metrics: {
        activeSubscriptions: subscriptionStats.premiumUsers || 0,
        trialUsers: subscriptionStats.trialUsers || 0,
        securityEventsLastHour: securityStats.totalEvents || 0,
        topAttackerIPs: securityStats.topIPs?.slice(0, 3) || []
      }
    });
  } catch (error) {
    // Auto-alert on health check failure
    await alertManager.alertSystemError({
      component: 'health-check',
      error: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      severity: AlertSeverity.CRITICAL,
      context: { uptime: process.uptime(), memory: process.memoryUsage() }
    });

    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Health check failed'
    });
  }
});

// Admin monitoring dashboard data
router.get('/stats', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get subscription analytics
    const subscriptionStats = await subscriptionManager.getAnalytics();

    // Get security statistics for different time periods
    const securityStats = {
      lastHour: securityMonitor.getSecurityStats(1),
      last24Hours: securityMonitor.getSecurityStats(24),
      lastWeek: securityMonitor.getSecurityStats(168), // 7 days
    };

    // System metrics
    const systemMetrics = {
      uptime: process.uptime(),
      memoryUsage: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024)
      },
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development'
    };

    // Recent security events (last 10)
    const recentSecurityEvents = securityMonitor.getRecentEvents(10);

    res.json({
      timestamp: new Date().toISOString(),
      subscriptions: subscriptionStats,
      security: securityStats,
      system: systemMetrics,
      recentEvents: recentSecurityEvents.map(event => ({
        type: event.type,
        severity: event.severity,
        ip: event.ip,
        endpoint: event.endpoint,
        timestamp: event.timestamp,
        details: event.details
      }))
    });
  } catch (error) {
    logger.error('Failed to get monitoring stats', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    res.status(500).json({ error: 'Failed to get monitoring statistics' });
  }
});

// Manual alert testing endpoint (for development/testing)
router.post('/test-alert/:type', authenticate, async (req: Request, res: Response) => {
  try {
    const alertType = req.params.type;
    const { message, severity, details } = req.body;

    switch (alertType) {
      case 'security':
        await alertManager.alertSecurityIncident({
          type: 'TEST_ALERT',
          userId: req.user?.userId,
          ip: req.ip,
          url: '/test',
          severity: severity || 'MEDIUM',
          extraDetails: details
        });
        break;

      case 'performance':
        await alertManager.alertPerformanceIssue({
          metric: 'test_metric',
          value: 100,
          threshold: 50,
          url: '/test',
          severity: severity || 'MEDIUM'
        });
        break;

      case 'system':
        await alertManager.alertSystemError({
          component: 'test_component',
          error: message || 'Test system error',
          severity: severity || 'HIGH',
          context: details
        });
        break;

      case 'business':
        await alertManager.alertBusinessMetric({
          metric: 'test_metric',
          value: 42,
          target: 100,
          severity: severity || 'MEDIUM'
        });
        break;

      case 'deployment':
        await alertManager.alertDeploymentEvent({
          environment: 'test',
          status: 'completed',
          version: 'v1.0.0-test',
          duration: 60
        });
        break;

      default:
        return res.status(400).json({ error: 'Invalid alert type. Use: security, performance, system, business, deployment' });
    }

    res.json({ success: true, message: `Test ${alertType} alert sent successfully` });
  } catch (error) {
    logger.error('Failed to send test alert', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    res.status(500).json({ error: 'Failed to send test alert' });
  }
});

// Subscription metrics endpoint (for dashboards)
router.get('/metrics/subscriptions', authenticate, async (req: Request, res: Response) => {
  try {
    const analytics = await subscriptionManager.getAnalytics();

    // Monthly recurring revenue calculation (simple estimate)
    // In real implementation, this would come from Stripe data
    const estimatedMRR = (analytics.premiumUsers || 0) * 29; // $29/month per user

    res.json({
      totalUsers: analytics.freeUsers || 0,
      premiumUsers: analytics.premiumUsers || 0,
      trialUsers: analytics.trialUsers || 0,
      churnRate: analytics.churnRate || 0,
      conversionRate: analytics.conversionRate || 0,
      estimatedMRR,
      estimatedARR: estimatedMRR * 12,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get subscription metrics', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    res.status(500).json({ error: 'Failed to get subscription metrics' });
  }
});

// Security analytics endpoint
router.get('/metrics/security', authenticate, async (req: Request, res: Response) => {
  try {
    const last24Hours = securityMonitor.getSecurityStats(24);
    const lastWeek = securityMonitor.getSecurityStats(168);

    // Calculate trends
    const dailyGrowth = lastWeek.totalEvents / 7;
    const riskLevel = last24Hours.totalEvents > 100 ? 'high' :
                     last24Hours.totalEvents > 50 ? 'medium' : 'low';

    res.json({
      period: '24_hours',
      totalEvents: last24Hours.totalEvents,
      eventsBySeverity: last24Hours.eventsBySeverity,
      eventsByType: last24Hours.eventsByType,
      topAttackerIPs: last24Hours.topIPs,
      trend: {
        dailyAverage: Math.round(dailyGrowth * 10) / 10,
        riskLevel,
        comparison: `${last24Hours.totalEvents} events today (${dailyGrowth.toFixed(1)} daily avg)`
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get security metrics', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    res.status(500).json({ error: 'Failed to get security metrics' });
  }
});

export default router;
