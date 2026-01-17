import type { Request, Response } from "express";
import { Router } from "express";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { promClient, register, Counter } from "prom-client";

// Import existing services and middleware
import {
  authenticateApiKey,
  validateSubscriptionTier,
} from "../middleware/auth";
import ApiUsageService from "../services/apiUsageService";
import { createCorrelationId } from "../middleware/correlation";

// Validation schemas
const trustScoreQuerySchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  timeframe: z.enum(["7d", "30d", "90d", "1y"]).optional(),
});

const featuresQuerySchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  userLevel: z.enum(["bronze", "silver", "gold", "platinum"]).optional(),
});

// Response schemas
const trustScoreResponseSchema = z.object({
  score: z.number().min(0).max(100),
  tier: z.enum(["bronze", "silver", "gold", "platinum"]),
  factors: z.object({
    engagement: z.number().min(0).max(100),
    consistency: z.number().min(0).max(100),
    quality: z.number().min(0).max(100),
    community: z.number().min(0).max(100),
  }),
  calculatedAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
  trend: z.enum(["up", "down", "stable"]),
  change: z.number(),
  lastUpdated: z.string().datetime(),
});

const trendResponseSchema = z.object({
  data: z.array(
    z.object({
      date: z.string(),
      score: z.number().min(0).max(100),
      benchmark: z.number().min(0).max(100),
    })
  ),
  timeframe: z.string(),
  metadata: z.object({
    version: z.string(),
    endpoint: z.string(),
    generatedAt: z.string().datetime(),
    count: z.number(),
  }),
});

const featuresResponseSchema = z.object({
  features: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      icon: z.string(),
      status: z.enum(["active", "locked", "coming-soon"]),
      sacredLevel: z.enum(["bronze", "silver", "gold", "platinum"]),
      progress: z.number().min(0).max(100).optional(),
      unlockDate: z.string().datetime().optional(),
      category: z.string().optional(),
      benefits: z.array(z.string()).optional(),
      requirements: z.array(z.string()).optional(),
    })
  ),
  userLevel: z.enum(["bronze", "silver", "gold", "platinum"]),
  unlockedCount: z.number(),
  totalCount: z.number(),
  metadata: z.object({
    version: z.string(),
    endpoint: z.string(),
    generatedAt: z.string().datetime(),
  }),
});

// Error response schema
const errorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
  code: z.string().optional(),
  metadata: z.object({
    version: z.string(),
    timestamp: z.string().datetime(),
    requestId: z.string(),
  }),
});

// Prometheus metrics
const httpRequestDuration = new Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
});

const httpRequestTotal = new Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
});

const activeConnections = new Gauge({
  name: "active_connections",
  help: "Number of active connections",
});

// Mock data generators
const generateTrustScoreData = (userId: string, userTier: string) => {
  const baseScore = 70 + Math.floor(Math.random() * 20);
  const tierBonus = {
    bronze: 0,
    silver: 5,
    gold: 10,
    platinum: 20,
  };
  const score = Math.min(
    100,
    baseScore + tierBonus[userTier as keyof typeof tierBonus]
  );

  const factors = {
    engagement: 60 + Math.floor(Math.random() * 30),
    consistency: 70 + Math.floor(Math.random() * 20),
    quality: 80 + Math.floor(Math.random() * 15),
    community: 50 + Math.floor(Math.random() * 40),
  };

  const trend = score > 75 ? "up" : score > 50 ? "stable" : "down";
  const change = Math.floor(Math.random() * 10) - 5;

  return {
    score,
    tier: userTier,
    factors,
    calculatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    trend,
    change,
  };
};

