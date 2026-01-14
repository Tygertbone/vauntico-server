import { Router, type Router as ExpressRouter } from "express";
import { communityEngagementService } from "../services/communityEngagementService";
import { apiAuthMiddleware } from "../middleware/auth";
import logger from "../utils/logger";

const router: ExpressRouter = Router();

// Record any community engagement activity
router.post("/engage", apiAuthMiddleware, async (req, res) => {
  try {
    const engagementData = {
      ...req.body,
      userId: req.user?.userId,
    };

    const engagement =
      await communityEngagementService.recordEngagement(engagementData);
    res.status(201).json({
      success: true,
      data: engagement,
      message: "Community engagement recorded successfully",
    });
  } catch (error) {
    logger.error("Error recording community engagement:", error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to record community engagement",
    });
  }
});

// Love Loops routes
router.post("/love-loops", apiAuthMiddleware, async (req, res) => {
  try {
    const loopData = {
      ...req.body,
      creatorId: req.user?.userId,
    };

    const loveLoop = await communityEngagementService.createLoveLoop(loopData);
    res.status(201).json({
      success: true,
      data: loveLoop,
      message: "Love loop created successfully",
    });
  } catch (error) {
    logger.error("Error creating love loop:", error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create love loop",
    });
  }
});

router.post("/love-loops/:id/respond", apiAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { responseMessage } = req.body;
    const responderId = req.user?.userId;

    const loveLoop = await communityEngagementService.respondToLoveLoop(
      id,
      responderId,
      responseMessage,
    );
    res.json({
      success: true,
      data: loveLoop,
      message: "Love loop response recorded successfully",
    });
  } catch (error) {
    logger.error("Error responding to love loop:", error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to respond to love loop",
    });
  }
});

// Legacy Tree routes
router.post("/legacy-tree", apiAuthMiddleware, async (req, res) => {
  try {
    const entryData = {
      ...req.body,
      creatorId: req.user?.userId,
    };

    const legacyEntry =
      await communityEngagementService.addLegacyEntry(entryData);
    res.status(201).json({
      success: true,
      data: legacyEntry,
      message: "Legacy tree entry added successfully",
    });
  } catch (error) {
    logger.error("Error adding legacy tree entry:", error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to add legacy tree entry",
    });
  }
});

// Echo Chamber routes
router.post("/echo-chamber", apiAuthMiddleware, async (req, res) => {
  try {
    const storyData = {
      ...req.body,
      authorId: req.user?.userId,
    };

    const story =
      await communityEngagementService.createEchoChamberStory(storyData);
    res.status(201).json({
      success: true,
      data: story,
      message: "Echo chamber story created successfully",
    });
  } catch (error) {
    logger.error("Error creating echo chamber story:", error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create echo chamber story",
    });
  }
});

router.post(
  "/echo-chamber/:id/publish",
  apiAuthMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;
      const authorId = req.user?.userId;

      const story = await communityEngagementService.publishEchoChamberStory(
        id,
        authorId,
      );
      res.json({
        success: true,
        data: story,
        message: "Echo chamber story published successfully",
      });
    } catch (error) {
      logger.error("Error publishing echo chamber story:", error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to publish echo chamber story",
      });
    }
  },
);

// Leaderboard routes
router.get("/leaderboards", apiAuthMiddleware, async (req, res) => {
  try {
    const { category, period = "monthly", limit = 100 } = req.query;

    const leaderboards = await communityEngagementService.getLeaderboards(
      category as any,
      period as any,
      parseInt(limit as string),
    );

    res.json({
      success: true,
      data: leaderboards,
      count: leaderboards.length,
    });
  } catch (error) {
    logger.error("Error fetching leaderboards:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch leaderboards",
    });
  }
});

router.post("/leaderboards/:id/update", apiAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const entry = await communityEngagementService.updateLeaderboardEntry(
      id,
      updateData,
    );
    res.json({
      success: true,
      data: entry,
      message: "Leaderboard entry updated successfully",
    });
  } catch (error) {
    logger.error("Error updating leaderboard entry:", error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update leaderboard entry",
    });
  }
});

// Get community statistics
router.get("/stats", apiAuthMiddleware, async (req, res) => {
  try {
    const stats = await communityEngagementService.getCommunityStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error("Error fetching community stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch community stats",
    });
  }
});

// Get user's engagement history
router.get("/my-activities", apiAuthMiddleware, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    // This would need a specific method in the service
    const activities = []; // Mock - would fetch user's activities

    res.json({
      success: true,
      data: activities,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        total: activities.length,
      },
    });
  } catch (error) {
    logger.error("Error fetching user activities:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user activities",
    });
  }
});

export default router;
