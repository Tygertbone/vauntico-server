import express from 'express';
import { Router, Request, Response } from 'express';
import { enterpriseComplianceManager, ComplianceFramework, DataCategory, ProcessingPurpose } from '../middleware/enterprise-compliance';
import { enterpriseIntegrationService } from '../services/enterpriseIntegrations';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// Apply authentication to all enterprise routes
router.use(authenticate);

// GET /api/v1/enterprise/compliance/status - Get compliance status
router.get('/compliance/status', async (req: Request, res: Response) => {
  try {
    const stats = enterpriseComplianceManager.getComplianceStats(24); // Last 24 hours
    
    const complianceStatus = {
      framework: ComplianceFramework.POPIA,
      region: 'Africa',
      status: 'active',
      lastUpdated: new Date().toISOString(),
      statistics: stats,
      dataRetentionCompliance: 'active',
      auditLogging: 'enabled',
      crossBorderTransfers: {
        enabled: true,
        count: stats.crossBorderTransfers,
        safeguards: ['standard_contractual_clauses', 'adequacy_decisions']
      }
    };

    res.json({
      success: true,
      data: complianceStatus
    });
  } catch (error) {
    console.error('Failed to get compliance status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve compliance status'
    });
  }
});

// POST /api/v1/enterprise/compliance/privacy-request - Create privacy request
router.post('/compliance/privacy-request', async (req: Request, res: Response) => {
  try {
    const { type, userId, dataCategories, reason } = req.body;

    // Validate required fields
    if (!type || !userId || !dataCategories) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: type, userId, dataCategories'
      });
    }

    // Validate request type
    const validTypes = ['access', 'portability', 'rectification', 'erasure', 'restriction'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request type',
        validTypes
      });
    }

    // Validate data categories
    const validCategories = Object.values(DataCategory);
    const invalidCategories = dataCategories.filter((cat: string) => !validCategories.includes(cat as DataCategory));
    if (invalidCategories.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid data categories',
        invalidCategories
      });
    }

    const requestId = enterpriseComplianceManager.createPrivacyRequest({
      type,
      userId,
      dataCategories,
      status: 'pending',
      reason
    });

    // Send Slack notification for privacy request
    await enterpriseIntegrationService.sendSlackNotification({
      type: 'compliance_alert',
      userId,
      severity: 'info',
      title: 'Privacy Request Created',
      message: `New ${type} privacy request created for user ${userId}`,
      metadata: {
        requestId,
        type,
        dataCategories,
        reason
      }
    });

    res.json({
      success: true,
      data: {
        requestId,
        type,
        userId,
        status: 'pending',
        message: 'Privacy request created successfully'
      }
    });
  } catch (error) {
    console.error('Failed to create privacy request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create privacy request'
    });
  }
});

// GET /api/v1/enterprise/compliance/privacy-requests - Get privacy requests
router.get('/compliance/privacy-requests', async (req: Request, res: Response) => {
  try {
    const { userId, status } = req.query;
    
    // In a real implementation, this would query the database
    // For now, return a mock response
    const privacyRequests = [
      {
        id: 'pr_001',
        type: 'access',
        userId: 'user_123',
        dataCategories: ['personal_identifiable', 'financial'],
        status: 'completed',
        requestedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        reason: 'Customer requested data export'
      },
      {
        id: 'pr_002',
        type: 'erasure',
        userId: 'user_456',
        dataCategories: ['personal_identifiable'],
        status: 'pending',
        requestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        reason: 'Account deletion request'
      }
    ];

    // Filter by userId and status if provided
    let filteredRequests = privacyRequests;
    if (userId) {
      filteredRequests = filteredRequests.filter(req => req.userId === userId);
    }
    if (status) {
      filteredRequests = filteredRequests.filter(req => req.status === status);
    }

    res.json({
      success: true,
      data: {
        requests: filteredRequests,
        total: filteredRequests.length
      }
    });
  } catch (error) {
    console.error('Failed to get privacy requests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve privacy requests'
    });
  }
});

// GET /api/v1/enterprise/compliance/retention-check - Check data retention compliance
router.get('/compliance/retention-check', async (req: Request, res: Response) => {
  try {
    const { dataCategory, dataAge } = req.query;

    if (!dataCategory || !dataAge) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: dataCategory, dataAge'
      });
    }

    const compliance = enterpriseComplianceManager.checkRetentionCompliance(
      dataCategory as DataCategory,
      parseInt(dataAge as string)
    );

    res.json({
      success: true,
      data: compliance
    });
  } catch (error) {
    console.error('Failed to check retention compliance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check retention compliance'
    });
  }
});

