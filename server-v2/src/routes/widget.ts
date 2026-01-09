import { Router, Request, Response } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { apiUsageService } from '../services/apiUsageService';
import { parseQueryParams, extractPaginationParams, QueryParamConfig } from '../utils/queryParams';

const router = Router();

/**
 * Widget API Routes
 * Provides embeddable widgets for trust scores and creator analytics
 */

// Apply authentication to all routes
router.use(authenticate);

/**
 * Get trust score widget data
 * Requires 'widgets:read' permission
 */
router.get('/trust-score/:creatorId', requirePermission('widgets:read'), async (req: Request, res: Response) => {
  try {
    const { creatorId } = req.params;

    // Query parameter validation
    const queryConfig: QueryParamConfig[] = [
      {
        name: 'theme',
        type: 'string',
        default: 'light',
        validate: (value) => ['light', 'dark', 'auto'].includes(value)
      },
      {
        name: 'size',
        type: 'string',
        default: 'medium',
        validate: (value) => ['small', 'medium', 'large'].includes(value)
      },
      {
        name: 'showBreakdown',
        type: 'boolean',
        default: true,
        validate: (value) => typeof value === 'boolean'
      }
    ];

    const queryResult = parseQueryParams(req.query, queryConfig);

    if (!queryResult.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
        details: queryResult.errors
      });
    }

    const { theme, size, showBreakdown } = queryResult.params;

    // Record API usage
    apiUsageService.recordUsage({
      userId: (req.user as unknown as { id: string }).id,
      endpoint: '/api/widget/trust-score',
      method: 'GET',
      responseTime: 150,
      statusCode: 200,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Mock trust score data (in real implementation, fetch from database)
    const trustScoreData = {
      creatorId,
      score: 87,
      level: 'Elite',
      lastUpdated: new Date().toISOString(),
      metrics: showBreakdown ? {
        authenticity: 92,
        consistency: 85,
        engagement: 4.2,
        reach: 78,
        growth: 12
      } : undefined,
      theme,
      size
    };

    res.json({
      success: true,
      data: trustScoreData
    });
  } catch (error) {
    console.error('Error fetching trust score widget:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trust score widget'
    });
  }
});

/**
 * Get creator analytics widget data
 * Requires 'widgets:read' permission
 */
router.get('/analytics/:creatorId', requirePermission('widgets:read'), async (req: Request, res: Response) => {
  try {
    const { creatorId } = req.params;

    // Query parameter validation
    const queryConfig: QueryParamConfig[] = [
      {
        name: 'period',
        type: 'string',
        default: '30d',
        validate: (value) => ['7d', '30d', '90d', '1y'].includes(value)
      },
      {
        name: 'metrics',
        type: 'array',
        default: ['followers', 'engagement', 'views'],
        validate: (value) => Array.isArray(value) && value.length > 0
      }
    ];

    const queryResult = parseQueryParams(req.query, queryConfig);

    if (!queryResult.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
        details: queryResult.errors
      });
    }

    const { period, metrics } = queryResult.params;

    // Record API usage
    apiUsageService.recordUsage({
      userId: (req.user as unknown as { id: string }).id,
      endpoint: '/api/widget/analytics',
      method: 'GET',
      responseTime: 200,
      statusCode: 200,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Mock analytics data
    const analyticsData = {
      creatorId,
      period,
      metrics: metrics.reduce((acc: any, metric: string) => {
        acc[metric] = {
          current: Math.floor(Math.random() * 10000) + 1000,
          previous: Math.floor(Math.random() * 10000) + 1000,
          change: (Math.random() - 0.5) * 20, // -10% to +10%
          trend: Math.random() > 0.5 ? 'up' : 'down'
        };
        return acc;
      }, {}),
      lastUpdated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: analyticsData
    });
  } catch (error) {
    console.error('Error fetching analytics widget:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics widget'
    });
  }
});

/**
 * Get engagement widget data
 * Requires 'widgets:read' permission
 */
