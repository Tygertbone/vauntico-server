import { Router, Request, Response } from 'express';
import { authenticateApiKey } from '../middleware/auth';
import ApiUsageService from '../services/apiUsageService';
import { normalizeQueryParam } from '../utils/queryParams';

// Query parameter helper function
const qp = (param: unknown): string => {
  if (Array.isArray(param)) {
    return param[0] || '';
  }
  return param?.toString() || '';
};

// AuthedRequest type for authenticated routes
type AuthedRequest = Request & { user: NonNullable<Request['user']> };

const router: Router = Router();

/**
 * @swagger
 * /api/v1/metrics/widget-usage:
 *   post:
 *     summary: Track widget usage for KPI analytics
 *     description: Endpoint for tracking widget interactions and usage patterns
 *     parameters:
 *       - in: header
 *         name: X-API-Key
 *         required: true
 *         schema:
 *           type: string
 *           description: API key for authentication
 *       - in: body
 *         name: usageData
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             action:
 *               type: string
 *               enum: [load, refresh, error, config_change, interaction]
 *               description: Type of widget action
 *             userId:
 *               type: string
 *               description: User ID associated with the widget
 *             tier:
 *               type: string
 *               enum: [basic, pro, enterprise]
 *               description: User's subscription tier
 *             score:
 *               type: number
 *               minimum: 0
 *               maximum: 100
 *               description: User's current trust score
 *             widgetConfig:
 *               type: object
 *               properties:
 *                 theme:
 *                   type: string
 *                   enum: [light, dark, auto]
 *                 showLogo:
 *                   type: boolean
 *                 showDetails:
 *                   type: boolean
 *               description: Widget configuration settings
 *             timestamp:
 *               type: string
 *               format: date-time
 *               description: When the action occurred
 *             metadata:
 *               type: object
 *               properties:
 *                 userAgent:
 *                   type: string
 *                 referrer:
 *                   type: string
 *                 screenResolution:
 *                   type: string
 *                 timezone:
 *                   type: string
 *               description: Optional metadata for enhanced analytics
 *     responses:
 *       200:
 *         description: Usage tracked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 tracked:
 *                   type: boolean
 *                   example: true
 *                 metrics:
 *                   type: object
 *                   properties:
 *                     totalWidgetLoads:
 *                       type: number
 *                     activeWidgets:
 *                       type: number
 *                     errorsCount:
 *                       type: number
 *       401:
 *         description: Unauthorized - Invalid or missing API key
 *       400:
 *         description: Bad Request - Invalid usage data
 *       429:
 *         description: Too Many Requests - Rate limit exceeded
 */

// Widget usage tracking endpoint
router.post('/api/v1/metrics/widget-usage', async (req: Request, res: Response): Promise<void> => {
  try {
    const apiKey = req.headers['x-api-key'];
    
    // Validate API key
    if (!apiKey || !await authenticateApiKey(apiKey)) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or missing API key'
      });
      return;
    }

    const usageData = req.body;
    
    // Validate required fields
    const requiredFields = ['action', 'userId', 'timestamp'];
    const missingFields = requiredFields.filter(field => !usageData[field]);
    
    if (missingFields.length > 0) {
      res.status(400).json({
        error: 'Bad Request',
        message: `Missing required fields: ${missingFields.join(', ')}`,
        required_fields: requiredFields
      });
      return;
    }

    // Validate action type
    const validActions = ['load', 'refresh', 'error', 'config_change', 'interaction'];
    if (!validActions.includes(usageData.action)) {
      res.status(400).json({
        error: 'Bad Request',
        message: `Invalid action. Must be one of: ${validActions.join(', ')}`,
        valid_actions: validActions
      });
      return;
    }

    // Extract additional metadata
    const metadata = {
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.connection.remoteAddress,
      referrer: req.headers.referer || req.headers.referrer,
      timestamp: new Date().toISOString(),
      ...usageData.metadata
    };

    // Log widget usage for KPI tracking
    const apiKeyString = Array.isArray(apiKey) ? apiKey[0] : apiKey;
    if (!apiKeyString) {
      throw new Error('API key is required');
    }
    await ApiUsageService.logWidgetUsage(apiKeyString, {
      ...usageData,
      metadata
    });

    // Get current widget metrics
    const metrics = await ApiUsageService.getWidgetMetrics(apiKeyString);

    // Phase 2 specific KPI tracking
    const phase2Metrics = {
      widgetLoads: metrics.actionCounts.load || 0,
      widgetRefreshes: metrics.actionCounts.refresh || 0,
      widgetErrors: metrics.actionCounts.error || 0,
      configChanges: metrics.actionCounts.config_change || 0,
      userInteractions: metrics.actionCounts.interaction || 0,
      activeWidgets: metrics.activeWidgets || 0,
      tierDistribution: metrics.tierDistribution || {},
      averageScore: metrics.averageScore || 0,
      errorRate: metrics.errorRate || 0
    };

    res.json({
      success: true,
      tracked: true,
      timestamp: new Date().toISOString(),
      metrics: phase2Metrics,
      monetization: {
        tier: normalizeQueryParam(usageData.tier) || '',
        creditsUsed: usageData.action === 'refresh' ? 1 : 0, // Refresh uses 1 credit
        widgetUsageCount: metrics.totalUsage || 1,
        target500K: '500K MRR from businesses',
        currentMRR: (metrics.tierDistribution.enterprise || 0) * 499 + (metrics.tierDistribution.pro || 0) * 99 + (metrics.tierDistribution.basic || 0) * 29
      },
      metadata: {
        version: '2.0.0',
        endpoint: '/api/v1/metrics/widget-usage'
      }
    });

  } catch (error) {
    console.error('Error tracking widget usage:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to track widget usage'
    });
  }
});

