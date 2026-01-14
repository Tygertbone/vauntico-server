import { Router, Request, Response } from "express";
import {
  authenticateApiKey,
  validateSubscriptionTier,
} from "../middleware/auth";
import { TrustScoreService } from "../services/trustScoreService";
import ApiUsageService from "../services/apiUsageService";
import { normalizeQueryParam } from "../utils/queryParams";

// Query parameter helper function
const qp = (param: any): string => {
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
 * /api/v1/trust-score:
 *   get:
 *     summary: Get user's trust score
 *     description: Retrieve current trust score for a user based on their subscription tier
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           description: User ID to fetch trust score for
 *     responses:
 *       200:
 *         description: Trust score retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 score:
 *                   type: number
 *                   description: User's trust score (0-100)
 *                 tier:
 *                   type: string
 *                   description: User's subscription tier (basic, pro, enterprise)
 *                 factors:
 *                   type: object
 *                   description: Score calculation factors
 *       401:
 *         description: Unauthorized - Invalid or missing API key
 *       403:
 *         description: Forbidden - Insufficient subscription tier
 *       404:
 *         description: User not found
 *       429:
 *         description: Rate limit exceeded
 *   post:
 *     summary: Calculate trust score
 *     description: Trigger a recalculation of user's trust score
 *     parameters:
 *       - in: body
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           description: User ID to calculate trust score for
 *     responses:
 *       200:
 *         description: Trust score calculation initiated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 calculationId:
 *                   type: string
 *                   description: Unique ID for tracking calculation progress
 *                 estimatedTime:
 *                   type: number
 *                   description: Estimated time to complete calculation (seconds)
 *       401:
 *         description: Unauthorized - Invalid or missing API key
 *       403:
 *         description: Forbidden - Insufficient subscription tier or quota exceeded
 *       404:
 *         description: User not found
 *       429:
 *         description: Rate limit exceeded

 * /api/v1/trust-lineage:
 *   get:
 *     summary: Get user's trust lineage (Enterprise alias for trust-score)
 *     description: Retrieve current trust lineage for a user based on their subscription tier
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           description: User ID to fetch trust lineage for
 *     responses:
 *       200:
 *         description: Trust lineage retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 score:
 *                   type: number
 *                   description: User's trust score (0-100)
 *                 tier:
 *                   type: string
 *                   description: User's subscription tier (basic, pro, enterprise)
 *                 factors:
 *                   type: object
 *                   description: Score calculation factors
 *       401:
 *         description: Unauthorized - Invalid or missing API key
 *       403:
 *         description: Forbidden - Insufficient subscription tier
 *       404:
 *         description: User not found
 *       429:
 *         description: Rate limit exceeded
 *   post:
 *     summary: Calculate trust lineage
 *     description: Trigger a recalculation of user's trust lineage
 *     parameters:
 *       - in: body
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           description: User ID to calculate trust lineage for
 *     responses:
 *       200:
 *         description: Trust lineage calculation initiated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 calculationId:
 *                   type: string
 *                   description: Unique ID for tracking calculation progress
 *                 estimatedTime:
 *                   type: number
 *                   description: Estimated time to complete calculation (seconds)
 *       401:
 *         description: Unauthorized - Invalid or missing API key
 *       403:
 *         description: Forbidden - Insufficient subscription tier or quota exceeded
 *       404:
 *         description: User not found
 *       429:
 *         description: Rate limit exceeded
 */

// Get trust score for a user
router.get(
  "/api/v1/trust-score",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId: string = qp(req.query.userId);
      const apiKey = req.headers["x-api-key"];

      // Validate API key
      if (!apiKey || !(await authenticateApiKey(apiKey))) {
        res.status(401).json({
          error: "Unauthorized",
          message: "Invalid or missing API key",
        });
        return;
      }

      // Validate required parameters
      if (!userId) {
        res.status(400).json({
          error: "Bad Request",
          message: "userId parameter is required",
        });
        return;
      }

      // Get user's subscription tier for quota validation
      const userTier = await validateSubscriptionTier(apiKey, userId);

      // Check API access based on tier
      if (!userTier || !["basic", "pro", "enterprise"].includes(userTier)) {
        res.status(403).json({
          error: "Forbidden",
          message: "Insufficient subscription tier or invalid user",
        });
        return;
      }

      // Log API usage
      await ApiUsageService.logUsage(
        Array.isArray(apiKey) ? apiKey[0] : apiKey,
        "trust-score-get",
        userTier,
      );

      // Get trust score
      const trustScore = await TrustScoreService.getTrustScore(
        userId,
        userTier,
      );

      if (!trustScore) {
        res.status(404).json({
          error: "Not Found",
          message: "User not found or trust score unavailable",
        });
        return;
      }

      // Add monetization context to response
      const response = {
        score: trustScore.score,
        tier: userTier,
        factors: trustScore.factors,
        calculatedAt: trustScore.calculatedAt,
        expiresAt: trustScore.expiresAt,
        monetization: {
          tier: userTier,
          creditsRemaining: trustScore.creditsRemaining ?? null,
          nextCalculationCost: trustScore.nextCalculationCost ?? 0,
        },
        metadata: {
          version: "2.0.0",
          endpoint: "/api/v1/trust-score",
          rateLimitRemaining: trustScore.rateLimitRemaining ?? null,
        },
      };

      res.json(response);
    } catch (error) {
      console.error("Error fetching trust score:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to retrieve trust score",
      });
    }
  },
);

