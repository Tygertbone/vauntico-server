import { Router, Request, Response } from 'express';
import { authenticateApiKey, validateSubscriptionTier } from '../middleware/auth';
import { TrustScoreService } from '../services/trustScoreService';
import { ApiUsageService } from '../services/apiUsageService';

const router = Router();

/**
 * @swagger
 * /api/v1/trust-score:
 *   get:
 *     summary: Get user's trust score
 *     description: Retrieve the current trust score for a user based on their subscription tier
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
 */

// Get trust score for a user
router.get('/api/v1/trust-score', async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    const apiKey = req.headers['x-api-key'];
    
    // Validate API key
    if (!apiKey || !await authenticateApiKey(apiKey)) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or missing API key'
      });
    }

    // Validate required parameters
    if (!userId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'userId parameter is required'
      });
    }

    // Get user's subscription tier for quota validation
    const userTier = await validateSubscriptionTier(apiKey, userId as string);
    
    // Check API access based on tier
    if (!userTier || !['basic', 'pro', 'enterprise'].includes(userTier)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient subscription tier or invalid user'
      });
    }

    // Log API usage
    await ApiUsageService.logUsage(apiKey, 'trust-score-get', userTier);

    // Get trust score
    const trustScore = await TrustScoreService.getTrustScore(userId as string, userTier);

    if (!trustScore) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found or trust score unavailable'
      });
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
        creditsRemaining: trustScore.creditsRemaining || null,
        nextCalculationCost: trustScore.nextCalculationCost || 0
      },
      metadata: {
        version: '2.0.0',
        endpoint: '/api/v1/trust-score',
        rateLimitRemaining: trustScore.rateLimitRemaining || null
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching trust score:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve trust score'
    });
  }
});

// Trigger trust score recalculation
router.post('/api/v1/trust-score', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const apiKey = req.headers['x-api-key'];
    
    // Validate API key
    if (!apiKey || !await authenticateApiKey(apiKey)) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or missing API key'
      });
    }

    // Validate required parameters
    if (!userId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'userId parameter is required in request body'
      });
    }

    // Get user's subscription tier for quota validation
    const userTier = await validateSubscriptionTier(apiKey, userId);
    
    // Check if user has calculation quota available
    const quotaCheck = await TrustScoreService.checkCalculationQuota(userId as string, userTier);
    if (!quotaCheck.allowed) {
      return res.status(429).json({
        error: 'Too Many Requests',
        message: quotaCheck.message || 'Monthly calculation quota exceeded'
      });
    }

    // Log API usage
    await ApiUsageService.logUsage(apiKey, 'trust-score-calculate', userTier);

    // Initiate trust score calculation
    const calculation = await TrustScoreService.calculateTrustScore(userId as string, userTier);

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
        calculationCost: calculation.cost
      },
      metadata: {
        version: '2.0.0',
        endpoint: '/api/v1/trust-score',
        rateLimitRemaining: quotaCheck.rateLimitRemaining || null,
        webhookUrl: calculation.webhookUrl || null
      }
    };

    res.status(202).json(response);
  } catch (error) {
    console.error('Error initiating trust score calculation:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to initiate trust score calculation'
    });
  }
});

// Get trust score history
router.get('/api/v1/trust-score/:userId/history', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const apiKey = req.headers['x-api-key'];
    const { limit = 10, offset = 0 } = req.query;
    
    // Validate API key and tier
    if (!apiKey || !await authenticateApiKey(apiKey)) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or missing API key'
      });
    }

    const userTier = await validateSubscriptionTier(apiKey, userId);
    if (!userTier || !['pro', 'enterprise'].includes(userTier)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Trust score history requires Pro or Enterprise tier'
      });
    }

    // Log API usage
    await ApiUsageService.logUsage(apiKey, 'trust-score-history', userTier);

    // Get trust score history
    const history = await TrustScoreService.getTrustScoreHistory(
      userId, 
      userTier, 
      parseInt(limit as string), 
      parseInt(offset as string)
    );

    const response = {
      userId,
      history: history.scores,
      pagination: {
        total: history.total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasMore: history.hasMore
      },
      monetization: {
        tier: userTier,
        creditsUsed: history.creditsUsed || 0
      },
      metadata: {
        version: '2.0.0',
        endpoint: `/api/v1/trust-score/${userId}/history`
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching trust score history:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve trust score history'
    });
  }
});

export default router;