// Additional endpoint for widget-specific data
router.get('/api/v1/widget/data', async (req: Request, res: Response): Promise<void> => {
  try {
    const widgetId: string = qp(req.query.widgetId);
    const userId: string = qp(req.query.userId);
    const apiKey = req.headers['x-api-key'];
    
    // Validate API key
    if (!apiKey || !await authenticateApiKey(apiKey)) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or missing API key'
      });
      return;
    }

    // Validate required parameters
    if (!widgetId || !userId) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'widgetId and userId parameters are required'
      });
      return;
    }

    // Ensure apiKey is a string and not undefined
    const apiKeyString = Array.isArray(apiKey) ? apiKey[0] : apiKey;
    if (!apiKeyString) {
      throw new Error('API key is required');
    }

    // Log API usage
    await ApiUsageService.logUsage(apiKeyString, 'widget-data', 'basic');

    // Get widget data (using existing getWidgetMetrics method)
    const widgetMetrics = await ApiUsageService.getWidgetMetrics(apiKeyString);

    res.json({
      widgetId,
      userId,
      data: widgetMetrics,
      metadata: {
        version: '2.0.0',
        endpoint: '/api/v1/widget/data'
      }
    });
  } catch (error) {
    console.error('Error fetching widget data:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve widget data'
    });
  }
});

/**
 * @swagger
 * /api/v1/metrics/widget-analytics:
 *   get:
 *     summary: Get widget analytics dashboard
 *     description: Retrieve comprehensive widget usage analytics for KPI monitoring
 *     parameters:
 *       - in: header
 *         name: X-API-Key
 *         required: true
 *         schema:
 *           type: string
 *           description: API key for authentication
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: [1h, 24h, 7d, 30d]
 *           default: 24h
 *         description: Timeframe for analytics data
 *       - in: query
 *         name: tier
 *         schema:
 *           type: string
 *           enum: [basic, pro, enterprise, all]
 *           default: all
 *         description: Filter by subscription tier
 *     responses:
 *       200:
 *         description: Analytics data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timeframe:
 *                   type: string
 *                 totalUsage:
 *                   type: number
 *                 actionBreakdown:
 *                   type: object
 *                   properties:
 *                     load:
 *                       type: number
 *                     refresh:
 *                       type: number
 *                     error:
 *                       type: number
 *                     config_change:
 *                       type: number
 *                     interaction:
 *                       type: number
 *                 tierDistribution:
 *                   type: object
 *                 performanceMetrics:
 *                   type: object
 *                   properties:
 *                     averageScore:
 *                       type: number
 *                     errorRate:
 *                       type: number
 *                     refreshRate:
 *                       type: number
 *                 monetizationMetrics:
 *                   type: object
 *                   properties:
 *                     totalCreditsUsed:
 *                       type: number
 *                     widgetUptime:
 *                       type: number
 *                     activeIntegrations:
 *                       type: number
 *       401:
 *         description: Unauthorized - Invalid or missing API key
 */

