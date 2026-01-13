import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { authenticate, requireAdmin } from "../middleware/authenticate";
import { query, transaction } from "../db/pool";
import { logger } from "../utils/logger";
import { sendSlackAlert } from "../utils/slack-alerts";

const router = Router();

// Generate a random verification token
function generateVerificationToken(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// Input validation for verification requests
const verificationRequestValidation = [
  body("platform")
    .isIn(["tiktok", "instagram", "youtube", "twitter", "linkedin"])
    .withMessage("Platform must be a valid social media platform"),
  body("platformUsername")
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage("Platform username is required and must be 1-50 characters"),
  body("userId").isUUID().withMessage("Valid user ID is required"),
  body("proofUrl").isURL().withMessage("Proof URL must be a valid URL"),
  body("bio")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Bio must not exceed 500 characters"),
];

// Pagination validation
const paginationValidation = [
  body("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  body("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  body("category")
    .optional()
    .isIn(["tiktok", "instagram", "youtube", "all"])
    .withMessage("Category must be a valid platform"),
];

// POST /verify/submit - Submit platform verification request
router.post(
  "/submit",
  authenticate,
  verificationRequestValidation,
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation Error",
          message: "Please check your input",
          details: errors.array(),
        });
      }

      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          error: "Unauthorized",
          message: "Authentication required",
        });
      }

      const { platform, platformUsername, proofUrl, bio } = req.body;

      // Check if user already has verification for this platform
      const existingVerification = await query(
        "SELECT id, verification_status, created_at FROM creator_verifications WHERE creator_id = $1 AND platform = $2",
        [userId, platform],
      );

      if (existingVerification.rows.length > 0) {
        return res.status(409).json({
          error: "Conflict",
          message: `You already have a pending or verified ${platform} account`,
          existingStatus: existingVerification.rows[0].verification_status,
        });
      }

      // Create verification request
      const verification = await query(
        `
      INSERT INTO creator_verifications (
        creator_id, platform, platform_username, platform_user_id, verification_token,
        verification_status, verification_data, proof_url, bio, verification_method,
        created_at, expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW() + INTERVAL '30 days')
      RETURNING id, created_at
    `,
        [
          userId,
          platform,
          platformUsername,
          platformUsername,
          generateVerificationToken(),
          "pending",
          null,
          proofUrl,
          bio,
          "api",
        ],
      );

      logger.info("Verification request submitted", {
        userId,
        platform,
        platformUsername,
        verificationId: verification.rows[0].id,
      });

      // Send Slack alert for new verification
      await sendSlackAlert(
        `🔍 New Verification Request: ${platform.toUpperCase()}`,
        {
          type: "verification_submitted",
          userId,
          platform,
          verificationId: verification.rows[0].id,
          platformUsername,
        },
      );

      res.status(201).json({
        message: "Verification request submitted successfully",
        verification: {
          id: verification.rows[0].id,
          platform,
          platformUsername,
          status: "pending",
          expiresAt: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          createdAt: verification.rows[0].created_at,
        },
      });
    } catch (error) {
      const userId = req.user?.userId;
      const { platform } = req.body;
      logger.error("Failed to submit verification request", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId,
        platform,
      });

      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to submit verification request",
      });
    }
  },
);

// GET /verify/status/:id - Check verification status
router.get("/status/:id", authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required",
      });
    }

    // Get verification request
    const result = await query(
      `
      SELECT v.*, u.email as creator_email
      FROM creator_verifications v
      JOIN users u ON v.creator_id = u.id
      WHERE v.id = $1 AND v.creator_id = $2
    `,
      [id, userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Not Found",
        message: "Verification request not found",
      });
    }

    const verification = result.rows[0];

    // Update verification status if needed
    const now = new Date();
    if (
      verification.verification_status === "pending" &&
      verification.expires_at <= now
    ) {
      await query(
        `
        UPDATE creator_verifications 
        SET verification_status = 'expired', updated_at = NOW()
        WHERE id = $1
      `,
        [verification.id],
      );
    }

    res.json({
      message: "Verification status retrieved",
      verification: {
        id: verification.id,
        platform: verification.platform,
        platformUsername: verification.platform_username,
        creatorEmail: verification.creator_email,
        status: verification.verification_status,
        expiresAt: verification.expires_at,
        createdAt: verification.created_at,
        verificationMethod: verification.verification_method,
        proofUrl: verification.proof_url,
        bio: verification.bio,
      },
    });
  } catch (error) {
    const userId = req.user?.userId;
    logger.error("Failed to get verification status", {
      error: error instanceof Error ? error.message : "Unknown error",
      verificationId: req.params.id,
      userId,
    });

    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get verification status",
    });
  }
});

