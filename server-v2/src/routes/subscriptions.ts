import { Router, Request, Response } from 'express';
import { pool } from '../db/pool';
import { logger } from '../utils/logger';
import { authenticate } from '../middleware/authenticate';
import { subscriptionManager, PaymentProvider, SubscriptionTier } from '../utils/subscriptions';
import { fraudDetectionService } from '../services/fraudDetectionService';
import { paystackService } from '../services/paystackService';
import Stripe from 'stripe';

// Initialize Stripe with secret key (kept for future migration)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_disabled', {
  apiVersion: '2025-12-15.clover' as const,
});

// Paystack plan codes for different subscription tiers
const PAYSTACK_PLANS = {
  [SubscriptionTier.CREATOR_PASS]: process.env.PAYSTACK_CREATOR_PASS_PLAN_CODE || 'PLN_creator_pass',
  [SubscriptionTier.ENTERPRISE]: process.env.PAYSTACK_ENTERPRISE_PLAN_CODE || 'PLN_enterprise',
} as const;

// Paystack pricing in kobo (NGN cents)
const PAYSTACK_PRICING = {
  [SubscriptionTier.CREATOR_PASS]: 290000, // ₦2,900
  [SubscriptionTier.ENTERPRISE]: 990000, // ₦9,900
} as const;

const router = Router();

// Create checkout session for subscription (Paystack primary, Stripe scaffolded)
router.post('/checkout', authenticate, fraudDetectionService.createPaymentFraudMiddleware(), async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { tier, trialDays = 14, useStripe = false } = req.body;

    if (!tier || !['creator_pass', 'enterprise'].includes(tier)) {
      return res.status(400).json({ error: 'Invalid tier specified' });
    }

    const subscriptionTier = tier === 'creator_pass' ? SubscriptionTier.CREATOR_PASS : SubscriptionTier.ENTERPRISE;

    // Check if Stripe is enabled (default: false - Paystack primary)
    const stripeEnabled = process.env.STRIPE_ENABLED === 'true';

    if (stripeEnabled && useStripe) {
      // Use Stripe (scaffolded but disabled by default)
      await handleStripeCheckout(userId, subscriptionTier, trialDays, res);
    } else {
      // Use Paystack (primary processor)
      await handlePaystackCheckout(userId, subscriptionTier, trialDays, res);
    }

  } catch (error) {
    logger.error('Failed to create checkout session', {
      userId: req.user?.userId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Handle Paystack checkout (primary)
async function handlePaystackCheckout(userId: string, tier: SubscriptionTier, trialDays: number, res: Response) {
  try {
    // Get or create user email
    const userResult = await pool.query('SELECT email FROM users WHERE id = $1', [userId]);
    const userEmail = userResult.rows[0]?.email;

    if (!userEmail) {
      return res.status(400).json({ error: 'User email not found' });
    }

    // Create or get Paystack customer
    const customer = await paystackService.createOrGetCustomer(userEmail, { userId });

    // Get plan amount
    const amount = tier === SubscriptionTier.CREATOR_PASS ? PAYSTACK_PRICING[SubscriptionTier.CREATOR_PASS] : PAYSTACK_PRICING[SubscriptionTier.ENTERPRISE];
    const planCode = tier === SubscriptionTier.CREATOR_PASS ? PAYSTACK_PLANS[SubscriptionTier.CREATOR_PASS] : PAYSTACK_PLANS[SubscriptionTier.ENTERPRISE];

    // Initialize subscription transaction
    const transaction = await paystackService.initializeSubscription(
      customer.customer_code,
      planCode,
      amount, // Amount in kobo
      trialDays
    );

    logger.info('Paystack checkout session created', {
      userId,
      tier,
      reference: transaction.reference,
      amount
    });

    // Create payment attempt record for fraud detection
    await fraudDetectionService.logPaymentAttempt({
      userId,
      subscriptionId: undefined, // Will be set after successful payment
      stripePaymentIntentId: transaction.reference, // Using Paystack reference
      amountCents: amount,
      currency: 'ngn', // Nigerian Naira
      ipAddress: 'checkout_init', // Will be updated by webhook
      userAgent: 'checkout_init', // Will be updated by webhook
      billingDetails: { customer_code: customer.customer_code },
      paymentMethodInfo: { provider: PaymentProvider.PAYSTACK }
    }, { fraudScore: 0, signals: [], recommendation: 'approve' }); // Low risk for checkout init

    res.json({
      sessionId: transaction.reference,
      url: transaction.authorization_url,
      provider: PaymentProvider.PAYSTACK,
      amount,
      currency: 'NGN'
    });
  } catch (error) {
    logger.error('Paystack checkout failed', {
      userId,
      tier,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

// Handle Stripe checkout (scaffolded, disabled by default)
async function handleStripeCheckout(userId: string, tier: SubscriptionTier, trialDays: number, res: Response) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(503).json({ error: 'Stripe payment processor not available' });
    }

    // Get or create Stripe customer
    let customerId: string;

    const existingSub = await subscriptionManager.getSubscription(userId);
    if (existingSub?.stripeCustomerId) {
      customerId = existingSub.stripeCustomerId;
    } else {
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

    const priceId = priceIds[tier === SubscriptionTier.CREATOR_PASS ? 'creator_pass' : 'enterprise'];
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

    logger.info('Stripe checkout session created (scaffolded)', { userId, sessionId: session.id, tier });

    res.json({
      sessionId: session.id,
      url: session.url,
      provider: PaymentProvider.STRIPE
    });
  } catch (error) {
    logger.error('Stripe checkout failed', {
      userId,
      tier,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

// Get user's subscription status
router.get('/status', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const subscription = await subscriptionManager.getSubscription(userId);

    if (!subscription) {
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
        provider: PaymentProvider.PAYSTACK, // Default to Paystack
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
      provider: subscription.paymentProvider || PaymentProvider.PAYSTACK,
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
    if (!subscription) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    // Handle cancellation based on provider
    if (subscription.paymentProvider === PaymentProvider.PAYSTACK || !subscription.paystackSubscriptionCode) {
      // Paystack cancellation
      if (subscription.paystackSubscriptionCode) {
        await paystackService.cancelSubscription(subscription.paystackSubscriptionCode);
      }
    } else if (subscription.paymentProvider === PaymentProvider.STRIPE && subscription.stripeSubscriptionId) {
      // Stripe cancellation
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
    }

    // Update subscription status in our database
    await pool.query(`
      UPDATE subscriptions
      SET cancel_at_period_end = true, updated_at = NOW()
      WHERE user_id = $1
    `, [userId]);

    logger.info('Subscription cancel requested', {
      userId,
      provider: subscription.paymentProvider,
      paystackCode: subscription.paystackSubscriptionCode,
      stripeId: subscription.stripeSubscriptionId
    });

    res.json({ message: 'Subscription will be cancelled at the end of the billing period' });
  } catch (error) {
    logger.error('Failed to cancel subscription', {
      userId: req.user?.userId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Paystack webhook handler
router.post('/webhook/paystack', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-paystack-signature'] as string;
    const body = JSON.stringify(req.body);

    // Verify webhook signature
    if (!paystackService.verifyWebhook(body, signature)) {
      logger.warn('Invalid Paystack webhook signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Process webhook
    await paystackService.handleWebhook(req.body);

    res.json({ status: 'ok' });
  } catch (error) {
    logger.error('Paystack webhook processing failed', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    res.status(500).json({ error: 'Webhook processing failed' });
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
