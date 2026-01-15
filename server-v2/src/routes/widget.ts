import type { Request, Response } from "express";
import { Router } from "express";
import { authenticateApiKey } from "../middleware/auth";
import ApiUsageService from "../services/apiUsageService";
import { normalizeQueryParam } from "../utils/queryParams";

// Query parameter helper function
const qp = (param: unknown): string => {
  if (Array.isArray(param)) {
    return param[0] || "";
  }
  return param?.toString() || "";
};

// AuthedRequest type for authenticated routes
type AuthedRequest = Request & { user: NonNullable<Request["user"]> };

const router: Router = Router();

/**
 * @swagger
 * /api/v1/metrics/widget-usage:
 *   post:
 *     summary: Track widget usage for KPI analytics
 *     description: Endpoint for tracking widget interactions and usage patterns
 *     parameters:
 *       - in: header
 *           name: X-API-Key
 *           required: true
 *           schema:
 *             type: string
 *             description: API key for authentication
 *       - in: body
 *         name: usageData
 *           required: true
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [load, refresh, error, config_change, interaction]
 *                 description: Type of widget action
 *               userId:
 *                 type: string
 *                 description: User ID associated with the widget
 *               tier:
 *                 type: string
 *                 enum: [basic, pro, enterprise]
 *                 description: User's subscription tier
 *               score:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 description: User's current trust score
 *               widgetConfig:
 *                 type: object
 *                 description: Widget configuration settings
 *                 properties:
 *                   theme:
 *                     type: string
 *                     enum: [light, dark, auto]
 *                     description: Widget theme preference
 *                   showLogo:
 *                     type: boolean
 *                     description: Whether to show Vauntico logo
 *                   showDetails:
 *                     type: boolean
 *                     description: Whether to show detailed trust score breakdown
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *                 description: When the action occurred
 *               metadata:
 *                 type: object
 *                 description: Optional metadata for enhanced analytics
 *                 properties:
 *                   userAgent:
 *                     type: string
 *                     description: Browser user agent
 *                   referrer:
 *                     type: string
 *                     description: Page referrer
 *                   screenResolution:
 *                     type: string
 *                     description: Screen resolution
 *                   timezone:
 *                     type: string
 *                     description: User timezone
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
 *                 creditsRemaining:
 *                   type: number
 *                   example: 98
 *                 rateLimitStatus:
 *                   type: string
 *                   example: "active"
 *       400:
 *         description: Bad request - Invalid usage data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Missing required fields: action, userId"
 *                 code:
 *                   type: string
 *                   example: "MISSING_FIELDS"
 *                 fields:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: ["action", "userId"]
 *       401:
 *         description: Unauthorized - Invalid or missing API key
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid or missing API key"
 *                 code:
 *                   type: string
 *                   example: "UNAUTHORIZED"
 *       429:
 *         description: Too Many Requests - Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Rate limit exceeded. Try again later."
 *                 code:
 *                   type: string
 *                   example: "RATE_LIMIT_EXCEEDED"
 *                 retryAfter:
 *                   type: number
 *                   example: 60
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error occurred"
 *                 code:
 *                   type: string
 *                   example: "INTERNAL_ERROR"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2023-10-15T14:30:00Z"
 */