// GET /verify/directory - List verified creators (public or authenticated)
router.get("/directory", async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, category = "all" } = req.query;

    let whereClause = "WHERE v.verification_status = $1";
    const queryParams: any[] = ["verified"];

    const isAuth = req.user?.userId;

    if (category && category !== "all") {
      whereClause += ` AND v.platform = $2`;
      queryParams.push(category);
    }

    // Add pagination
    const page_num = Number(page);
    const limit_num = Number(limit);
    const offset = (page_num - 1) * limit_num;
    const limitClause = `LIMIT $${queryParams.length + 1} OFFSET ${offset}`;
    queryParams.push(limit_num);

    const result = await query(
      `
      SELECT 
        v.id, v.platform, v.platform_username, v.verification_status, v.created_at,
        v.trust_score_impact, v.bio, u.first_name || 'Anonymous', u.email,
        CASE 
          WHEN v.verification_status = 'verified' THEN true
          ELSE false
        END as is_verified
      FROM creator_verifications v
      JOIN users u ON v.creator_id = u.id
      ${whereClause}
      ORDER BY v.verification_status DESC, v.created_at DESC
      ${limitClause}
    `,
      queryParams,
    );

    const verifications = result.rows.map((row) => ({
      id: row.id,
      platform: row.platform,
      platformUsername: row.platform_username,
      status: row.verification_status,
      createdAt: row.created_at,
      trustScoreImpact: row.trust_score_impact,
      isVerified: row.is_verified,
      bio: row.bio,
      creatorName: row.first_name || "Anonymous",
      creatorEmail: row.email,
    }));

    logger.info("Creator directory retrieved", {
      page,
      limit,
      category,
      count: verifications.length,
      isAuthenticated: !!isAuth,
    });

    res.json({
      message: "Creator directory retrieved",
      verifications,
      pagination: {
        page,
        limit,
        total: verifications.length,
        totalPages: Math.ceil(verifications.length / limit_num),
      },
    });
  } catch (error) {
    logger.error("Failed to retrieve creator directory", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to retrieve creator directory",
    });
  }
});

// POST /verify/approve/:id - Admin: Approve verification request
router.post(
  "/approve/:id",
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const adminUserId = req.user?.userId;
      const { id } = req.params;

      if (!adminUserId) {
        return res.status(401).json({
          error: "Unauthorized",
          message: "Admin authentication required",
        });
      }

      // Get verification request
      const result = await query(
        `
      SELECT v.*, u.email as creator_email
      FROM creator_verifications v
      JOIN users u ON v.creator_id = u.id
      WHERE v.id = $1
    `,
        [id],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "Not Found",
          message: "Verification request not found",
        });
      }

      const verification = result.rows[0];

      if (verification.verification_status !== "pending") {
        return res.status(400).json({
          error: "Bad Request",
          message: "Verification request is not in pending status",
        });
      }

      // Calculate trust score impact based on platform
      let trustScoreImpact = 0;
      switch (verification.platform) {
        case "tiktok":
          trustScoreImpact = 5; // Good for entertainment
          break;
        case "instagram":
          trustScoreImpact = 4; // Good for visual content
          break;
        case "youtube":
          trustScoreImpact = 8; // Excellent for video content
          break;
        case "twitter":
          trustScoreImpact = 3; // Good for micro-content
          break;
        case "linkedin":
          trustScoreImpact = 6; // Excellent for professional content
          break;
        default:
          trustScoreImpact = 2; // Decent for general platform
          break;
      }

      // Start transaction for approval
      const updatedVerification = await transaction(async (client) => {
        // Update verification status to verified
        const updatedVerificationResult = await client.query(
          `
        UPDATE creator_verifications 
        SET 
          verification_status = 'verified',
          verified_at = NOW(),
          trust_score_impact = $1,
          updated_at = NOW()
        WHERE id = $2
      `,
          [trustScoreImpact, verification.id],
        );

        // Update user's trust score
        await client.query(
          `
        INSERT INTO trust_scores (
          user_id, overall_score, consistency_score, engagement_score, revenue_score,
          platform_health_score, legacy_score, calculated_at, next_calculation,
          score_trend, previous_score
        ) VALUES (
          $1, -- verification.creator_id
          LEAST((SELECT COALESCE(overall_score, 0) FROM trust_scores WHERE user_id = $1) + $2, 100),
          0, -- consistency_score
          0, -- engagement_score
          0, -- revenue_score
          0, -- platform_health_score
          0, -- legacy_score
          NOW(),
          NOW() + INTERVAL '24 hours',
          'up',
          (SELECT COALESCE(overall_score, 0) FROM trust_scores WHERE user_id = $1)
        )
        ON CONFLICT (user_id) DO UPDATE SET 
          overall_score = EXCLUDED.overall_score,
          score_trend = CASE 
            WHEN EXCLUDED.overall_score > trust_scores.overall_score THEN 'up'
            WHEN EXCLUDED.overall_score < trust_scores.overall_score THEN 'down'
            ELSE 'stable'
          END
      `,
          [verification.creator_id, trustScoreImpact],
        );

        logger.info("Verification approved and trust score updated", {
          adminUserId,
          verificationId: verification.id,
          platform: verification.platform,
          trustScoreImpact,
          creatorId: verification.creator_id,
          previousScore:
            updatedVerificationResult.rows[0]?.trust_score_impact || 0,
        });

        return {
          updatedVerification: updatedVerificationResult.rows[0],
          trustScoreUpdate: updatedVerificationResult.rows[1],
        };
      });

      logger.info("Verification approved successfully", {
        adminUserId,
        verificationId: verification.id,
        platform: verification.platform,
        creatorId: verification.creator_id,
        trustScoreImpact,
      });

      // Send Slack alert for approval
      await sendSlackAlert(
        `✅ Verification Approved: ${verification.platform.toUpperCase()}`,
        {
          type: "verification_approved",
          adminUserId,
          verificationId: verification.id,
          platform: verification.platform,
          platformUsername: verification.platform_username,
          trustScoreImpact,
          creatorId: verification.creator_id,
        },
      );

      res.json({
        message: "Verification approved successfully",
        verification: {
          id: verification.id,
          platform: verification.platform,
          platformUsername: verification.platform_username,
          status: "verified",
          verifiedAt: new Date().toISOString(),
          trustScoreImpact,
          creatorId: verification.creator_id,
        },
      });
    } catch (error) {
      const adminUserId = req.user?.userId;
      logger.error("Failed to approve verification", {
        error: error instanceof Error ? error.message : "Unknown error",
        verificationId: req.params.id,
        adminUserId,
      });

      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to approve verification",
      });
    }
  },
);

export default router;