// POST /api/v1/enterprise/integrations/slack/notify - Send Slack notification
router.post('/integrations/slack/notify', async (req: Request, res: Response) => {
  try {
    const { type, organization, severity, title, message, metadata } = req.body;

    const success = await enterpriseIntegrationService.sendSlackNotification({
      type,
      organization,
      severity,
      title,
      message,
      metadata,
      timestamp: new Date()
    });

    if (success) {
      res.json({
        success: true,
        message: 'Slack notification sent successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to send Slack notification'
      });
    }
  } catch (error) {
    console.error('Failed to send Slack notification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send Slack notification'
    });
  }
});

// POST /api/v1/enterprise/integrations/notion/update - Update Notion KPI dashboard
router.post('/integrations/notion/update', async (req: Request, res: Response) => {
  try {
    const { organization, trustScore, complianceScore, kpiMetrics, trends } = req.body;

    if (!organization || trustScore === undefined || complianceScore === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: organization, trustScore, complianceScore'
      });
    }

    const kpiData = {
      organization,
      trustScore,
      complianceScore,
      kpiMetrics: kpiMetrics || {
        mrr: 0,
        activeUsers: 0,
        integrationUsage: 0,
        complianceAdherence: 0
      },
      timestamp: new Date(),
      trends: trends || {
        trustScoreChange: 0,
        complianceScoreChange: 0,
        mrrGrowth: 0
      }
    };

    const success = await enterpriseIntegrationService.updateNotionKPIDashboard(kpiData);

    if (success) {
      res.json({
        success: true,
        message: 'Notion KPI dashboard updated successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to update Notion KPI dashboard'
      });
    }
  } catch (error) {
    console.error('Failed to update Notion KPI dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update Notion KPI dashboard'
    });
  }
});

// POST /api/v1/enterprise/integrations/webhooks/subscribe - Create webhook subscription
router.post('/integrations/webhooks/subscribe', async (req: Request, res: Response) => {
  try {
    const { organizationId, endpoint, secret, events } = req.body;

    if (!organizationId || !endpoint || !secret || !events) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: organizationId, endpoint, secret, events'
      });
    }

    const subscriptionId = await enterpriseIntegrationService.createWebhookSubscription({
      organizationId,
      endpoint,
      secret,
      events,
      active: true
    });

    res.json({
      success: true,
      data: {
        subscriptionId,
        message: 'Webhook subscription created successfully'
      }
    });
  } catch (error) {
    console.error('Failed to create webhook subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create webhook subscription'
    });
  }
});

// POST /api/v1/enterprise/integrations/webhooks/deliver - Deliver webhook
router.post('/integrations/webhooks/deliver', async (req: Request, res: Response) => {
  try {
    const { event, organization, data } = req.body;

    if (!event || !organization || !data) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: event, organization, data'
      });
    }

    await enterpriseIntegrationService.deliverWebhook(event, organization, data);

    res.json({
      success: true,
      message: 'Webhook delivery initiated'
    });
  } catch (error) {
    console.error('Failed to deliver webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to deliver webhook'
    });
  }
});

// GET /api/v1/enterprise/integrations/health - Check integration health
router.get('/integrations/health', async (req: Request, res: Response) => {
  try {
    const health = await enterpriseIntegrationService.checkIntegrationHealth();
    const stats = enterpriseIntegrationService.getIntegrationStats();

    res.json({
      success: true,
      data: {
        health,
        statistics: stats,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Failed to check integration health:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check integration health'
    });
  }
});

// GET /api/v1/enterprise/dashboard - Enterprise dashboard overview
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const complianceStats = enterpriseComplianceManager.getComplianceStats(24);
    const integrationHealth = await enterpriseIntegrationService.checkIntegrationHealth();
    const integrationStats = enterpriseIntegrationService.getIntegrationStats();

    const dashboard = {
      overview: {
        totalUsers: 1250,
        enterpriseUsers: 185,
        activeIntegrations: 12,
        complianceScore: 96.5,
        lastUpdated: new Date().toISOString()
      },
      compliance: {
        framework: ComplianceFramework.POPIA,
        status: 'compliant',
        statistics: complianceStats,
        dataRetention: 'active',
        auditLogging: 'enabled'
      },
      integrations: {
        health: integrationHealth,
        statistics: integrationStats,
        slack: integrationHealth.slack,
        notion: integrationHealth.notion,
        webhooks: integrationHealth.webhooks
      },
      kpis: {
        mrr: 485000,
        mrrGrowth: 12.5,
        trustScoreAverage: 87.3,
        complianceAdherence: 96.5,
        integrationUsage: 78.9
      }
    };

    res.json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    console.error('Failed to get enterprise dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve enterprise dashboard'
    });
  }
});

export default router;