router.get('/engagement/:creatorId', requirePermission('widgets:read'), async (req: Request, res: Response) => {
  try {
    const { creatorId } = req.params;

    // Extract pagination parameters
    const { page, limit, offset } = extractPaginationParams(req.query);

    // Record API usage
    apiUsageService.recordUsage({
      userId: (req.user as unknown as { id: string }).id,
      endpoint: '/api/widget/engagement',
      method: 'GET',
      responseTime: 180,
      statusCode: 200,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Mock engagement data
    const engagementData = {
      creatorId,
      summary: {
        totalEngagements: 15420,
        uniqueUsers: 3240,
        averageEngagementRate: 4.2,
        topContent: [
          { id: 'post_1', title: 'Content Title 1', engagements: 1250 },
          { id: 'post_2', title: 'Content Title 2', engagements: 980 },
          { id: 'post_3', title: 'Content Title 3', engagements: 875 }
        ]
      },
      recentActivity: Array.from({ length: Math.min(limit, 20) }, (_, i) => ({
        id: `activity_${offset + i + 1}`,
        type: ['like', 'comment', 'share', 'follow'][Math.floor(Math.random() * 4)],
        userId: `user_${Math.floor(Math.random() * 1000)}`,
        contentId: `content_${Math.floor(Math.random() * 100)}`,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      })),
      pagination: {
        page,
        limit,
        total: 200,
        hasMore: offset + limit < 200
      }
    };

    res.json({
      success: true,
      data: engagementData
    });
  } catch (error) {
    console.error('Error fetching engagement widget:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch engagement widget'
    });
  }
});

/**
 * Get widget configuration
 * Requires 'widgets:admin' permission
 */
router.get('/config', requirePermission('widgets:admin'), async (req: Request, res: Response) => {
  try {
    // Record API usage
    apiUsageService.recordUsage({
      userId: (req.user as unknown as { id: string }).id,
      endpoint: '/api/widget/config',
      method: 'GET',
      responseTime: 120,
      statusCode: 200,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    const widgetConfig = {
      availableWidgets: [
        {
          id: 'trust-score',
          name: 'Trust Score Badge',
          description: 'Display creator trust score with visual indicators',
          sizes: ['small', 'medium', 'large'],
          themes: ['light', 'dark', 'auto']
        },
        {
          id: 'analytics',
          name: 'Creator Analytics',
          description: 'Show key performance metrics and trends',
          periods: ['7d', '30d', '90d', '1y'],
          metrics: ['followers', 'engagement', 'views', 'revenue']
        },
        {
          id: 'engagement',
          name: 'Community Engagement',
          description: 'Display recent engagement activity and stats',
          features: ['real-time', 'pagination', 'filtering']
        }
      ],
      defaultSettings: {
        theme: 'auto',
        size: 'medium',
        refreshInterval: 300000, // 5 minutes
        cacheTimeout: 3600000 // 1 hour
      },
      apiLimits: {
        requestsPerMinute: 60,
        requestsPerHour: 1000,
        requestsPerDay: 10000
      }
    };

    res.json({
      success: true,
      data: widgetConfig
    });
  } catch (error) {
    console.error('Error fetching widget config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch widget configuration'
    });
  }
});

/**
 * Update widget settings
 * Requires 'widgets:admin' permission
 */
router.put('/config', requirePermission('widgets:admin'), async (req: Request, res: Response) => {
  try {
    const { widgetId, settings } = req.body;

    // Validate request body
    if (!widgetId || !settings) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request body. Required: widgetId (string), settings (object)'
      });
    }

    // Record API usage
    apiUsageService.recordUsage({
      userId: (req.user as unknown as { id: string }).id,
      endpoint: '/api/widget/config',
      method: 'PUT',
      responseTime: 150,
      statusCode: 200,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Mock configuration update
    const updatedConfig = {
      widgetId,
      settings,
      updatedBy: (req.user as unknown as { id: string }).id,
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: updatedConfig,
      message: `Widget ${widgetId} configuration updated successfully`
    });
  } catch (error) {
    console.error('Error updating widget config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update widget configuration'
    });
  }
});

export default router;