// Trigger trust score recalculation
router.post("/api/v1/trust-score", async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const apiKey = req.headers["x-api-key"];

    // Validate API key
    if (!apiKey || !(await authenticateApiKey(apiKey))) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid or missing API key",
      });
    }

    // Validate required parameters
    if (!userId) {
      return res.status(400).json({
        error: "Bad Request",
        message: "userId parameter is required in request body",
      });
    }

    // Get user's subscription tier for quota validation
    const userTier = await validateSubscriptionTier(apiKey, userId);

    // Check if user has calculation quota available
    const quotaCheck = await TrustScoreService.checkCalculationQuota(
      userId,
      userTier,
    );
    if (!quotaCheck.allowed) {
      return res.status(429).json({
        error: "Too Many Requests",
        message: quotaCheck.message || "Monthly calculation quota exceeded",
      });
    }

    // Log API usage
    await ApiUsageService.logUsage(
      Array.isArray(apiKey) ? apiKey[0] : apiKey,
      "trust-score-calculate",
      userTier,
    );

    // Initiate trust score calculation
    const calculation = await TrustScoreService.calculateTrustScore(
      userId,
      userTier,
    );

    // Add monetization context to response
    const response = {
      calculationId: calculation.id,
      estimatedTime: calculation.estimatedTime,
      status: calculation.status,
      startedAt: calculation.startedAt,
      monetization: {
        tier: userTier,
        creditsCharged: calculation.cost,
        creditsRemaining: quotaCheck.creditsRemaining,
        calculationCost: calculation.cost,
      },
      metadata: {
        version: "2.0.0",
        endpoint: "/api/v1/trust-score",
        rateLimitRemaining: quotaCheck.rateLimitRemaining ?? null,
        webhookUrl: calculation.webhookUrl ?? null,
      },
    };

    res.status(202).json(response);
  } catch (error) {
    console.error("Error initiating trust score calculation:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to initiate trust score calculation",
    });
  }
});

// Additional endpoint for timeframe-based trust score
router.get(
  "/api/v1/trust-score/timeframe",
  async (req: Request, res: Response) => {
    try {
      const userId: string = qp(req.query.userId);
      const timeframe: string = qp(req.query.timeframe);
      const apiKey = req.headers["x-api-key"];

      // Validate API key
      if (!apiKey || !(await authenticateApiKey(apiKey))) {
        return res.status(401).json({
          error: "Unauthorized",
          message: "Invalid or missing API key",
        });
      }

      // Validate required parameters
      if (!userId) {
        return res.status(400).json({
          error: "Bad Request",
          message: "userId parameter is required",
        });
      }

      // Get user's subscription tier for quota validation
      const userTier = await validateSubscriptionTier(apiKey, userId);

      // Check API access based on tier
      if (!userTier || !["basic", "pro", "enterprise"].includes(userTier)) {
        return res.status(403).json({
          error: "Forbidden",
          message: "Insufficient subscription tier or invalid user",
        });
      }

      // Log API usage
      await ApiUsageService.logUsage(
        Array.isArray(apiKey) ? apiKey[0] : apiKey,
        "trust-score-timeframe",
        userTier,
      );

      // Get trust score for specific timeframe (using existing getTrustScore method)
      const trustScore = await TrustScoreService.getTrustScore(
        userId,
        userTier,
      );

      if (!trustScore) {
        return res.status(404).json({
          error: "Not Found",
          message:
            "User not found or trust score unavailable for specified timeframe",
        });
      }

      res.json({
        score: trustScore.score,
        tier: userTier,
        timeframe: timeframe,
        calculatedAt: trustScore.calculatedAt,
        metadata: {
          version: "2.0.0",
          endpoint: "/api/v1/trust-score/timeframe",
        },
      });
    } catch (error) {
      console.error("Error fetching timeframe trust score:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to retrieve timeframe trust score",
      });
    }
  },
);

