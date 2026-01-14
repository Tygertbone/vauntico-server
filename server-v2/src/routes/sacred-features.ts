import { Router, Request, Response } from "express";
import {
  authenticateApiKey,
  validateSubscriptionTier,
} from "../middleware/auth";
import { communityEngagementService } from "../services/communityEngagementService";
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
 * /api/v1/love-loops:
 *   get:
 *     summary: Get love loops for a user (Sacred alias for credibility-circles)
 *     description: Retrieve love loops and engagement patterns for a specific user
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           description: User ID to fetch love loops for
 *     responses:
 *       200:
 *         description: Love loops retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 loops:
 *                   type: array
 *                   description: Array of love loops
 *                 totalCredits:
 *                   type: number
 *                   description: Total credits earned from love loops
 *       401:
 *         description: Unauthorized - Invalid or missing API key
 *       403:
 *         description: Forbidden - Insufficient subscription tier
 *       404:
 *         description: User not found
 *       429:
 *         description: Rate limit exceeded
 *   post:
 *     summary: Create a love loop
 *     description: Create a new love loop between creator and supporter
 *     parameters:
 *       - in: body
 *         name: loveLoop
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             creatorId:
 *               type: string
 *             supporterId:
 *               type: string
 *             message:
 *               type: string
 *             creditsDonated:
 *               type: number
 *             isPublic:
 *               type: boolean
 *     responses:
 *       201:
 *         description: Love loop created successfully
 *       401:
 *         description: Unauthorized - Invalid or missing API key
 *       403:
 *         description: Forbidden - Insufficient subscription tier
 *       429:
 *         description: Rate limit exceeded
 */

/**
 * @swagger
 * /api/v1/lore-generator:
 *   get:
 *     summary: Get lore generator stories (Sacred alias for narrative-engine)
 *     description: Retrieve AI-generated narratives and stories for a user
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           description: User ID to fetch stories for
 *     responses:
 *       200:
 *         description: Stories retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing API key
 *       403:
 *         description: Forbidden - Insufficient subscription tier
 *       404:
 *         description: User not found
 *       429:
 *         description: Rate limit exceeded
 *   post:
 *     summary: Generate lore story
 *     description: Create a new AI-generated story from trust data
 *     parameters:
 *       - in: body
 *         name: story
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             authorId:
 *               type: string
 *             title:
 *               type: string
 *             content:
 *               type: string
 *             tags:
 *               type: array
 *               items:
 *                 type: string
 *             collaborators:
 *               type: array
 *               items:
 *                 type: string
 *     responses:
 *       201:
 *         description: Story created successfully
 *       401:
 *         description: Unauthorized - Invalid or missing API key
 *       403:
 *         description: Forbidden - Insufficient subscription tier
 *       429:
 *         description: Rate limit exceeded
 */

/**
 * @swagger
 * /api/v1/ubuntu-echo:
 *   get:
 *     summary: Get ubuntu echo stories (Sacred alias for community-resonance)
 *     description: Access collective creator wisdom and community stories
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           description: User ID to fetch community stories for
 *     responses:
 *       200:
 *         description: Community stories retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing API key
 *       403:
 *         description: Forbidden - Insufficient subscription tier
 *       404:
 *         description: User not found
 *       429:
 *         description: Rate limit exceeded
 *   post:
 *     summary: Create ubuntu echo story
 *     description: Share a community story with collective wisdom
 *     parameters:
 *       - in: body
 *         name: story
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             authorId:
 *               type: string
 *             title:
 *               type: string
 *             content:
 *               type: string
 *             tags:
 *               type: array
 *               items:
 *                 type: string
 *             collaborators:
 *               type: array
 *               items:
 *                 type: string
 *     responses:
 *       201:
 *         description: Community story created successfully
 *       401:
 *         description: Unauthorized - Invalid or missing API key
 *       403:
 *         description: Forbidden - Insufficient subscription tier
 *       429:
 *         description: Rate limit exceeded
 */

// Get love loops for a user (Credibility Circles → Love Loops)
router.get(
  "/api/v1/love-loops",
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

      // Log API usage with sacred naming
      await ApiUsageService.logUsage(
        Array.isArray(apiKey) ? apiKey[0] : apiKey,
        "love-loops-get",
        userTier,
      );

      // Get love loops for user
      const loops =
        await communityEngagementService.getLoveLoopsForUser(userId);

      const response = {
        loops: loops,
        totalCredits: loops.reduce(
          (sum, loop) => sum + (loop.creditsDonated || 0),
          0,
        ),
        metadata: {
          version: "2.0.0",
          endpoint: "/api/v1/love-loops",
          enterpriseEquivalent: "/api/v1/credibility-circles",
          count: loops.length,
        },
      };

      res.json(response);
    } catch (error) {
      console.error("Error fetching love loops:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to retrieve love loops",
      });
    }
  },
);

