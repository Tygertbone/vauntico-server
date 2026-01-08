import { Router, Request, Response } from 'express';
import { pool } from '../db/pool';
import { logger } from '../utils/logger';
import { authenticate } from '../middleware/authenticate';
import { subscriptionManager } from '../utils/subscriptions';
import { fraudDetectionService } from '../services/fraudDetectionService';
import Stripe from 'stripe';

const router = Router();

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

// Create checkout session for subscription
router.post('/checkout', authenticate, fraudDetectionService.createPaymentFraudMiddleware(), async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { tier, trialDays = 14 } = req.body;

    if (!tier || !['creator_pass', 'enterprise'].includes(tier)) {
      return res.status(400).json({ error: 'Invalid tier specified' });
    }

    // Get or create Stripe customer
    let customerId: string;

    const existingSub = await subscriptionManager.getSubscription(userId);
    if (existingSub?.stripeCustomerId) {
      customerId = existingSub.stripeCustomerId;
    } else {
      // Create new Stripe customer
      const userResult = await pool.query('SELECT email FROM users WHERE id = $1', [userId]);
      const userEmail = userResult.rows[0]?.email;

      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { userId },
      });
      customerId = customer.id;
    }

    // Price IDs from environment variables
    const priceIds: Record<string, string> = {
      creator_pass: process.env.STRIPE_CREATOR_PASS_PRICE_ID!,
      enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
    };

    const priceId = priceIds[tier];
    if (!priceId) {
      return res.status(400).json({ error: 'Price not configured for tier' });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      subscription_data: {
        trial_period_days: trialDays,
        metadata: { userId },
      },
      success_url: `${process.env.FRONTEND_URL}/pricing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing?canceled=true`,
      metadata: { userId },
    });

    logger.info('Checkout session created', { userId, sessionId: session.id, tier });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    logger.error('Failed to create checkout session', {
      userId: req.user?.userId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Get user's subscription status
router.get('/status', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const subscription = await subscriptionManager.getSubscription(userId);

    if (!subscription) {
      // Check if user has premium access through the function
      const hasPremium = await subscriptionManager.hasPremiumAccess(userId);
      return res.json({
        tier: 'free',
        status: 'active',
        hasPremium,
        limits: {
          vaults: 3,
          aiGenerations: 50,
          storageGb: 1,
          teamMembers: 1,
        },
      });
    }

    const limits = {
      creator_pass: {
        vaults: -1, // unlimited
        aiGenerations: -1,
        storageGb: 100,
        teamMembers: 10,
      },
      enterprise: {
        vaults: -1,
        aiGenerations: -1,
        storageGb: -1, // unlimited
        teamMembers: -1, // unlimited
      },
      free: {
        vaults: 3,
        aiGenerations: 50,
        storageGb: 1,
        teamMembers: 1,
      },
    };

    res.json({
      tier: subscription.tier,
      status: subscription.status,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      limits: limits[subscription.tier as keyof typeof limits] || limits.free,
    });
  } catch (error) {
    logger.error('Failed to get subscription status', {
      userId: req.user?.userId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    res.status(500).json({ error: 'Failed to get subscription status' });
  }
});

// Cancel subscription
router.post('/cancel', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const subscription = await subscriptionManager.getSubscription(userId);
    if (!subscription?.stripeSubscriptionId) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    // Update subscription to cancel at period end
    await pool.query(`
      UPDATE subscriptions
      SET cancel_at_period_end = true, updated_at = NOW()
      WHERE user_id = $1
    `, [userId]);

    // Also cancel in Stripe to be safe
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    logger.info('Subscription cancel requested', { userId, subscriptionId: subscription.stripeSubscriptionId });

    res.json({ message: 'Subscription will be cancelled at the end of the billing period' });
  } catch (error) {
    logger.error('Failed to cancel subscription', {
      userId: req.user?.userId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Start trial (for users who haven't had one yet)
router.post('/start-trial', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const success = await subscriptionManager.startTrial(userId, 14);

    if (success) {
      logger.info('Trial started for user', { userId });
      res.json({ message: '14-day trial started successfully' });
    } else {
      res.status(400).json({ error: 'Failed to start trial' });
    }
  } catch (error) {
    logger.error('Failed to start trial', {
      userId: req.user?.userId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    res.status(500).json({ error: 'Failed to start trial' });
  }
});

// Fraud monitoring endpoints (admin only)
router.get('/fraud-risk/:userId', authenticate, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const fraudScore = await fraudDetectionService.getUserFraudScore(userId);
    res.json({ fraudScore });
  } catch (error) {
    logger.error('Failed to get fraud risk', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ error: 'Failed to get fraud risk data' });
  }
});

export default router;