const generateTrendData = (timeframe: string) => {
  const now = new Date();
  let days = 7;

  switch (timeframe) {
    case "7d":
      days = 7;
      break;
    case "30d":
      days = 30;
      break;
    case "90d":
      days = 90;
      break;
    case "1y":
      days = 365;
      break;
  }

  const data = [];
  let currentScore = 60;
  let currentBenchmark = 65;

  for (let i = days; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    currentScore = Math.min(100, currentScore + (Math.random() - 0.5) * 5);
    currentBenchmark = Math.min(
      100,
      currentBenchmark + (Math.random() - 0.3) * 3
    );

    data.push({
      date: date.toISOString().split("T")[0],
      score: Math.round(currentScore * 10) / 10,
      benchmark: Math.round(currentBenchmark * 10) / 10,
    });
  }

  return data.reverse();
};

const generateFeaturesData = (userLevel: string) => {
  const allFeatures = [
    {
      id: "premium-content",
      name: "Premium Content",
      description:
        "Create exclusive content for your most loyal supporters with advanced monetization options.",
      icon: "📝",
      status: "active",
      sacredLevel: "silver",
      progress: 85,
      category: "content",
      benefits: [
        "Higher revenue per supporter",
        "Exclusive content tools",
        "Advanced analytics",
      ],
      requirements: [
        "Silver tier or higher",
        "Complete onboarding",
        "Verify identity",
      ],
    },
    {
      id: "analytics-pro",
      name: "Analytics Pro",
      description:
        "Advanced insights about your audience, engagement patterns, and revenue optimization.",
      icon: "📊",
      status: "active",
      sacredLevel: "silver",
      category: "analytics",
      benefits: [
        "Detailed audience insights",
        "Revenue optimization",
        "Custom reports",
      ],
      requirements: ["Silver tier or higher", "30 days activity"],
    },
    {
      id: "collaboration-hub",
      name: "Collaboration Hub",
      description:
        "Connect with other creators and collaborate on exclusive content projects.",
      icon: "🤝",
      status: "locked",
      sacredLevel: "gold",
      progress: 45,
      category: "community",
      benefits: [
        "Creator network access",
        "Collaborative projects",
        "Revenue sharing",
      ],
      requirements: [
        "Gold tier or higher",
        "Active community presence",
        "Content quality score >80",
      ],
    },
    {
      id: "ai-assistant",
      name: "AI Assistant",
      description:
        "Get AI-powered suggestions for content creation and audience growth.",
      icon: "🤖",
      status: "coming-soon",
      sacredLevel: "platinum",
      category: "ai",
      benefits: [
        "AI content suggestions",
        "Growth recommendations",
        "Automated scheduling",
      ],
      requirements: ["Platinum tier", "Beta program enrollment"],
    },
    {
      id: "merchandise-store",
      name: "Merchandise Store",
      description: "Open your own merchandise store with zero inventory risk.",
      icon: "🛍️",
      status: "locked",
      sacredLevel: "gold",
      progress: 20,
      category: "commerce",
      benefits: [
        "Zero inventory risk",
        "Custom merch designs",
        "Integrated payments",
      ],
      requirements: [
        "Gold tier or higher",
        "Brand verification",
        "Minimum 1000 supporters",
      ],
    },
    {
      id: "priority-support",
      name: "Priority Support",
      description: "Get 24/7 priority support from our creator success team.",
      icon: "⭐",
      status: "active",
      sacredLevel: "silver",
      category: "support",
      benefits: [
        "24/7 support",
        "Dedicated account manager",
        "Priority response",
      ],
      requirements: ["Silver tier or higher"],
    },
    {
      id: "advanced-insights",
      name: "Advanced Insights",
      description:
        "Deep dive into your creator analytics with predictive modeling.",
      icon: "🔍",
      status: "locked",
      sacredLevel: "gold",
      progress: 60,
      category: "analytics",
      benefits: [
        "Predictive analytics",
        "Trend forecasting",
        "Competitive analysis",
      ],
      requirements: [
        "Gold tier or higher",
        "90 days activity",
        "Minimum 5000 subscribers",
      ],
    },
    {
      id: "community-ambassador",
      name: "Community Ambassador",
      description: "Become a recognized leader in creator community.",
      icon: "👑",
      status: "locked",
      sacredLevel: "platinum",
      category: "recognition",
      benefits: ["Community leadership", "Exclusive events", "Revenue bonuses"],
      requirements: [
        "Platinum tier",
        "Community contribution",
        "Mentorship program",
      ],
    },
  ];

  const levelHierarchy = { bronze: 1, silver: 2, gold: 3, platinum: 4 };
  const userLevelValue =
    levelHierarchy[userLevel as keyof typeof levelHierarchy] || 1;

  return allFeatures.map((feature) => {
    const featureLevelValue =
      levelHierarchy[feature.sacredLevel as keyof typeof levelHierarchy];

    let status: any = feature.status;
    if (userLevelValue >= featureLevelValue && feature.status === "locked") {
      status = "active";
    }

    return {
      ...feature,
      status,
    };
  });
};

