import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

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

// Import required utilities
import Stripe from 'stripe';

// Initialize Stripe client
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// Simple database query function (adapt to your database setup)
async function query(text: string, params: any[] = []) {
  // This is a placeholder - you'll need to implement your actual database connection
  // For production, use a proper database connection
  console.log('Database query would execute:', text, params);
  return { rows: [], rowCount: 0 };
}

// Utility functions
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
      console.warn('Unknown Stripe subscription status', { status: stripeStatus });
      return 'active';
  }
}

function getTierFromPriceId(priceId?: string): string {
  if (!priceId) {
    console.warn('No price ID provided for tier determination');
    return 'free';
  }

  // Map price IDs to tiers (these would be configured in your environment variables)
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

// Handle successful checkout session completion
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
  console.log('Processing checkout session completed', { sessionId: session.id });

  try {
    // Get customer details
    const customerId = session.customer as string;
    if (!stripe) throw new Error('Stripe not configured');

    const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
    const userId = customer.metadata?.userId;

    if (!userId) {
      console.error('No userId in customer metadata', { customerId, sessionId: session.id });
      return;
    }

    // Create or update subscription record
    await createOrUpdateSubscription(userId, session, customerId);

    console.log('Checkout session processed successfully', { userId, sessionId: session.id });
  } catch (error) {
    console.error('Failed to process checkout session', {
      sessionId: session.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

// Handle subscription changes (created/updated)
async function handleSubscriptionChange(subscription: Stripe.Subscription): Promise<void> {
  console.log('Processing subscription change', { subscriptionId: subscription.id });

  if (!stripe) throw new Error('Stripe not configured');

  try {
    // Get customer and user details
    const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
    const userId = customer.metadata?.userId;

    if (!userId) {
      console.error('No userId in customer metadata for subscription', {
        subscriptionId: subscription.id,
        customerId: subscription.customer
      });
      return;
    }

    // Update subscription in database
    const status = mapStripeStatusToInternal(subscription.status);
    const tier = getTierFromPriceId(subscription.items?.data?.[0]?.price?.id);

    const currentPeriodStart = (subscription as any).current_period_start;
    const currentPeriodEnd = (subscription as any).current_period_end;
    const cancelAtPeriodEnd = (subscription as any).cancel_at_period_end;

    await query(`
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

    console.log('Subscription updated successfully', { userId, subscriptionId: subscription.id, tier, status });
  } catch (error) {
    console.error('Failed to update subscription', {
      subscriptionId: subscription.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

// Handle subscription cancellation
async function handleSubscriptionCancelled(subscription: Stripe.Subscription): Promise<void> {
  console.log('Processing subscription cancellation', { subscriptionId: subscription.id });

  try {
    if (!stripe) throw new Error('Stripe not configured');

    const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
    const userId = customer.metadata?.userId;

    if (!userId) {
      console.error('No userId for cancelled subscription', { subscriptionId: subscription.id });
      return;
    }

    // Update subscription to cancelled status
    await query(`
      UPDATE subscriptions
      SET status = 'canceled', cancel_at_period_end = false, updated_at = NOW()
      WHERE user_id = $1 AND stripe_subscription_id = $2
    `, [userId, subscription.id]);

    console.log('Subscription marked as cancelled', { userId, subscriptionId: subscription.id });
  } catch (error) {
    console.error('Failed to process subscription cancellation', {
      subscriptionId: subscription.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

// Handle successful payment
async function handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
  console.log('Processing payment succeeded', { invoiceId: invoice.id });
  // Additional processing for successful payments can be added here
}

// Handle failed payment
async function handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  console.warn('Processing payment failed', { invoiceId: invoice.id });

  if (!stripe) return;

  try {
    if ((invoice as any).subscription) {
      const subscription = await stripe.subscriptions.retrieve((invoice as any).subscription as string) as Stripe.Subscription;
      await handleSubscriptionChange(subscription);
    }
  } catch (error) {
    console.error('Failed to handle payment failure', {
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
      console.info('No subscription in checkout session (one-time payment?)', { sessionId: session.id });
      return;
    }

    if (!stripe) throw new Error('Stripe not configured');

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Insert or update subscription record
    await query(`
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

    console.log('Subscription created/updated from checkout', { userId, subscriptionId });
  } catch (error) {
    console.error('Failed to create/update subscription from checkout', {
      userId,
      sessionId: session.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

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
        console.warn('Unhandled Stripe event', { eventType: event.type });
    }
  } catch (error) {
    console.error('Error handling Stripe event', {
      eventType: event.type,
      eventId: event.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

// POST handler for Stripe webhooks
export async function POST(request: NextRequest) {
  console.log('Stripe webhook received');

  // Check if Stripe is available
  if (!stripe) {
    console.warn('Stripe webhook received but Stripe client not initialized');
    return NextResponse.json({ error: 'Stripe service unavailable' }, { status: 503 });
  }

  try {
    // Verify webhook signature
    if (!stripeWebhookSecret) {
      console.error('Stripe webhook secret not configured');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    const body = await request.text();
    const sig = headers().get('stripe-signature') as string;

    if (!sig) {
      console.error('No Stripe signature header provided');
      return NextResponse.json({ error: 'No signature header' }, { status: 400 });
    }

    // Construct event
    const event = stripe.webhooks.constructEvent(body, sig, stripeWebhookSecret);
    console.log('Stripe webhook authenticated', { eventType: event.type, eventId: event.id });

    // Skip events we don't handle
    if (!HANDLED_EVENTS.includes(event.type as any)) {
      console.log('Unhandled Stripe event type', { eventType: event.type });
      return NextResponse.json({ received: true });
    }

    // Handle the event
    await handleStripeEvent(event);

    return NextResponse.json({ received: true });

  } catch (err: any) {
    console.error('Webhook signature verification failed', {
      error: err.message
    });
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }
}