// Create a love loop
router.post("/api/v1/love-loops", async (req: Request, res: Response) => {
  try {
    const { creatorId, supporterId, message, creditsDonated, isPublic } =
      req.body;
    const apiKey = req.headers["x-api-key"];

    // Validate API key
    if (!apiKey || !(await authenticateApiKey(apiKey))) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid or missing API key",
      });
    }

    // Validate required parameters
    if (!creatorId || !supporterId || !message) {
      return res.status(400).json({
        error: "Bad Request",
        message: "creatorId, supporterId, and message are required",
      });
    }

    // Get user's subscription tier for quota validation
    const userTier = await validateSubscriptionTier(apiKey, supporterId);

    // Check API access based on tier
    if (!userTier || !["basic", "pro", "enterprise"].includes(userTier)) {
      return res.status(403).json({
        error: "Forbidden",
        message: "Insufficient subscription tier or invalid user",
      });
    }

    // Log API usage with sacred naming
    await ApiUsageService.logUsage(
      Array.isArray(apiKey) ? apiKey[0] : apiKey,
      "love-loops-create",
      userTier,
    );

    // Create love loop
    const loveLoop = await communityEngagementService.createLoveLoop({
      creatorId,
      supporterId,
      message,
      creditsDonated: creditsDonated || 10,
      isPublic: isPublic || false,
    });

    const response = {
      ...loveLoop,
      metadata: {
        version: "2.0.0",
        endpoint: "/api/v1/love-loops",
        enterpriseEquivalent: "/api/v1/credibility-circles",
      },
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Error creating love loop:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to create love loop",
    });
  }
});

// Get lore generator stories (Narrative Engine → Lore Generator)
router.get(
  "/api/v1/lore-generator",
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

      // Log API usage with sacred naming
      await ApiUsageService.logUsage(
        Array.isArray(apiKey) ? apiKey[0] : apiKey,
        "lore-generator-get",
        userTier,
      );

      // Get echo chamber stories (using existing service)
      const stories =
        await communityEngagementService.getEchoChamberStoriesForUser(userId);

      const response = {
        stories: stories,
        totalCredits: stories.reduce(
          (sum, story) => sum + (story.creditsEarned || 0),
          0,
        ),
        metadata: {
          version: "2.0.0",
          endpoint: "/api/v1/lore-generator",
          enterpriseEquivalent: "/api/v1/narrative-engine",
          count: stories.length,
        },
      };

      res.json(response);
    } catch (error) {
      console.error("Error fetching lore stories:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to retrieve lore stories",
      });
    }
  },
);

// Generate/create lore story
router.post("/api/v1/lore-generator", async (req: Request, res: Response) => {
  try {
    const { authorId, title, content, tags, collaborators } = req.body;
    const apiKey = req.headers["x-api-key"];

    // Validate API key
    if (!apiKey || !(await authenticateApiKey(apiKey))) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid or missing API key",
      });
    }

    // Validate required parameters
    if (!authorId || !title || !content) {
      return res.status(400).json({
        error: "Bad Request",
        message: "authorId, title, and content are required",
      });
    }

    // Get user's subscription tier for quota validation
    const userTier = await validateSubscriptionTier(apiKey, authorId);

    // Check API access based on tier
    if (!userTier || !["basic", "pro", "enterprise"].includes(userTier)) {
      return res.status(403).json({
        error: "Forbidden",
        message: "Insufficient subscription tier or invalid user",
      });
    }

    // Log API usage with sacred naming
    await ApiUsageService.logUsage(
      Array.isArray(apiKey) ? apiKey[0] : apiKey,
      "lore-generator-create",
      userTier,
    );

    // Create echo chamber story (using existing service)
    const story = await communityEngagementService.createEchoChamberStory({
      authorId,
      title,
      content,
      tags: tags || [],
      collaborators: collaborators || [],
      status: "draft",
      likes: 0,
      shares: 0,
      creditsEarned: 0,
      views: 0,
    });

    const response = {
      ...story,
      metadata: {
        version: "2.0.0",
        endpoint: "/api/v1/lore-generator",
        enterpriseEquivalent: "/api/v1/narrative-engine",
      },
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Error creating lore story:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to create lore story",
    });
  }
});