// Get widget analytics dashboard
router.get('/api/v1/metrics/widget-analytics', async (req: Request, res: Response): Promise<void> => {
  try {
    const apiKey = req.headers['x-api-key'];
    
    // Validate API key
    if (!apiKey || !await authenticateApiKey(apiKey)) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or missing API key'
      });
      return;
    }

    const timeframe = qp(req.query.timeframe) || '24h';
    const tier = qp(req.query.tier) || 'all';
    
    // Ensure apiKey is a string and not undefined
    const apiKeyString = Array.isArray(apiKey) ? apiKey[0] : apiKey;
    if (!apiKeyString) {
      throw new Error('API key is required');
    }
    
    // Get comprehensive analytics (using existing getWidgetAnalytics method)
    const analytics = await ApiUsageService.getWidgetAnalytics(apiKeyString, {
      timeframe: timeframe,
      tier: tier
    });

    // Phase 2 monetization context
    const monetizationContext = {
      target500K: '500K MRR from businesses',
      currentMRR: analytics.currentMRR || 0,
      progressPercentage: analytics.currentMRR ? (analytics.currentMRR / 500000) * 100 : 0,
      licenseRevenue: analytics.licenseRevenue || 0,
      enterpriseCount: analytics.enterpriseCount || 0,
      proCount: analytics.proCount || 0,
      basicCount: analytics.basicCount || 0
    };

    res.json({
      success: true,
      timeframe: timeframe,
      analytics: {
        totalUsage: analytics.totalUsage || 0,
        actionBreakdown: analytics.actionBreakdown || {},
        tierDistribution: analytics.tierDistribution || {},
        performanceMetrics: {
          averageScore: analytics.averageScore || 0,
          errorRate: analytics.errorRate || 0,
          refreshRate: analytics.refreshRate || 0,
          uptimePercentage: analytics.uptimePercentage || 100
        },
        monetizationMetrics: {
          totalCreditsUsed: analytics.totalCreditsUsed || 0,
          widgetUptime: analytics.widgetUptime || 0,
          activeIntegrations: analytics.activeIntegrations || 0,
          revenuePerWidget: analytics.revenuePerWidget || 0
        }
      },
      monetization: monetizationContext,
      phase: 'Phase 2: B2B API Licensing',
      metadata: {
        version: '2.0.0',
        endpoint: '/api/v1/metrics/widget-analytics',
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error retrieving widget analytics:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve widget analytics'
    });
  }
});

// Additional endpoint for tier-specific widget data
router.get('/api/v1/widget/tier', async (req: Request, res: Response): Promise<void> => {
  try {
    const tier: string = qp(req.query.tier);
    const apiKey = req.headers['x-api-key'];
    
    // Validate API key
    if (!apiKey || !await authenticateApiKey(apiKey)) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or missing API key'
      });
      return;
    }

    // Validate tier
    if (!tier || !['basic', 'pro', 'enterprise'].includes(tier)) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid tier. Must be one of: basic, pro, enterprise'
      });
      return;
    }

    // Ensure apiKey is a string and not undefined
    const apiKeyString = Array.isArray(apiKey) ? apiKey[0] : apiKey;
    if (!apiKeyString) {
      throw new Error('API key is required');
    }

    // Log API usage
    await ApiUsageService.logUsage(apiKeyString, 'widget-tier', tier);

    // Get tier-specific widget data (using existing getWidgetAnalytics method)
    const tierData = await ApiUsageService.getWidgetAnalytics(apiKeyString, {
      timeframe: '24h',
      tier: tier
    });

    res.json({
      tier,
      data: tierData,
      metadata: {
        version: '2.0.0',
        endpoint: '/api/v1/widget/tier'
      }
    });
  } catch (error) {
    console.error('Error fetching tier widget data:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve tier widget data'
    });
  }
});

/**
 * @swagger
 * /api/v1/widget/health:
 *   get:
 *     summary: Widget health check endpoint
 *     description: Health check for widget API endpoints and services
 *     responses:
 *       200:
 *         description: Widget services are healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 version:
 *                   type: string
 *                   example: 2.0.0
 *                 endpoints:
 *                   type: object
 *                   properties:
 *                     trustScore:
 *                       type: string
 *                       example: operational
 *                     usageTracking:
 *                       type: string
 *                       example: operational
 *                     analytics:
 *                       type: string
 *                       example: operational
 *                 phase:
 *                   type: string
 *                   example: Phase 2: B2B API Licensing
 *                 kpiMetrics:
 *                   type: object
 *                   properties:
 *                     widgetLoads:
 *                       type: number
 *                     activeWidgets:
 *                       type: number
 *                     errorRate:
 *                       type: number
 */

// Widget health check
router.get('/api/v1/widget/health', async (req: Request, res: Response): Promise<void> => {
  try {
    // Check widget service health
    const widgetHealth = {
      status: 'healthy',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      endpoints: {
        trustScore: 'operational',
        usageTracking: 'operational',
        analytics: 'operational'
      },
      phase: 'Phase 2: B2B API Licensing',
      kpiMetrics: {
        widgetLoads: await ApiUsageService.getTotalWidgetLoads(),
        activeWidgets: await ApiUsageService.getActiveWidgetCount(),
        errorRate: await ApiUsageService.getWidgetErrorRate()
      },
      dependencies: {
        apiGateway: 'operational',
        database: 'operational',
        monitoring: 'operational'
      }
    };

    res.json(widgetHealth);

  } catch (error) {
    console.error('Widget health check error:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: 'Widget health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