// Rate limiting
const dashboardRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
});

const apiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1000, // 1000 requests per minute
  message: "Rate limit exceeded. Please try again later.",
  standardHeaders: true,
});

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  optionsSuccessStatus: 200,
};

// Create router
const router = Router();

// Middleware for metrics collection
router.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = (Date.now() - start) / 1000;

    // Record metrics
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration);

    httpRequestTotal
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .inc();

    next();
  });
});

// Apply rate limiting to dashboard endpoints
router.use("/api/v1/dashboard", dashboardRateLimit);
router.use("/api/v1/trustscore", apiRateLimit);
router.use("/api/v1/trend", apiRateLimit);
router.use("/api/v1/features", apiRateLimit);

/**
 * @swagger
 * /api/v1/dashboard/trustscore:
 *   get:
 *     summary: Get user's trust score and factors
 *     description: Retrieve current trust score for a user based on their subscription tier
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to fetch trust score for
 *     responses:
 *       200:
 *         description: Trust score retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TrustScoreResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing API key
 *       403:
 *         description: Forbidden - Insufficient subscription tier
 *       404:
 *         description: User not found
 *       429:
 *         description: Rate limit exceeded
 *   post:
 *     summary: Trigger trust score recalculation
 *     description: Trigger a recalculation of user's trust score
 *     parameters:
 *       - in: body
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to calculate trust score for
 *     responses:
 *       202:
 *         description: Trust score calculation initiated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TrustScoreCalculationResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing API key
 *       403:
 *         description: Forbidden - Insufficient subscription tier or quota exceeded
 *       404:
 *         description: User not found
 *       429:
 *         description: Rate limit exceeded
 *
 * /api/v1/dashboard/trend:
 *   get:
 *     summary: Get trust score trend data
 *     description: Retrieve historical trust score data for visualization
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to fetch trend data for
 *         name: timeframe
 *         required: false
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 1y]
 *           description: Time period for trend data
 *     responses:
 *       200:
 *         description: Trend data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TrendResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing API key
 *       403:
 *         description: Forbidden - Insufficient subscription tier
 *       404:
 *         description: User not found
 *       429:
 *         description: Rate limit exceeded
 *
 * /api/v1/dashboard/features:
 *   get:
 *     summary: Get sacred features for user
 *     description: Retrieve available sacred features based on user's subscription tier
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to fetch features for
 *         name: userLevel
 *         required: false
 *         schema:
 *           type: string
 *           enum: [bronze, silver, gold, platinum]
 *           description: User's current subscription tier
 *     responses:
 *       200:
 *         description: Features retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FeaturesResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing API key
 *       403:
 *         description: Forbidden - Insufficient subscription tier
 *       404:
 *         description: User not found
 *       429:
 *         description: Rate limit exceeded
 */

