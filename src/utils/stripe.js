/**
 * Stripe Payment Integration for Vauntico
 * 
 * Handles all payment processing for:
 * - Creator Pass subscriptions (3 tiers)
 * - Workshop Kit one-time purchase
 * - Audit Service subscriptions
 * 
 * Setup Instructions:
 * 1. Get Stripe API keys from https://dashboard.stripe.com/apikeys
 * 2. Add to .env: VITE_STRIPE_PUBLIC_KEY=pk_test_...
 * 3. Set up products in Stripe Dashboard
 * 4. Configure webhook endpoints
 */

import { trackSubscriptionSuccess, trackUpgradeClick } from './analytics'

// ============================================================================
// STRIPE CONFIGURATION
// ============================================================================

const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_YOUR_KEY_HERE'

// Stripe Product/Price IDs (set these up in your Stripe Dashboard)
export const STRIPE_PRICE_IDS = {
  CREATOR_PASS: {
    starter: {
      monthly: 'price_starter_monthly',
      yearly: 'price_starter_yearly'
    },
    pro: {
      monthly: 'price_pro_monthly',
      yearly: 'price_pro_yearly'
    },
    legacy: {
      monthly: 'price_legacy_monthly',
      yearly: 'price_legacy_yearly'
    }
  },
  WORKSHOP_KIT: {
    oneTime: 'price_workshop_kit'
  },
  AUDIT_SERVICE: {
    starter: 'price_audit_starter',
    professional: 'price_audit_pro',
    enterprise: 'contact' // Not a Stripe price, handled separately
  }
}

// ============================================================================
// STRIPE INITIALIZATION
// ============================================================================

let stripeInstance = null

/**
 * Load Stripe.js from CDN and initialize
 * Using CDN approach to avoid npm installation issues
 */
export const loadStripe = async () => {
  if (stripeInstance) return stripeInstance

  // Load Stripe.js from CDN if not already loaded
  if (!window.Stripe) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://js.stripe.com/v3/'
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  stripeInstance = window.Stripe(STRIPE_PUBLIC_KEY)
  console.log('✅ Stripe initialized')
  return stripeInstance
}

// ============================================================================
// PAYMENT CHECKOUT FUNCTIONS
// ============================================================================

/**
 * Create Creator Pass checkout session
 * @param {string} tier - starter, pro, or legacy
 * @param {string} billingCycle - monthly or yearly
 * @param {string} userEmail - User's email (optional)
 */
