import { Router, Request, Response } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { apiUsageService } from '../services/apiUsageService';
import { parseQueryParams, extractPaginationParams, QueryParamConfig } from '../utils/queryParams';

const router = Router();

/**
 * Sacred Features API Routes
 * Advanced features requiring special permissions
 */

// Apply authentication to all routes
router.use(authenticate);

/**
 * Get sacred features usage statistics
 * Requires 'sacred_features:read' permission
 */
router.get('/stats', requirePermission('sacred_features:read'), async (req: Request, res: Response) => {
  try {
    const user = req.user as unknown as { id: string; email: string; role: string; permissions: string[] };
    const userId = user.id;
    const stats = apiUsageService.getUserStats(userId);

    res.json({
      success: true,
      data: stats,
      user: {
        id: user.id,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error fetching sacred features stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
});

/**
 * Get sacred features configuration
 * Requires 'sacred_features:admin' permission
 */
router.get('/config', requirePermission('sacred_features:admin'), async (req: Request, res: Response) => {
  try {
    // Query parameter validation
    const queryConfig: QueryParamConfig[] = [
      {
        name: 'includeSecrets',
        type: 'boolean',
        default: false,
        validate: (value) => typeof value === 'boolean'
      },
      {
        name: 'environment',
        type: 'string',
        default: 'production',
        validate: (value) => ['development', 'staging', 'production'].includes(value)
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

    const { includeSecrets, environment } = queryResult.params;

    // Sacred features configuration
    const config = {
      environment,
      features: {
        advancedAnalytics: true,
        realTimeMonitoring: true,
        predictiveScoring: true,
        enterpriseIntegrations: true,
        customReporting: true
      },
      limits: {
        maxRequestsPerMinute: 1000,
        maxConcurrentUsers: 10000,
        maxDataRetentionDays: 365
      },
      permissions: (req.user as unknown as { permissions: string[] }).permissions
    };

    // Include sensitive data only if requested and user has permission
    if (includeSecrets && (req.user as unknown as { permissions: string[] }).permissions.includes('sacred_features:secrets')) {
      config.secrets = {
        apiKeys: ['***masked***'],
        databaseCredentials: '***masked***',
        encryptionKeys: '***masked***'
      };
    }

    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Error fetching sacred features config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch configuration'
    });
  }
});

/**
 * Update sacred features settings
 * Requires 'sacred_features:admin' permission
 */
router.put('/config', requirePermission('sacred_features:admin'), async (req: Request, res: Response) => {
  try {
    const { feature, enabled } = req.body;

    // Validate request body
    if (!feature || typeof enabled !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request body. Required: feature (string), enabled (boolean)'
      });
    }

    const user = req.user as unknown as { id: string };
    // Log the configuration change
    console.log(`Sacred feature ${feature} ${enabled ? 'enabled' : 'disabled'} by user ${user.id}`);

    // In a real implementation, this would update a database
    const updatedConfig = {
      feature,
      enabled,
      updatedBy: user.id,
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: updatedConfig,
      message: `Feature ${feature} ${enabled ? 'enabled' : 'disabled'} successfully`
    });
  } catch (error) {
    console.error('Error updating sacred features config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update configuration'
    });
  }
});

/**
 * Get sacred features audit log
 * Requires 'sacred_features:audit' permission
 */
router.get('/audit', requirePermission('sacred_features:audit'), async (req: Request, res: Response) => {
  try {
    // Extract pagination parameters
    const { page, limit, offset } = extractPaginationParams(req.query);

    const user = req.user as unknown as { id: string };
    // In a real implementation, this would query an audit log database
    const auditEntries = [
      {
        id: '1',
        action: 'feature_enabled',
        feature: 'predictiveScoring',
        userId: user.id,
        timestamp: new Date().toISOString(),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    ];

    // Apply pagination
    const paginatedEntries = auditEntries.slice(offset, offset + limit);

    res.json({
      success: true,
      data: {
        entries: paginatedEntries,
        pagination: {
          page,
          limit,
          total: auditEntries.length,
          hasMore: offset + limit < auditEntries.length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching audit log:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch audit log'
    });
  }
});

/**
 * Execute sacred feature operation
 * Requires 'sacred_features:execute' permission
 */
router.post('/execute', requirePermission('sacred_features:execute'), async (req: Request, res: Response) => {
  try {
    const { operation, parameters } = req.body;

    // Validate request body
    if (!operation) {
      return res.status(400).json({
        success: false,
        error: 'Operation parameter is required'
      });
    }

    const user = req.user as unknown as { id: string };
    // Log the operation execution
    console.log(`Sacred operation ${operation} executed by user ${user.id}`);

    // Record API usage
    apiUsageService.recordUsage({
      userId: user.id,
      endpoint: '/api/sacred-features/execute',
      method: 'POST',
      responseTime: 150, // Mock response time
      statusCode: 200,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Mock operation execution
    const result = {
      operation,
      parameters,
      executedBy: user.id,
      executedAt: new Date().toISOString(),
      status: 'completed',
      result: {
        success: true,
        message: `Operation ${operation} completed successfully`
      }
    };

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error executing sacred operation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute operation'
    });
  }
});

export default router;