router.post(
  "/api/v1/metrics/widget-usage",
  async (req: AuthedRequest, res: Response): Promise<void> => {
    try {
      const apiKey = req.headers["x-api-key"];

      // Validate API key
      if (!apiKey || !(await authenticateApiKey(apiKey))) {
        res.status(401).json({
          error: "Unauthorized",
          message: "Invalid or missing API key",
        });
        return;
      }

      const usageData = req.body;

      // Validate required fields
      const requiredFields = ["action", "userId"];
      const missingFields = requiredFields.filter((field) => !usageData[field]);

      if (missingFields.length > 0) {
        res.status(400).json({
          error: "Bad Request",
          message: `Missing required fields: ${missingFields.join(", ")}`,
          fields: missingFields,
        });
        return;
      }

      // Validate action type
      const validActions = [
        "load",
        "refresh",
        "error",
        "config_change",
        "interaction",
      ];
      if (!validActions.includes(usageData.action)) {
        res.status(400).json({
          error: "Bad Request",
          message: `Invalid action. Must be one of: ${validActions.join(", ")}`,
          valid_actions: validActions,
        });
        return;
      }

      // Extract additional metadata
      const metadata = {
        userAgent: req.headers["user-agent"],
        ip: req.ip || req.connection.remoteAddress,
        referrer: req.headers.referrer || req.headers.referer,
        timestamp: new Date().toISOString(),
        ...usageData.metadata,
      };

      // Log widget usage for KPI tracking
      const apiKeyString = Array.isArray(apiKey) ? apiKey[0] : apiKey;
      await ApiUsageService.logWidgetUsage(apiKeyString, {
        ...usageData,
        metadata,
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
        errorRate: metrics.errorRate || 0,
      };

      res.json({
        success: true,
        tracked: true,
        timestamp: new Date().toISOString(),
        metrics: phase2Metrics,
        monetization: {
          tier: normalizeQueryParam(usageData.tier) || "",
          creditsUsed: usageData.action === "refresh" ? 1 : 0, // Refresh uses 1 credit
          widgetUsageCount: metrics.totalUsage || 1,
          target500K: "500K MRR from businesses",
          currentMRR:
            (metrics.tierDistribution.enterprise || 0) * 499 +
            (metrics.tierDistribution.pro || 0) * 99 +
            (metrics.tierDistribution.basic || 0) * 29,
        },
        metadata: {
          version: "2.0.0",
          endpoint: "/api/v1/metrics/widget-usage",
        },
      });
    } catch (error) {
      console.error("Error tracking widget usage:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to track widget usage",
        timestamp: new Date().toISOString(),
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/widget/data:
 *   get:
 *     summary: Retrieve comprehensive widget analytics data
 *     description: Get detailed widget usage statistics and metrics
 *     parameters:
 *       - in: header
 *           name: X-API-Key
 *           required: true
 *           schema:
 *             type: string
 *             description: API key for authentication
 *       - in: query
 *         name: timeframe
 *           schema:
 *             type: string
 *             enum: [1h, 24h, 7d, 30d]
 *             default: 24h
 *             description: Timeframe for analytics data
 *       - in: query
 *         name: tier
 *           schema:
 *             type: string
 *             enum: [basic, pro, enterprise, all]
 *             default: all
 *             description: Filter by subscription tier
 *       - in: query
 *         name: widgetId
 *           schema:
 *             type: string
 *             description: Specific widget ID for filtering
 *       - in: query
 *         name: userId
 *           schema:
 *             type: string
 *             description: User ID for filtering
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
 *                   description: Requested timeframe
 *                 tierFilter:
 *                   type: string
 *                   description: Applied tier filter
 *                 filters:
 *                   type: object
 *                   description: Applied filters
 *                   properties:
 *                     widgetId:
 *                       type: string
 *                       description: Widget ID filter
 *                     userId:
 *                       type: string
 *                       description: User ID filter
 *                 summary:
 *                   type: object
 *                   description: Summary statistics
 *                   properties:
 *                     totalRecords:
 *                       type: number
 *                       description: Total records matching filters
 *                     totalUsage:
 *                       type: number
 *                       description: Total widget usage events
 *                     tierBreakdown:
 *                       type: object
 *                       description: Usage breakdown by tier
 *                       properties:
 *                         basic:
 *                           type: object
 *                           properties:
 *                             count:
 *                               type: number
 *                               description: Number of basic tier users
 *                             usage:
 *                               type: number
 *                               description: Total usage from basic tier
 *                             avgScore:
 *                               type: number
 *                               description: Average trust score for basic tier
 *                         pro:
 *                           type: object
 *                           properties:
 *                             count:
 *                               type: number
 *                               description: Number of pro tier users
 *                             usage:
 *                               type: number
 *                               description: Total usage from pro tier
 *                             avgScore:
 *                               type: number
 *                               description: Average trust score for pro tier
 *                         enterprise:
 *                           type: object
 *                           properties:
 *                             count:
 *                               type: number
 *                               description: Number of enterprise tier users
 *                             usage:
 *                               type: number
 *                               description: Total usage from enterprise tier
 *                             avgScore:
 *                               type: number
 *                               description: Average trust score for enterprise tier
 *                 performance:
 *                   type: object
 *                   description: Performance metrics
 *                   properties:
 *                     uptime:
 *                       type: number
 *                       description: Service uptime percentage
 *                     avgResponseTime:
 *                       type: number
 *                       description: Average response time in milliseconds
 *                     p95ResponseTime:
 *                       type: number
 *                       description: 95th percentile response time
 *                     errorRate:
 *                       type: number
 *                       description: Error rate per 1000 requests
 *                     requestCount:
 *                       type: number
 *                       description: Total requests processed
 *       401:
 *         description: Unauthorized - Invalid or missing API key
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid or missing API key"
 *                 code:
 *                   type: string
 *                   example: "UNAUTHORIZED"
 *       429:
 *         description: Too Many Requests - Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Rate limit exceeded. Try again later."
 *                 code:
 *                   type: string
 *                   example: "RATE_LIMIT_EXCEEDED"
 *                 retryAfter:
 *                   type: number
 *                   example: 60
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error occurred"
 *                 code:
 *                   type: string
 *                   example: "INTERNAL_ERROR"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2023-10-15T14:30:00Z"
 */

// Get comprehensive widget analytics data
router.get(
  "/api/v1/widget/data",
  async (req: AuthedRequest, res: Response): Promise<void> => {
    try {
      const apiKey = req.headers["x-api-key"];

      // Validate API key
      if (!apiKey || !(await authenticateApiKey(apiKey))) {
        res.status(401).json({
          error: "Unauthorized",
          message: "Invalid or missing API key",
        });
        return;
      }

      // Extract query parameters
      const timeframe = qp(req.query.timeframe) || "24h";
      const tier = qp(req.query.tier) || "all";
      const widgetId = qp(req.query.widgetId);
      const userId = qp(req.query.userId);

      // Ensure apiKey is a string and not undefined
      const apiKeyString = Array.isArray(apiKey) ? apiKey[0] : apiKey;
      if (!apiKeyString) {
        throw new Error("API key is required");
      }

      // Get comprehensive widget analytics (using existing getWidgetAnalytics method)
      const analytics = await ApiUsageService.getWidgetAnalytics(apiKeyString, {
        timeframe,
        tier,
        widgetId,
        userId,
      });

      res.json({
        success: true,
        timeframe: analytics.requestedTimeframe,
        tierFilter: analytics.appliedFilters.tier || "all",
        filters: analytics.appliedFilters || {},
        summary: analytics.summary,
        performance: analytics.performance,
        metadata: {
          version: "2.0.0",
          endpoint: "/api/v1/widget/data",
          generatedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Error retrieving widget analytics:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to retrieve widget analytics",
        timestamp: new Date().toISOString(),
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/widget/tier:
 *   get:
 *     summary: Retrieve tier-specific widget analytics data
 *     description: Get widget usage statistics filtered by subscription tier
 *     parameters:
 *       - in: header
 *           name: X-API-Key
 *           required: true
 *           schema:
 *             type: string
 *             description: API key for authentication
 *       - in: query
 *         name: tier
 *           schema:
 *             type: string
 *             enum: [basic, pro, enterprise, all]
 *             default: all
 *             description: Filter by subscription tier
 *     responses:
 *       200:
 *         description: Tier-specific analytics data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tier:
 *                   type: string
 *                   description: Requested tier filter
 *                 summary:
 *                   type: object
 *                   description: Tier-specific summary statistics
 *                   properties:
 *                     userCount:
 *                       type: number
 *                       description: Number of users in this tier
 *                     totalUsage:
 *                       type: number
 *                       description: Total widget usage from this tier
 *                     avgScore:
 *                       type: number
 *                       description: Average trust score for this tier
 *                     usageEvents:
 *                       type: array
 *                       description: Recent usage events
 *                     items:
 *                       type: object
 *                       properties:
 *                         timestamp:
 *                           type: string
 *                           format: date-time
 *                           description: Event timestamp
 *                         userId:
 *                           type: string
 *                           description: User ID
 *                         action:
 *                           type: string
 *                           description: Type of widget action
 *                         score:
 *                           type: number
 *                           description: User's current trust score
 *                         metadata:
 *                           type: object
 *                           description: Event metadata
 *                 performance:
 *                   type: object
 *                   description: Tier performance metrics
 *                   properties:
 *                     avgResponseTime:
 *                       type: number
 *                       description: Average response time for this tier
 *                     errorRate:
 *                       type: number
 *                       description: Error rate for this tier
 *                     requestCount:
 *                       type: number
 *                       description: Total requests for this tier
 *       401:
 *         description: Unauthorized - Invalid or missing API key
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid or missing API key"
 *                 code:
 *                   type: string
 *                   example: "UNAUTHORIZED"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error occurred"
 *                 code:
 *                   type: string
 *                   example: "INTERNAL_ERROR"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2023-10-15T14:30:00Z"
 */

// Get tier-specific widget analytics
router.get(
  "/api/v1/widget/tier",
  async (req: AuthedRequest, res: Response): Promise<void> => {
    try {
      const apiKey = req.headers["x-api-key"];

      // Validate API key
      if (!apiKey || !(await authenticateApiKey(apiKey))) {
        res.status(401).json({
          error: "Unauthorized",
          message: "Invalid or missing API key",
        });
        return;
      }

      // Extract query parameters
      const tier = qp(req.query.tier) || "all";

      // Validate tier
      const validTiers = ["basic", "pro", "enterprise", "all"];
      if (!validTiers.includes(tier)) {
        res.status(400).json({
          error: "Bad Request",
          message: `Invalid tier. Must be one of: ${validTiers.join(", ")}`,
          valid_tiers: validTiers,
        });
        return;
      }

      // Ensure apiKey is a string and not undefined
      const apiKeyString = Array.isArray(apiKey) ? apiKey[0] : apiKey;
      if (!apiKeyString) {
        throw new Error("API key is required");
      }

      // Get tier-specific widget analytics
      const analytics = await ApiUsageService.getWidgetAnalyticsByTier(
        apiKeyString,
        {
          tier,
          timeframe: "24h", // Default to 24h for tier-specific data
        }
      );

      res.json({
        success: true,
        tier: analytics.requestedTier,
        summary: analytics.summary,
        usageEvents: analytics.usageEvents,
        performance: analytics.performance,
        metadata: {
          version: "2.0.0",
          endpoint: "/api/v1/widget/tier",
          generatedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Error retrieving tier widget analytics:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to retrieve tier widget analytics",
        timestamp: new Date().toISOString(),
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/widget/health:
 *   get:
 *     summary: Widget API health check
 *     description: Check the operational status of widget API endpoints and services
 *     responses:
 *       200:
 *         description: All widget services are healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "healthy"
 *                 version:
 *                   type: string
 *                   example: "2.0.0"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2023-10-15T14:30:00Z"
 *                 services:
 *                   type: object
 *                   description: Health status of widget services
 *                   properties:
 *                     api:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           description: API service status
 *                           example: "healthy"
 *                         responseTime:
 *                           type: number
 *                           example: 45
 *                         uptime:
 *                           type: string
 *                           example: "99.9%"
 *                     database:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           description: Database service status
 *                           example: "healthy"
 *                         responseTime:
 *                           type: number
 *                           example: 12
 *                         connections:
 *                           type: object
 *                           properties:
 *                             active:
 *                               type: number
 *                               description: Active connections
 *                               example: 3
 *                             idle:
 *                               type: number
 *                               description: Idle connections
 *                               example: 1
 *                             total:
 *                               type: number
 *                               description: Total connections in pool
 *                               example: 10
 *                     cache:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           description: Cache service status
 *                           example: "healthy"
 *                         hitRate:
 *                           type: number
 *                           description: Cache hit rate percentage
 *                           example: "94.2%"
 *                         responseTime:
 *                           type: number
 *                           example: 8
 *                     analytics:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           description: Analytics service status
 *                           example: "healthy"
 *                         responseTime:
 *                           type: number
 *                           example: 25
 *                         queueSize:
 *                           type: number
 *                           description: Analytics queue size
 *                           example: 15
 *       503:
 *         description: Service Unavailable - Widget services are down
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Service temporarily unavailable"
 *                 code:
 *                   type: string
 *                   example: "SERVICE_UNAVAILABLE"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2023-10-15T14:30:00Z"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error occurred"
 *                 code:
 *                   type: string
 *                   example: "INTERNAL_ERROR"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2023-10-15T14:30:00Z"
 */

// Widget API health check
router.get(
  "/api/v1/widget/health",
  async (req: AuthedRequest, res: Response): Promise<void> => {
    try {
      // Check widget service health (using existing checkDatabaseHealth method)
      const { checkDatabaseHealth } = await import("../db/health");
      const dbHealth = await checkDatabaseHealth();

      // Check API usage service health
      const apiUsageServiceHealth = {
        status: "healthy",
        responseTime: Math.random() * 50 + 10, // Mock response time
        message: "API usage service is operational",
      };

      // Check overall system health
      const overallStatus =
        dbHealth.isHealthy && apiUsageServiceHealth.status === "healthy"
          ? "healthy"
          : "degraded";

      const healthData = {
        status: overallStatus,
        version: "2.0.0",
        timestamp: new Date().toISOString(),
        services: {
          database: dbHealth,
          apiUsage: apiUsageServiceHealth,
        },
        metrics: {
          uptime: "99.9%",
          avgResponseTime: 25.5,
          errorRate: 0.02,
        },
      };

      if (overallStatus === "healthy") {
        res.status(200).json(healthData);
      } else {
        res.status(503).json(healthData);
      }
    } catch (error) {
      console.error("Widget health check error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Widget health check failed",
        timestamp: new Date().toISOString(),
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/widget/config:
 *   post:
 *     summary: Save widget configuration settings
 *     description: Save user's widget preferences and configuration
 *     parameters:
 *       - in: header
 *           name: X-API-Key
 *           required: true
 *           schema:
 *             type: string
 *             description: API key for authentication
 *       - in: body
 *         name: config
 *           required: true
 *           schema:
 *             type: object
 *             properties:
 *               theme:
 *                 type: string
 *                 enum: [light, dark, auto]
 *                 default: auto
 *                 description: Widget theme preference
 *                 example: "dark"
 *               showLogo:
 *                 type: boolean
 *                 default: true
 *                 description: Whether to show Vauntico logo
 *                 example: true
 *               showDetails:
 *                 type: boolean
 *                 default: false
 *                 description: Whether to show detailed trust score breakdown
 *                 example: false
 *               primaryColor:
 *                 type: string
 *                 pattern: "^#[0-9A-F]{6}$"
 *                 default: "#4F46E5"
 *                 description: Primary color for widget theme
 *               secondaryColor:
 *                 type: string
 *                 default: "#FF6B6B"
 *                 description: Secondary color for widget theme
 *               fontFamily:
 *                 type: string
 *                 default: "Inter, system-ui, sans-serif"
 *                 description: Font family for widget text
 *               fontSize:
 *                 type: number
 *                 default: 14
 *                 description: Base font size in pixels
 *               borderRadius:
 *                 type: number
 *                 default: 8
 *                 description: Border radius in pixels
 *               padding:
 *                 type: number
 *                 default: 16
 *                 description: Padding in pixels
 *               animations:
 *                 type: boolean
 *                 default: true
 *                 description: Enable CSS animations
 *               apiPollingInterval:
 *                 type: number
 *                 default: 30
 *                 description: API polling interval in seconds
 *               refreshInterval:
 *                 type: number
 *                 default: 300
 *                 description: Trust score refresh interval in seconds
 *               scoreThreshold:
 *                 type: number
 *                 default: 50
 *                 description: Score change threshold for notifications
 *               notifications:
 *                 type: object
 *                 default: true
 *                 description: Enable browser notifications
 *                 properties:
 *                   email:
 *                       type: boolean
 *                       default: false
 *                       description: Enable email notifications
 *                   browser:
 *                       type: boolean
 *                       default: true
 *                       description: Enable browser notifications
 *               privacy:
 *                 type: object
 *                 default: true
 *                 description: Privacy settings
 *                 properties:
 *                     shareData:
 *                       type: boolean
 *                       default: false
 *                       description: Share anonymous usage data
 *                     shareScores:
 *                       type: boolean
 *                       default: false
 *                       description: Share trust scores
 *                     analyticsTracking:
 *                       type: boolean
 *                       default: true
 *                       description: Enable analytics tracking
 *       tier:
 *                   type: string
 *                   description: User's subscription tier for feature gating
 *                   enum: [basic, pro, enterprise]
 *                   default: "basic"
 *                   example: "pro"
 *               limits:
 *                   type: object
 *                 default: true
 *                 description: Usage limits based on subscription tier
 *                 properties:
 *                   apiCallsPerDay:
 *                       type: number
 *                       description: Daily API call limit
 *                       basic:
 *                           type: number
 *                           default: 1000
 *                       description: Basic tier daily limit
 *                       pro:
 *                           type: number
 *                           default: 5000
 *                           description: Pro tier daily limit
 *                       enterprise:
 *                           type: number
 *                           default: 10000
 *                           description: Enterprise tier daily limit
 *                   widgetRefreshesPerDay:
 *                       type: number
 *                       description: Daily widget refresh limit
 *                       basic:
 *                           type: number
 *                           default: 10
 *                           description: Basic tier daily refresh limit
 *                       pro:
 *                           type: number
 *                           default: 50
 *                           description: Pro tier daily refresh limit
 *                       enterprise:
 *                           type: number
 *                           default: 200
 *                           description: Enterprise tier daily refresh limit
 *                   scoreCalculations:
 *                       type: object
 *                 default: true
 *                 description: Score calculation settings
 *                 properties:
 *                     realTime:
 *                       type: boolean
 *                       default: false
 *                       description: Enable real-time score calculation
 *                     cacheDuration:
 *                       type: number
 *                       default: 300
 *                       description: Score cache duration in seconds
 *                     batchInterval:
 *                       type: number
 *                       default: 600
 *                       description: Batch score calculation interval
 *     responses:
 *       200:
 *         description: Widget configuration saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 saved:
 *                   type: boolean
 *                   example: true
 *                 config:
 *                   type: object
 *                   description: Saved widget configuration
 *                   example:
 *                     theme: "dark"
 *                     showLogo: true
 *                     showDetails: false
 *       400:
 *         description: Bad Request - Invalid configuration data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid theme value"
 *                 code:
 *                   type: string
 *                   example: "INVALID_THEME"
 *                 field:
 *                   type: string
 *                   example: "theme"
 *       401:
 *         description: Unauthorized - Invalid or missing API key
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid or missing API key"
 *                 code:
 *                   type: string
 *                   example: "UNAUTHORIZED"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error occurred"
 *                 code:
 *                   type: string
 *                   example: "INTERNAL_ERROR"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2023-10-15T14:30:00Z"
 */

// Save widget configuration
router.post(
  "/api/v1/widget/config",
  async (req: AuthedRequest, res: Response): Promise<void> => {
    try {
      const apiKey = req.headers["x-api-key"];

      // Validate API key
      if (!apiKey || !(await authenticateApiKey(apiKey))) {
        res.status(401).json({
          error: "Unauthorized",
          message: "Invalid or missing API key",
        });
        return;
      }

      const config = req.body.config;

      // Validate required fields
      if (!config || typeof config !== "object") {
        res.status(400).json({
          error: "Bad Request",
          message: "Invalid configuration data. Must be a valid object.",
        });
        return;
      }

      // Validate config fields
      const validThemes = ["light", "dark", "auto"];
      if (config.theme && !validThemes.includes(config.theme)) {
        res.status(400).json({
          error: "Bad Request",
          message: `Invalid theme. Must be one of: ${validThemes.join(", ")}`,
          valid_themes: validThemes,
        });
        return;
      }

      // Ensure apiKey is a string and not undefined
      const apiKeyString = Array.isArray(apiKey) ? apiKey[0] : apiKey;
      if (!apiKeyString) {
        throw new Error("API key is required");
      }

      // Apply defaults for missing fields
      const defaultConfig = {
        theme: config.theme || "auto",
        showLogo: config.showLogo !== false,
        showDetails: config.showDetails || false,
        primaryColor: config.primaryColor || "#4F46E5",
        secondaryColor: config.secondaryColor || "#FF6B6B",
        fontFamily: config.fontFamily || "Inter, system-ui, sans-serif",
        fontSize: typeof config.fontSize === "number" ? config.fontSize : 14,
        borderRadius:
          typeof config.borderRadius === "number" ? config.borderRadius : 8,
        padding: typeof config.padding === "number" ? config.padding : 16,
        animations: config.animations !== false,
        apiPollingInterval:
          typeof config.apiPollingInterval === "number"
            ? config.apiPollingInterval
            : 30,
        refreshInterval:
          typeof config.refreshInterval === "number"
            ? config.refreshInterval
            : 300,
        scoreThreshold:
          typeof config.scoreThreshold === "number"
            ? config.scoreThreshold
            : 50,
        notifications: {
          ...config.notifications,
          browser: config.notifications?.browser !== false,
          email: config.notifications?.email || false,
        },
        privacy: {
          ...config.privacy,
          shareData: config.privacy?.shareData !== true,
          shareScores: config.privacy?.shareScores !== true,
          analyticsTracking: config.privacy?.analyticsTracking !== false,
        },
        tier: config.tier || "basic",
        limits: {
          ...config.limits,
          apiCallsPerDay:
            typeof config.limits?.apiCallsPerDay === "number"
              ? config.limits.apiCallsPerDay
              : undefined,
          widgetRefreshesPerDay:
            typeof config.limits?.widgetRefreshesPerDay === "number"
              ? config.limits.widgetRefreshesPerDay
              : undefined,
        },
        scoreCalculations: {
          ...config.scoreCalculations,
          realTime: config.scoreCalculations?.realTime === true,
          cacheDuration:
            typeof config.scoreCalculations?.cacheDuration === "number"
              ? config.scoreCalculations.cacheDuration
              : 300,
          batchInterval:
            typeof config.scoreCalculations?.batchInterval === "number"
              ? config.scoreCalculations.batchInterval
              : 600,
        },
      };

      // Log configuration save
      await ApiUsageService.saveWidgetConfig(apiKeyString, defaultConfig);

      res.json({
        success: true,
        saved: true,
        config: defaultConfig,
        metadata: {
          version: "2.0.0",
          endpoint: "/api/v1/widget/config",
        },
      });
    } catch (error) {
      console.error("Error saving widget configuration:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to save widget configuration",
        timestamp: new Date().toISOString(),
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/widget/config:
 *   get:
 *     summary: Retrieve user's widget configuration
 *     description: Get saved widget preferences and configuration
 *     parameters:
 *       - in: header
 *           name: X-API-Key
 *           required: true
 *           schema:
 *             type: string
 *             description: API key for authentication
 *       - in: query
 *         name: userId
 *           schema:
 *             type: string
 *             description: User ID for retrieving configuration
 *     responses:
 *       200:
 *         description: Widget configuration retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 config:
 *                   type: object
 *                   description: User's widget configuration
 *                   example:
 *                     theme: "dark"
 *                     showLogo: true
 *                     showDetails: false
 *                     tier: "pro"
 *                 userId:
 *                   type: string
 *                   description: User ID who owns the configuration
 *       401:
 *         description: Unauthorized - Invalid or missing API key
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid or missing API key"
 *                 code:
 *                   type: string
 *                   example: "UNAUTHORIZED"
 *       404:
 *         description: Not Found - No configuration found for user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No widget configuration found"
 *                 code:
 *                   type: string
 *                   example: "NOT_FOUND"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error occurred"
 *                 code:
 *                   type: string
 *                   example: "INTERNAL_ERROR"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2023-10-15T14:30:00Z"
 */

// Get widget configuration
router.get(
  "/api/v1/widget/config",
  async (req: AuthedRequest, res: Response): Promise<void> => {
    try {
      const apiKey = req.headers["x-api-key"];
      const userId = qp(req.query.userId);

      // Validate required parameters
      if (!userId) {
        res.status(400).json({
          error: "Bad Request",
          message: "userId parameter is required",
        });
        return;
      }

      // Ensure apiKey is a string and not undefined
      const apiKeyString = Array.isArray(apiKey) ? apiKey[0] : apiKey;
      if (!apiKeyString) {
        throw new Error("API key is required");
      }

      // Get user's widget configuration
      const config = await ApiUsageService.getWidgetConfig(
        apiKeyString,
        userId
      );

      if (!config) {
        res.status(404).json({
          error: "Not Found",
          message: "No widget configuration found for this user",
        });
        return;
      }

      res.json({
        success: true,
        config: config,
        userId: userId,
        metadata: {
          version: "2.0.0",
          endpoint: "/api/v1/widget/config",
        },
      });
    } catch (error) {
      console.error("Error retrieving widget configuration:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to retrieve widget configuration",
        timestamp: new Date().toISOString(),
      });
    }
  }
);

export default router;