export const checkoutCreatorPass = async (tier, billingCycle = 'monthly', userEmail = null) => {
  try {
    // Track the upgrade click
    const tierData = {
      starter: { price: billingCycle === 'monthly' ? 17 : 170 },
      pro: { price: billingCycle === 'monthly' ? 59 : 590 },
      legacy: { price: billingCycle === 'monthly' ? 170 : 1700 }
    }
    
    trackUpgradeClick(tier, billingCycle, tierData[tier].price, 'USD')

    // Get Stripe price ID
    const priceId = STRIPE_PRICE_IDS.CREATOR_PASS[tier][billingCycle]
    
    if (priceId.startsWith('price_')) {
      // TODO: Replace with actual Stripe price ID
      console.warn('⚠️  Stripe price ID not configured. Set up products in Stripe Dashboard.')
      alert('Payment system not yet configured. Please contact support.')
      return
    }

    // Create checkout session
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        tier,
        billingCycle,
        customerEmail: userEmail,
        successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/creator-pass`,
        metadata: {
          tier,
          billingCycle,
          product: 'creator_pass'
        }
      }),
    })

    const session = await response.json()

    // Redirect to Stripe Checkout
    const stripe = await loadStripe()
    const { error } = await stripe.redirectToCheckout({
      sessionId: session.id,
    })

    if (error) {
      console.error('Stripe checkout error:', error)
      alert('Payment failed. Please try again.')
    }
  } catch (error) {
    console.error('Checkout error:', error)
    alert('Something went wrong. Please try again.')
  }
}

/**
 * Create Workshop Kit checkout session
 * @param {string} userEmail - User's email (optional)
 */
export const checkoutWorkshopKit = async (userEmail = null) => {
  try {
    const priceId = STRIPE_PRICE_IDS.WORKSHOP_KIT.oneTime
    
    if (priceId.startsWith('price_')) {
      console.warn('⚠️  Stripe price ID not configured')
      alert('Payment system not yet configured. Please contact support.')
      return
    }

    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        customerEmail: userEmail,
        mode: 'payment', // One-time payment
        successUrl: `${window.location.origin}/workshop-kit?purchased=true`,
        cancelUrl: `${window.location.origin}/workshop-kit`,
        metadata: {
          product: 'workshop_kit'
        }
      }),
    })

    const session = await response.json()
    const stripe = await loadStripe()
    const { error } = await stripe.redirectToCheckout({
      sessionId: session.id,
    })

    if (error) {
      console.error('Stripe checkout error:', error)
      alert('Payment failed. Please try again.')
    }
  } catch (error) {
    console.error('Checkout error:', error)
    alert('Something went wrong. Please try again.')
  }
}

/**
 * Create Audit Service subscription checkout
 * @param {string} plan - starter or professional
 * @param {string} userEmail - User's email (optional)
 */
export const checkoutAuditService = async (plan, userEmail = null) => {
  try {
    if (plan === 'enterprise') {
      // Enterprise is custom pricing - redirect to contact
      window.location.href = '/contact?subject=Enterprise%20Audit%20Service'
      return
    }

    const priceId = STRIPE_PRICE_IDS.AUDIT_SERVICE[plan]
    
    if (priceId.startsWith('price_')) {
      console.warn('⚠️  Stripe price ID not configured')
      alert('Payment system not yet configured. Please contact support.')
      return
    }

    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        plan,
        customerEmail: userEmail,
        successUrl: `${window.location.origin}/audit-service?subscribed=true`,
        cancelUrl: `${window.location.origin}/audit-service`,
        metadata: {
          plan,
          product: 'audit_service'
        }
      }),
    })

    const session = await response.json()
    const stripe = await loadStripe()
    const { error } = await stripe.redirectToCheckout({
      sessionId: session.id,
    })

    if (error) {
      console.error('Stripe checkout error:', error)
      alert('Payment failed. Please try again.')
    }
  } catch (error) {
    console.error('Checkout error:', error)
    alert('Something went wrong. Please try again.')
  }
}

// ============================================================================
// MOCK PAYMENT FLOW (FOR DEVELOPMENT/TESTING)
// ============================================================================

/**
 * Mock payment flow for testing without Stripe setup
 * This simulates a successful payment and updates local state
 * USE ONLY FOR DEVELOPMENT - Remove in production
 */
export const mockCheckout = async (product, tier = null, billingCycle = null) => {
  console.log('🧪 MOCK CHECKOUT - This is for testing only')
  console.log(`Product: ${product}`)
  if (tier) console.log(`Tier: ${tier}`)
  if (billingCycle) console.log(`Billing: ${billingCycle}`)

  // Simulate payment processing delay
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Update local storage based on product
  switch (product) {
    case 'creator_pass':
      localStorage.setItem('vauntico_creator_pass', 'true')
      if (tier) {
        localStorage.setItem('vauntico_creator_pass_tier', tier)
      }
      // Track success
      const prices = { starter: 17, pro: 59, legacy: 170 }
      trackSubscriptionSuccess(tier, billingCycle, prices[tier], 'USD')
      break

    case 'workshop_kit':
      localStorage.setItem('vauntico_workshop_kit', 'true')
      break

    case 'audit_service':
      localStorage.setItem('vauntico_audit_subscription', JSON.stringify({
        status: 'active',
        plan: tier,
        isActive: true
      }))
      break
  }

  // Show success message
  alert(`✅ Mock payment successful! ${product} activated.`)
  
  // Reload to update UI
  window.location.reload()
}

// ============================================================================
// CUSTOMER PORTAL (Manage Subscriptions)
// ============================================================================

/**
 * Redirect to Stripe Customer Portal
 * Allows users to manage their subscriptions, update payment methods, etc.
 */
export const openCustomerPortal = async () => {
  try {
    const response = await fetch('/api/create-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        returnUrl: window.location.href
      }),
    })

    const session = await response.json()
    window.location.href = session.url
  } catch (error) {
    console.error('Portal error:', error)
    alert('Unable to open billing portal. Please try again.')
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if Stripe is properly configured
 */
export const isStripeConfigured = () => {
  return STRIPE_PUBLIC_KEY && !STRIPE_PUBLIC_KEY.includes('YOUR_KEY_HERE')
}

/**
 * Get payment status from URL params (after redirect from Stripe)
 */
export const getPaymentStatus = () => {
  const params = new URLSearchParams(window.location.search)
  return {
    sessionId: params.get('session_id'),
    purchased: params.get('purchased') === 'true',
    subscribed: params.get('subscribed') === 'true'
  }
}

/**
 * Verify successful payment and update user state
 * Call this on success page after Stripe redirect
 */
export const verifyPayment = async (sessionId) => {
  try {
    const response = await fetch(`/api/verify-session?session_id=${sessionId}`)
    const session = await response.json()
    
    if (session.payment_status === 'paid') {
      // Update local state based on metadata
      const { product, tier, plan } = session.metadata
      
      switch (product) {
        case 'creator_pass':
          localStorage.setItem('vauntico_creator_pass', 'true')
          if (tier) {
            localStorage.setItem('vauntico_creator_pass_tier', tier)
          }
          break

        case 'workshop_kit':
          localStorage.setItem('vauntico_workshop_kit', 'true')
          break

        case 'audit_service':
          localStorage.setItem('vauntico_audit_subscription', JSON.stringify({
            status: 'active',
            plan: plan,
            isActive: true
          }))
          break
      }

      return { success: true, session }
    }

    return { success: false, error: 'Payment not completed' }
  } catch (error) {
    console.error('Verification error:', error)
    return { success: false, error: error.message }
  }
}

// ============================================================================
// DEV UTILITIES
// ============================================================================

export const STRIPE_DEV = {
  /**
   * Test checkout flow with mock data
   */
  testCheckout: (product = 'creator_pass', tier = 'pro', billingCycle = 'monthly') => {
    console.log('🧪 Testing Stripe checkout...')
    if (isStripeConfigured()) {
      console.log('✅ Stripe is configured')
      console.log('Real checkout would redirect to Stripe')
    } else {
      console.log('⚠️  Stripe not configured - using mock checkout')
      mockCheckout(product, tier, billingCycle)
    }
  },

  /**
   * Log Stripe configuration status
   */
  logStatus: () => {
    console.log('=== Stripe Configuration ===')
    console.log('Public Key:', isStripeConfigured() ? '✅ Configured' : '❌ Not configured')
    console.log('Price IDs:', STRIPE_PRICE_IDS)
    console.log('===========================')
  }
}

// Expose dev utilities in development
if (import.meta.env.DEV) {
  window.VaunticoStripe = STRIPE_DEV
  console.log('💳 Stripe Dev Utils: window.VaunticoStripe')
  console.log('Status:', isStripeConfigured() ? '✅ Configured' : '⚠️  Not configured (using mock)')
}

// ============================================================================
// BACKEND API ENDPOINTS NEEDED
// ============================================================================

/**
 * You need to create these API endpoints on your backend:
 * 
 * POST /api/create-checkout-session
 * - Creates a Stripe Checkout session
 * - Returns session ID
 * 
 * POST /api/create-portal-session
 * - Creates a Stripe Customer Portal session
 * - Returns portal URL
 * 
 * GET /api/verify-session?session_id=xxx
 * - Verifies a completed checkout session
 * - Returns session details
 * 
 * POST /api/webhooks/stripe
 * - Handles Stripe webhook events
 * - Updates user subscriptions in database
 * 
 * Example backend implementation (Node.js/Express):
 * 
 * const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
 * 
 * app.post('/api/create-checkout-session', async (req, res) => {
 *   const { priceId, customerEmail, successUrl, cancelUrl, metadata } = req.body;
 *   
 *   const session = await stripe.checkout.sessions.create({
 *     payment_method_types: ['card'],
 *     line_items: [{ price: priceId, quantity: 1 }],
 *     mode: 'subscription', // or 'payment' for one-time
 *     customer_email: customerEmail,
 *     success_url: successUrl,
 *     cancel_url: cancelUrl,
 *     metadata: metadata
 *   });
 *   
 *   res.json({ id: session.id });
 * });
 */

export default {
  loadStripe,
  checkoutCreatorPass,
  checkoutWorkshopKit,
  checkoutAuditService,
  openCustomerPortal,
  mockCheckout,
  isStripeConfigured,
  getPaymentStatus,
  verifyPayment
}