// Additional endpoint for tier-based trust score
router.get("/api/v1/trust-score/tier", async (req: Request, res: Response) => {
  try {
    const userId: string = qp(req.query.userId);
    const tier: string = qp(req.query.tier);
    const apiKey = req.headers["x-api-key"];

    // Validate API key
    if (!apiKey || !(await authenticateApiKey(apiKey))) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid or missing API key",
      });
    }

    // Validate required parameters
    if (!userId || !tier) {
      return res.status(400).json({
        error: "Bad Request",
        message: "userId and tier parameters are required",
      });
    }

    // Validate tier
    if (!["basic", "pro", "enterprise"].includes(tier)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid tier. Must be one of: basic, pro, enterprise",
      });
    }

    // Get user's subscription tier for quota validation
    const userTier = await validateSubscriptionTier(apiKey, userId);

    // Check API access based on tier
    if (!userTier || !["basic", "pro", "enterprise"].includes(userTier)) {
      return res.status(403).json({
        error: "Forbidden",
        message: "Insufficient subscription tier or invalid user",
      });
    }

    // Log API usage
    await ApiUsageService.logUsage(
      Array.isArray(apiKey) ? apiKey[0] : apiKey,
      "trust-score-tier",
      userTier,
    );

    // Get trust score for specific tier (using existing getTrustScore method)
    const trustScore = await TrustScoreService.getTrustScore(userId, tier);

    if (!trustScore) {
      return res.status(404).json({
        error: "Not Found",
        message: "User not found or trust score unavailable for specified tier",
      });
    }

    res.json({
      score: trustScore.score,
      tier: tier,
      calculatedAt: trustScore.calculatedAt,
      metadata: {
        version: "2.0.0",
        endpoint: "/api/v1/trust-score/tier",
      },
    });
  } catch (error) {
    console.error("Error fetching tier trust score:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to retrieve tier trust score",
    });
  }
});

// Get trust score history
router.get(
  "/api/v1/trust-score/:userId/history",
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const apiKey = req.headers["x-api-key"];
      const limit = qp(req.query.limit) || "10";
      const offset = qp(req.query.offset) || "0";

      // Validate API key and tier
      if (!apiKey || !(await authenticateApiKey(apiKey))) {
        return res.status(401).json({
          error: "Unauthorized",
          message: "Invalid or missing API key",
        });
      }

      const userTier = await validateSubscriptionTier(apiKey, userId);
      if (!userTier || !["pro", "enterprise"].includes(userTier)) {
        return res.status(403).json({
          error: "Forbidden",
          message: "Trust score history requires Pro or Enterprise tier",
        });
      }

      // Log API usage
      await ApiUsageService.logUsage(
        Array.isArray(apiKey) ? apiKey[0] : apiKey,
        "trust-score-history",
        userTier,
      );

      // Get trust score history
      const history = await TrustScoreService.getTrustScoreHistory(
        userId,
        userTier,
        parseInt(limit),
        parseInt(offset),
      );

      const response = {
        userId,
        history: history.scores,
        pagination: {
          total: history.total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: history.hasMore,
        },
        monetization: {
          tier: userTier,
          creditsUsed: history.creditsUsed || 0,
        },
        metadata: {
          version: "2.0.0",
          endpoint: `/api/v1/trust-score/${userId}/history`,
        },
      };

      res.json(response);
    } catch (error) {
      console.error("Error fetching trust score history:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to retrieve trust score history",
      });
    }
  },
);