// GET /api/v1/dashboard/trustscore
router.get(
  "/api/v1/dashboard/trustscore",
  async (req: Request, res: Response) => {
    try {
      const startTime = Date.now();
      const correlationId = createCorrelationId();

      // Validate query parameters
      const validationResult = trustScoreQuerySchema.safeParse(req.query);
      if (!validationResult.success) {
        const errorResponse = errorResponseSchema.parse({
          error: "Validation failed",
          message: validationResult.error.errors
            .map((e) => e.message)
            .join(", "),
          code: "VALIDATION_ERROR",
          metadata: {
            version: "2.0.0",
            timestamp: new Date().toISOString(),
            requestId: correlationId,
          },
        });

        return res.status(400).json(errorResponse);
      }

      const { userId } = validationResult.data;
      const apiKey = req.headers["x-api-key"];

      // Validate API key
      if (!apiKey || !(await authenticateApiKey(apiKey))) {
        const errorResponse = errorResponseSchema.parse({
          error: "Unauthorized",
          message: "Invalid or missing API key",
          code: "UNAUTHORIZED",
          metadata: {
            version: "2.0.0",
            timestamp: new Date().toISOString(),
            requestId: correlationId,
          },
        });

        return res.status(401).json(errorResponse);
      }

      // Validate user subscription tier
      const userTier = await validateSubscriptionTier(apiKey, userId);
      if (
        !userTier ||
        !["bronze", "silver", "gold", "platinum"].includes(userTier)
      ) {
        const errorResponse = errorResponseSchema.parse({
          error: "Forbidden",
          message: "Insufficient subscription tier",
          code: "INSUFFICIENT_TIER",
          metadata: {
            version: "2.0.0",
            timestamp: new Date().toISOString(),
            requestId: correlationId,
          },
        });

        return res.status(403).json(errorResponse);
      }

      // Log API usage
      await ApiUsageService.logUsage(apiKey, "trust-score-get", userTier);

      // Generate trust score data
      const trustScoreData = generateTrustScoreData(userId, userTier);
      const responseData = trustScoreResponseSchema.parse(trustScoreData);

      // Cache the response (in production, you'd use Redis)
      res.set("Cache-Control", "public, max-age=300"); // 5 minutes cache

      const successResponse = {
        data: responseData,
        metadata: {
          version: "2.0.0",
          endpoint: "/api/v1/dashboard/trustscore",
          generatedAt: new Date().toISOString(),
          requestId: correlationId,
          processingTimeMs: Date.now() - startTime,
        },
      };

      return res.status(200).json(successResponse);
    } catch (error) {
      console.error("Error fetching trust score:", error);

      const errorResponse = errorResponseSchema.parse({
        error: "Internal server error",
        message: "Failed to retrieve trust score",
        code: "INTERNAL_ERROR",
        metadata: {
          version: "2.0.0",
          timestamp: new Date().toISOString(),
          requestId: createCorrelationId(),
        },
      });

      res.status(500).json(errorResponse);
    }
  }
);

