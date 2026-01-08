import { Router, Request, Response } from 'express';
import { pool } from '../db/pool';
import { logger } from '../utils/logger';
import { subscriptionManager } from '../utils/subscriptions';
import Stripe from 'stripe';

const router = Router();

// Initialize Stripe client only if STRIPE_SECRET_KEY is available
let stripe: Stripe;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-12-15.clover',
  });
  logger.info('Stripe client initialized');
} else {
  logger.warn('Stripe client not initialized - STRIPE_SECRET_KEY not found. Stripe routes disabled.');
}

// Stripe webhook signature verification
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Stripe event types we handle
const HANDLED_EVENTS = [
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
  'checkout.session.completed',
] as const;

// Webhook endpoint for Stripe events
router.post('/stripe/webhooks', async (req: Request, res: Response) => {
  // Check if Stripe is available
  if (!stripe) {
    logger.warn('Stripe webhook received but Stripe client not initialized');
    return res.status(503).json({ error: 'Stripe service unavailable' });
  }

  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event | null = null;

  try {
    // Verify webhook signature
    if (!stripeWebhookSecret) {
      logger.error('Stripe webhook secret not configured');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    event = stripe.webhooks.constructEvent(req.body, sig, stripeWebhookSecret);
    logger.info('Stripe webhook received', { eventType: event.type, eventId: event.id });

    // Skip events we don't handle
    if (!HANDLED_EVENTS.includes(event.type as any)) {
      logger.info('Unhandled Stripe event type', { eventType: event.type });
      return res.json({ received: true });
    }

    // Handle the event
    await handleStripeEvent(event);

    res.json({ received: true });
  } catch (err: any) {
    logger.error('Webhook signature verification failed', {
      error: err.message,
      eventId: event?.id
    });
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

// Handle different Stripe events
async function handleStripeEvent(event: Stripe.Event): Promise<void> {
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionCancelled(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        logger.warn('Unhandled Stripe event', { eventType: event.type });
    }
  } catch (error) {
    logger.error('Error handling Stripe event', {
      eventType: event.type,
      eventId: event.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

// Handle successful checkout session completion
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
  logger.info('Processing checkout session completed', { sessionId: session.id });

  try {
    // Get customer details
    const customerId = session.customer as string;
    const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
    const userId = customer.metadata?.userId;

    if (!userId) {
      logger.error('No userId in customer metadata', { customerId, sessionId: session.id });
      return;
    }

    // Create or update subscription record
    await createOrUpdateSubscription(userId, session, customerId);

    logger.info('Checkout session processed successfully', { userId, sessionId: session.id });
  } catch (error) {
    logger.error('Failed to process checkout session', {
      sessionId: session.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

// Handle subscription changes (created/updated)
async function handleSubscriptionChange(subscription: Stripe.Subscription): Promise<void> {
  logger.info('Processing subscription change', { subscriptionId: subscription.id });

  try {
    // Get customer and user details
    const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
    const userId = customer.metadata?.userId;

    if (!userId) {
      logger.error('No userId in customer metadata for subscription', {
        subscriptionId: subscription.id,
        customerId: subscription.customer
      });
      return;
    }

    // Update subscription in database - use proper property access for Stripe API v2
    const status = mapStripeStatusToInternal(subscription.status);
    const tier = getTierFromPriceId(subscription.items?.data?.[0]?.price?.id);

    // Access subscription dates using Stripe API v2 format
    const currentPeriodStart = (subscription as any).current_period_start;
    const currentPeriodEnd = (subscription as any).current_period_end;
    const cancelAtPeriodEnd = (subscription as any).cancel_at_period_end;

    await pool.query(`
      UPDATE subscriptions
      SET
        stripe_subscription_id = $1,
        status = $2,
        tier = $3,
        current_period_start = $4,
        current_period_end = $5,
        cancel_at_period_end = $6,
        updated_at = NOW()
      WHERE user_id = $7
    `, [
      subscription.id,
      status,
      tier,
      currentPeriodStart ? new Date(currentPeriodStart * 1000) : null,
      currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : null,
      cancelAtPeriodEnd || false,
      userId
    ]);

    // Clear subscription caches
    // Note: We'll need to import and use cache clearing logic here

    logger.info('Subscription updated successfully', { userId, subscriptionId: subscription.id, tier, status });
  } catch (error) {
    logger.error('Failed to update subscription', {
      subscriptionId: subscription.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

// Handle subscription cancellation
async function handleSubscriptionCancelled(subscription: Stripe.Subscription): Promise<void> {
  logger.info('Processing subscription cancellation', { subscriptionId: subscription.id });

  try {
    const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
    const userId = customer.metadata?.userId;

    if (!userId) {
      logger.error('No userId for cancelled subscription', { subscriptionId: subscription.id });
      return;
    }

    // Update subscription to cancelled status
    await pool.query(`
      UPDATE subscriptions
      SET status = 'canceled', cancel_at_period_end = false, updated_at = NOW()
      WHERE user_id = $1 AND stripe_subscription_id = $2
    `, [userId, subscription.id]);

    logger.info('Subscription marked as cancelled', { userId, subscriptionId: subscription.id });
  } catch (error) {
    logger.error('Failed to process subscription cancellation', {
      subscriptionId: subscription.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

// Handle successful payment
async function handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
  logger.info('Processing payment succeeded', { invoiceId: invoice.id });

  // Additional processing for successful payments can be added here
  // e.g., sending confirmation emails, updating usage metrics, etc.
}

// Handle failed payment
async function handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  logger.warn('Processing payment failed', { invoiceId: invoice.id });

  try {
  // Mark subscription as past due or handle dunning process
  if ((invoice as any).subscription) {
    const subscription = await stripe.subscriptions.retrieve((invoice as any).subscription as string) as Stripe.Subscription;
    await handleSubscriptionChange(subscription);
  }
  } catch (error) {
    logger.error('Failed to handle payment failure', {
      invoiceId: invoice.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Create or update subscription record after successful checkout
async function createOrUpdateSubscription(
  userId: string,
  session: Stripe.Checkout.Session,
  customerId: string
): Promise<void> {
  try {
    // Get subscription details from session
    const subscriptionId = session.subscription as string;
    if (!subscriptionId) {
      logger.info('No subscription in checkout session (one-time payment?)', { sessionId: session.id });
      return;
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Insert or update subscription record
    await pool.query(`
      INSERT INTO subscriptions (
        user_id, stripe_customer_id, stripe_subscription_id, tier, status,
        current_period_start, current_period_end, cancel_at_period_end
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (user_id) DO UPDATE SET
        stripe_customer_id = EXCLUDED.stripe_customer_id,
        stripe_subscription_id = EXCLUDED.stripe_subscription_id,
        tier = EXCLUDED.tier,
        status = EXCLUDED.status,
        current_period_start = EXCLUDED.current_period_start,
        current_period_end = EXCLUDED.current_period_end,
        cancel_at_period_end = EXCLUDED.cancel_at_period_end,
        updated_at = NOW()
    `, [
      userId,
      customerId,
      subscriptionId,
      getTierFromPriceId((subscription as any).items.data[0]?.price.id),
      mapStripeStatusToInternal(subscription.status),
      (subscription as any).current_period_start ? new Date((subscription as any).current_period_start * 1000) : null,
      (subscription as any).current_period_end ? new Date((subscription as any).current_period_end * 1000) : null,
      (subscription as any).cancel_at_period_end || false
    ]);

    logger.info('Subscription created/updated from checkout', { userId, subscriptionId });
  } catch (error) {
    logger.error('Failed to create/update subscription from checkout', {
      userId,
      sessionId: session.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

// Map Stripe subscription status to internal status
function mapStripeStatusToInternal(stripeStatus: Stripe.Subscription.Status): string {
  switch (stripeStatus) {
    case 'active':
    case 'trialing':
      return 'active';
    case 'past_due':
      return 'past_due';
    case 'canceled':
      return 'canceled';
    case 'incomplete':
    case 'incomplete_expired':
      return 'incomplete';
    case 'paused':
      return 'canceled'; // Treat as cancelled for now
    default:
      logger.warn('Unknown Stripe subscription status', { status: stripeStatus });
      return 'active';
  }
}

// Determine tier from Stripe price ID
function getTierFromPriceId(priceId?: string): string {
  if (!priceId) {
    logger.warn('No price ID provided for tier determination');
    return 'free';
  }

  // Map price IDs to tiers (these would be configured in your Stripe dashboard)
  const prices = {
    creator_pass: process.env.STRIPE_CREATOR_PASS_PRICE_ID,
    enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID
  };

  // Find the tier by looking for the priceId in the prices object
  for (const [tier, priceIdInMap] of Object.entries(prices)) {
    if (priceIdInMap === priceId) {
      return tier;
    }
  }
  return 'free';
}

export default router;