// Get ubuntu echo stories (Community Resonance → Ubuntu Echo)
router.get(
  "/api/v1/ubuntu-echo",
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

      // Log API usage with sacred naming
      await ApiUsageService.logUsage(
        Array.isArray(apiKey) ? apiKey[0] : apiKey,
        "ubuntu-echo-get",
        userTier,
      );

      // Get echo chamber stories (using existing service)
      const stories =
        await communityEngagementService.getEchoChamberStoriesForUser(userId);

      const response = {
        stories: stories,
        totalCredits: stories.reduce(
          (sum, story) => sum + (story.creditsEarned || 0),
          0,
        ),
        metadata: {
          version: "2.0.0",
          endpoint: "/api/v1/ubuntu-echo",
          enterpriseEquivalent: "/api/v1/community-resonance",
          count: stories.length,
        },
      };

      res.json(response);
    } catch (error) {
      console.error("Error fetching ubuntu echo stories:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to retrieve ubuntu echo stories",
      });
    }
  },
);

// Create ubuntu echo story
router.post("/api/v1/ubuntu-echo", async (req: Request, res: Response) => {
  try {
    const { authorId, title, content, tags, collaborators } = req.body;
    const apiKey = req.headers["x-api-key"];

    // Validate API key
    if (!apiKey || !(await authenticateApiKey(apiKey))) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid or missing API key",
      });
    }

    // Validate required parameters
    if (!authorId || !title || !content) {
      return res.status(400).json({
        error: "Bad Request",
        message: "authorId, title, and content are required",
      });
    }

    // Get user's subscription tier for quota validation
    const userTier = await validateSubscriptionTier(apiKey, authorId);

    // Check API access based on tier
    if (!userTier || !["basic", "pro", "enterprise"].includes(userTier)) {
      return res.status(403).json({
        error: "Forbidden",
        message: "Insufficient subscription tier or invalid user",
      });
    }

    // Log API usage with sacred naming
    await ApiUsageService.logUsage(
      Array.isArray(apiKey) ? apiKey[0] : apiKey,
      "ubuntu-echo-create",
      userTier,
    );

    // Create echo chamber story (using existing service)
    const story = await communityEngagementService.createEchoChamberStory({
      authorId,
      title,
      content,
      tags: tags || [],
      collaborators: collaborators || [],
      status: "published", // Ubuntu echo stories are immediately shared
      likes: 0,
      shares: 0,
      creditsEarned: 0,
      views: 0,
    });

    const response = {
      ...story,
      metadata: {
        version: "2.0.0",
        endpoint: "/api/v1/ubuntu-echo",
        enterpriseEquivalent: "/api/v1/community-resonance",
      },
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Error creating ubuntu echo story:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to create ubuntu echo story",
    });
  }
});

// Enterprise alias routes for credibility-circles (Love Loops)
router.get(
  "/api/v1/credibility-circles",
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
        "credibility-circles-get",
        userTier,
      );

      // Get love loops (same functionality, different naming)
      const loops =
        await communityEngagementService.getLoveLoopsForUser(userId);

      const response = {
        circles: loops,
        totalCredits: loops.reduce(
          (sum, loop) => sum + (loop.creditsDonated || 0),
          0,
        ),
        metadata: {
          version: "2.0.0",
          endpoint: "/api/v1/credibility-circles",
          sacredEquivalent: "/api/v1/love-loops",
          count: loops.length,
        },
      };

      res.json(response);
    } catch (error) {
      console.error("Error fetching credibility circles:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to retrieve credibility circles",
      });
    }
  },
);

// Enterprise alias routes for narrative-engine (Lore Generator)
router.get(
  "/api/v1/narrative-engine",
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
        "narrative-engine-get",
        userTier,
      );

      // Get echo chamber stories (same functionality, different naming)
      const stories =
        await communityEngagementService.getEchoChamberStoriesForUser(userId);

      const response = {
        narratives: stories,
        totalCredits: stories.reduce(
          (sum, story) => sum + (story.creditsEarned || 0),
          0,
        ),
        metadata: {
          version: "2.0.0",
          endpoint: "/api/v1/narrative-engine",
          sacredEquivalent: "/api/v1/lore-generator",
          count: stories.length,
        },
      };

      res.json(response);
    } catch (error) {
      console.error("Error fetching narrative engine:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to retrieve narrative engine data",
      });
    }
  },
);

// Enterprise alias routes for community-resonance (Ubuntu Echo)
router.get(
  "/api/v1/community-resonance",
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
        "community-resonance-get",
        userTier,
      );

      // Get echo chamber stories (same functionality, different naming)
      const stories =
        await communityEngagementService.getEchoChamberStoriesForUser(userId);

      const response = {
        resonance: stories,
        totalCredits: stories.reduce(
          (sum, story) => sum + (story.creditsEarned || 0),
          0,
        ),
        metadata: {
          version: "2.0.0",
          endpoint: "/api/v1/community-resonance",
          sacredEquivalent: "/api/v1/ubuntu-echo",
          count: stories.length,
        },
      };

      res.json(response);
    } catch (error) {
      console.error("Error fetching community resonance:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to retrieve community resonance data",
      });
    }
  },
);

export default router;