// POST /api/v1/dashboard/trustscore
router.post(
  "/api/v1/dashboard/trustscore",
  async (req: Request, res: Response) => {
    try {
      const startTime = Date.now();
      const correlationId = createCorrelationId();

      // Validate request body
      const validationResult = trustScoreQuerySchema.safeParse(req.body);
      if (!validationResult.success) {
        const errorResponse = errorResponseSchema.parse({
          error: "Validation failed",
          message: validationResult.error.errors
            .map((e) => e.message)
            .join(", "),
          code: "VALIDATION_ERROR",
          metadata: {
            version: "2.0.0",
            timestamp: new Date().toISOString(),
            requestId: correlationId,
          },
        });

        return res.status(400).json(errorResponse);
      }

      const { userId } = validationResult.data;
      const apiKey = req.headers["x-api-key"];

      // Validate API key
      if (!apiKey || !(await authenticateApiKey(apiKey))) {
        const errorResponse = errorResponseSchema.parse({
          error: "Unauthorized",
          message: "Invalid or missing API key",
          code: "UNAUTHORIZED",
          metadata: {
            version: "2.0.0",
            timestamp: new Date().toISOString(),
            requestId: correlationId,
          },
        });

        return res.status(401).json(errorResponse);
      }

      // Validate user subscription tier
      const userTier = await validateSubscriptionTier(apiKey, userId);
      if (
        !userTier ||
        !["bronze", "silver", "gold", "platinum"].includes(userTier)
      ) {
        const errorResponse = errorResponseSchema.parse({
          error: "Forbidden",
          message: "Insufficient subscription tier",
          code: "INSUFFICIENT_TIER",
          metadata: {
            version: "2.0.0",
            timestamp: new Date().toISOString(),
            requestId: correlationId,
          },
        });

        return res.status(403).json(errorResponse);
      }

      // Log API usage
      await ApiUsageService.logUsage(apiKey, "trust-score-calculate", userTier);

      // In a real implementation, this would trigger an async calculation
      const calculationId = `calc_${Date.now()}_${userId}`;

      const successResponse = {
        calculationId,
        estimatedTime: 30, // 30 seconds
        status: "processing",
        metadata: {
          version: "2.0.0",
          endpoint: "/api/v1/dashboard/trustscore",
          generatedAt: new Date().toISOString(),
          requestId: correlationId,
          processingTimeMs: Date.now() - startTime,
        },
      };

      return res.status(202).json(successResponse);
    } catch (error) {
      console.error("Error initiating trust score calculation:", error);

      const errorResponse = errorResponseSchema.parse({
        error: "Internal server error",
        message: "Failed to initiate trust score calculation",
        code: "INTERNAL_ERROR",
        metadata: {
          version: "2.0.0",
          timestamp: new Date().toISOString(),
          requestId: createCorrelationId(),
        },
      });

      res.status(500).json(errorResponse);
    }
  }
);

// GET /api/v1/dashboard/trend
router.get("/api/v1/dashboard/trend", async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();
    const correlationId = createCorrelationId();

    // Validate query parameters
    const validationResult = trustScoreQuerySchema.safeParse(req.query);
    if (!validationResult.success) {
      const errorResponse = errorResponseSchema.parse({
        error: "Validation failed",
        message: validationResult.error.errors.map((e) => e.message).join(", "),
        code: "VALIDATION_ERROR",
        metadata: {
          version: "2.0.0",
          timestamp: new Date().toISOString(),
          requestId: correlationId,
        },
      });

      return res.status(400).json(errorResponse);
    }

    const { userId } = validationResult.data;
    const timeframe = (req.query.timeframe as string) || "30d";
    const apiKey = req.headers["x-api-key"];

    // Validate API key
    if (!apiKey || !(await authenticateApiKey(apiKey))) {
      const errorResponse = errorResponseSchema.parse({
        error: "Unauthorized",
        message: "Invalid or missing API key",
        code: "UNAUTHORIZED",
        metadata: {
          version: "2.0.0",
          timestamp: new Date().toISOString(),
          requestId: correlationId,
        },
      });

      return res.status(401).json(errorResponse);
    }

    // Validate user subscription tier
    const userTier = await validateSubscriptionTier(apiKey, userId);
    if (
      !userTier ||
      !["bronze", "silver", "gold", "platinum"].includes(userTier)
    ) {
      const errorResponse = errorResponseSchema.parse({
        error: "Forbidden",
        message: "Insufficient subscription tier",
        code: "INSUFFICIENT_TIER",
        metadata: {
          version: "2.0.0",
          timestamp: new Date().toISOString(),
          requestId: correlationId,
        },
      });

      return res.status(403).json(errorResponse);
    }

    // Log API usage
    await ApiUsageService.logUsage(apiKey, "trend-get", userTier);

    // Generate trend data
    const trendData = generateTrendData(timeframe);
    const responseData = trendResponseSchema.parse({
      data: trendData,
      timeframe,
      metadata: {
        version: "2.0.0",
        endpoint: "/api/v1/dashboard/trend",
        generatedAt: new Date().toISOString(),
        requestId: correlationId,
        processingTimeMs: Date.now() - startTime,
      },
    });

    // Cache the response
    res.set("Cache-Control", "public, max-age=600"); // 10 minutes cache

    return res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching trend data:", error);

    const errorResponse = errorResponseSchema.parse({
      error: "Internal server error",
      message: "Failed to retrieve trend data",
      code: "INTERNAL_ERROR",
      metadata: {
        version: "2.0.0",
        timestamp: new Date().toISOString(),
        requestId: createCorrelationId(),
      },
    });

    res.status(500).json(errorResponse);
  }
});