// Enterprise alias routes for trust-lineage
router.get(
  "/api/v1/trust-lineage",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId: string = qp(req.query.userId);
      const apiKey = req.headers["x-api-key"];

      // Validate API key
      if (!apiKey || !(await authenticateApiKey(apiKey))) {
        res.status(401).json({
          error: "Unauthorized",
          message: "Invalid or missing API key",
        });
        return;
      }

      // Validate required parameters
      if (!userId) {
        res.status(400).json({
          error: "Bad Request",
          message: "userId parameter is required",
        });
        return;
      }

      // Get user's subscription tier for quota validation
      const userTier = await validateSubscriptionTier(apiKey, userId);

      // Check API access based on tier
      if (!userTier || !["basic", "pro", "enterprise"].includes(userTier)) {
        res.status(403).json({
          error: "Forbidden",
          message: "Insufficient subscription tier or invalid user",
        });
        return;
      }

      // Log API usage with enterprise naming
      await ApiUsageService.logUsage(
        Array.isArray(apiKey) ? apiKey[0] : apiKey,
        "trust-lineage-get",
        userTier,
      );

      // Get trust score (same functionality, different naming)
      const trustScore = await TrustScoreService.getTrustScore(
        userId,
        userTier,
      );

      if (!trustScore) {
        res.status(404).json({
          error: "Not Found",
          message: "User not found or trust lineage unavailable",
        });
        return;
      }

      // Add enterprise naming to response
      const response = {
        score: trustScore.score,
        tier: userTier,
        factors: trustScore.factors,
        calculatedAt: trustScore.calculatedAt,
        expiresAt: trustScore.expiresAt,
        monetization: {
          tier: userTier,
          creditsRemaining: trustScore.creditsRemaining ?? null,
          nextCalculationCost: trustScore.nextCalculationCost ?? 0,
        },
        metadata: {
          version: "2.0.0",
          endpoint: "/api/v1/trust-lineage",
          sacredEquivalent: "/api/v1/trust-score",
          rateLimitRemaining: trustScore.rateLimitRemaining ?? null,
        },
      };

      res.json(response);
    } catch (error) {
      console.error("Error fetching trust lineage:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to retrieve trust lineage",
      });
    }
  },
);

// POST endpoint for trust-lineage
router.post("/api/v1/trust-lineage", async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const apiKey = req.headers["x-api-key"];

    // Validate API key
    if (!apiKey || !(await authenticateApiKey(apiKey))) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid or missing API key",
      });
    }

    // Validate required parameters
    if (!userId) {
      return res.status(400).json({
        error: "Bad Request",
        message: "userId parameter is required in request body",
      });
    }

    // Get user's subscription tier for quota validation
    const userTier = await validateSubscriptionTier(apiKey, userId);

    // Check if user has calculation quota available
    const quotaCheck = await TrustScoreService.checkCalculationQuota(
      userId,
      userTier,
    );
    if (!quotaCheck.allowed) {
      return res.status(429).json({
        error: "Too Many Requests",
        message: quotaCheck.message || "Monthly calculation quota exceeded",
      });
    }

    // Log API usage with enterprise naming
    await ApiUsageService.logUsage(
      Array.isArray(apiKey) ? apiKey[0] : apiKey,
      "trust-lineage-calculate",
      userTier,
    );

    // Initiate trust score calculation (same functionality, different naming)
    const calculation = await TrustScoreService.calculateTrustScore(
      userId,
      userTier,
    );

    // Add enterprise naming to response
    const response = {
      calculationId: calculation.id,
      estimatedTime: calculation.estimatedTime,
      status: calculation.status,
      startedAt: calculation.startedAt,
      monetization: {
        tier: userTier,
        creditsCharged: calculation.cost,
        creditsRemaining: quotaCheck.creditsRemaining,
        calculationCost: calculation.cost,
      },
      metadata: {
        version: "2.0.0",
        endpoint: "/api/v1/trust-lineage",
        sacredEquivalent: "/api/v1/trust-score",
        rateLimitRemaining: quotaCheck.rateLimitRemaining ?? null,
        webhookUrl: calculation.webhookUrl ?? null,
      },
    };

    res.status(202).json(response);
  } catch (error) {
    console.error("Error initiating trust lineage calculation:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to initiate trust lineage calculation",
    });
  }
});

export default router;