// GET /api/v1/dashboard/features
router.get(
  "/api/v1/dashboard/features",
  async (req: Request, res: Response) => {
    try {
      const startTime = Date.now();
      const correlationId = createCorrelationId();

      // Validate query parameters
      const validationResult = featuresQuerySchema.safeParse(req.query);
      if (!validationResult.success) {
        const errorResponse = errorResponseSchema.parse({
          error: "Validation failed",
          message: validationResult.error.errors
            .map((e) => e.message)
            .join(", "),
          code: "VALIDATION_ERROR",
          metadata: {
            version: "2.0.0",
            timestamp: new Date().toISOString(),
            requestId: correlationId,
          },
        });

        return res.status(400).json(errorResponse);
      }

      const { userId } = validationResult.data;
      const userLevel = (req.query.userLevel as string) || "silver";
      const apiKey = req.headers["x-api-key"];

      // Validate API key
      if (!apiKey || !(await authenticateApiKey(apiKey))) {
        const errorResponse = errorResponseSchema.parse({
          error: "Unauthorized",
          message: "Invalid or missing API key",
          code: "UNAUTHORIZED",
          metadata: {
            version: "2.0.0",
            timestamp: new Date().toISOString(),
            requestId: correlationId,
          },
        });

        return res.status(401).json(errorResponse);
      }

      // Validate user subscription tier (optional for features endpoint)
      if (
        userLevel &&
        !["bronze", "silver", "gold", "platinum"].includes(userLevel)
      ) {
        const errorResponse = errorResponseSchema.parse({
          error: "Validation failed",
          message: "Invalid user level specified",
          code: "VALIDATION_ERROR",
          metadata: {
            version: "2.0.0",
            timestamp: new Date().toISOString(),
            requestId: correlationId,
          },
        });

        return res.status(400).json(errorResponse);
      }

      // Log API usage
      await ApiUsageService.logUsage(
        apiKey,
        "features-get",
        userLevel || "bronze"
      );

      // Generate features data
      const featuresData = generateFeaturesData(userLevel);
      const unlockedFeatures = featuresData.filter(
        (f) => f.status === "active"
      );
      const responseData = featuresResponseSchema.parse({
        features: featuresData,
        userLevel,
        unlockedCount: unlockedFeatures.length,
        totalCount: featuresData.length,
        metadata: {
          version: "2.0.0",
          endpoint: "/api/v1/dashboard/features",
          generatedAt: new Date().toISOString(),
          requestId: correlationId,
          processingTimeMs: Date.now() - startTime,
        },
      });

      // Cache the response
      res.set("Cache-Control", "public, max-age=900"); // 15 minutes cache

      return res.status(200).json(responseData);
    } catch (error) {
      console.error("Error fetching features:", error);

      const errorResponse = errorResponseSchema.parse({
        error: "Internal server error",
        message: "Failed to retrieve features",
        code: "INTERNAL_ERROR",
        metadata: {
          version: "2.0.0",
          timestamp: new Date().toISOString(),
          requestId: createCorrelationId(),
        },
      });

      res.status(500).json(errorResponse);
    }
  }
);

// Prometheus metrics endpoint
router.get("/metrics", async (req: Request, res: Response) => {
  try {
    const metrics = await register.metrics();

    res.set("Content-Type", register.contentType);
    res.end(metrics);
  } catch (error) {
    console.error("Error generating metrics:", error);
    res.status(500).send("Error generating metrics");
  }
});

export default router;
