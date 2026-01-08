/**
 * Vauntico Analytics & Event Tracking System
 * Phase 5: Live Deployment + Syndication Layer + Mixpanel Integration
 * 
 * Tracks:
 * - Scroll views and interactions
 * - Upgrade clicks and conversions
 * - CLI onboarding progress
 * - Referral attribution
 * - Embed performance
 * - Deep product analytics via Mixpanel
 */

import mixpanel from 'mixpanel-browser'

// ============================================================================
// ANALYTICS CONFIGURATION
// ============================================================================

const MIXPANEL_TOKEN = import.meta.env.VITE_MIXPANEL_TOKEN

// Initialize Mixpanel if token is available
if (MIXPANEL_TOKEN) {
  mixpanel.init(MIXPANEL_TOKEN, { 
    debug: import.meta.env.DEV,
    track_pageview: true,
    persistence: 'localStorage'
  })
  
  // Expose Mixpanel globally for console testing
  if (typeof window !== 'undefined') {
    window.mixpanel = mixpanel
  }
  
  console.log('🎯 Mixpanel initialized with token:', MIXPANEL_TOKEN.substring(0, 8) + '...')
}

const ANALYTICS_CONFIG = {
  // Set to true to enable console logging for development
  debug: import.meta.env.DEV,
  
  // Analytics providers (add your keys here)
  providers: {
    googleAnalytics: {
      enabled: true,
      measurementId: import.meta.env.VITE_GA4_ID || 'G-30N4CHF6JR'
    },
    plausible: {
      enabled: false,
      domain: 'vauntico.com' // Replace with actual domain
    },
    mixpanel: {
      enabled: !!MIXPANEL_TOKEN,
      token: MIXPANEL_TOKEN
    }
  },
  
  // Event batching (reduce API calls)
  batching: {
    enabled: true,
    maxBatchSize: 10,
    flushInterval: 5000 // 5 seconds
  }
}

// ============================================================================
// EVENT QUEUE & BATCHING
// ============================================================================

let eventQueue = []
let flushTimer = null

/**
 * Flush event queue to analytics providers
 */
const flushEventQueue = () => {
  if (eventQueue.length === 0) return
  
  const eventsToSend = [...eventQueue]
  eventQueue = []
  
  if (ANALYTICS_CONFIG.debug) {
    console.log('📊 Flushing analytics events:', eventsToSend)
  }
  
  // Send to each enabled provider
  eventsToSend.forEach(event => {
    sendToProviders(event)
  })
}

/**
 * Add event to queue
 */
const queueEvent = (event) => {
  eventQueue.push({
    ...event,
    timestamp: new Date().toISOString(),
    sessionId: getSessionId()
  })
  
  // Flush immediately if batch is full
  if (eventQueue.length >= ANALYTICS_CONFIG.batching.maxBatchSize) {
    flushEventQueue()
  } else if (!flushTimer) {
    // Schedule flush
    flushTimer = setTimeout(() => {
      flushEventQueue()
      flushTimer = null
    }, ANALYTICS_CONFIG.batching.flushInterval)
  }
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

/**
 * Get or create session ID
 */
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('vauntico_session_id')
  
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem('vauntico_session_id', sessionId)
  }
  
  return sessionId
}

/**
 * Get user identifier (anonymous or authenticated)
 */
const getUserId = () => {
  // Check for authenticated user ID
  const userId = localStorage.getItem('vauntico_user_id')
  if (userId) return userId
  
  // Create anonymous ID
  let anonId = localStorage.getItem('vauntico_anonymous_id')
  if (!anonId) {
    anonId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('vauntico_anonymous_id', anonId)
  }
  
  return anonId
}

/**
 * Get referral attribution data
 */
const getReferralData = () => {
  const referralCode = localStorage.getItem('vauntico_referral_code')
  const referralSource = localStorage.getItem('vauntico_referral_source')
  const utmParams = getUTMParameters()
  
  return {
    referralCode,
    referralSource,
    ...utmParams
  }
}

/**
 * Extract UTM parameters from URL
 */
const getUTMParameters = () => {
  const params = new URLSearchParams(window.location.search)
  
  return {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    utm_content: params.get('utm_content'),
    utm_term: params.get('utm_term')
  }
}

// ============================================================================
// PROVIDER INTEGRATIONS
// ============================================================================

/**
 * Send event to all enabled analytics providers
 */
const sendToProviders = (event) => {
  const { providers } = ANALYTICS_CONFIG
  
  // Google Analytics 4
  if (providers.googleAnalytics.enabled && window.gtag) {
    window.gtag('event', event.name, {
      ...event.properties,
      event_category: event.category,
      event_label: event.label,
      value: event.value
    })
  }
  
  // Plausible
  if (providers.plausible.enabled && window.plausible) {
    window.plausible(event.name, {
      props: event.properties
    })
  }
  
  // Mixpanel
  if (providers.mixpanel.enabled && window.mixpanel) {
    window.mixpanel.track(event.name, event.properties)
  }
  
  // Debug logging
  if (ANALYTICS_CONFIG.debug) {
    console.log('📊 Analytics Event:', event)
  }
}

// ============================================================================
// SCROLL TRACKING EVENTS
// ============================================================================

/**
 * Track scroll view
 */
export const trackScrollView = (scrollId, scrollTitle, scrollTier) => {
  queueEvent({
    name: 'scroll_viewed',
    category: 'engagement',
    label: scrollTitle,
    properties: {
      scroll_id: scrollId,
      scroll_title: scrollTitle,
      scroll_tier: scrollTier,
      user_id: getUserId(),
      ...getReferralData()
    }
  })
}

/**
 * Track scroll lock interaction (user tried to access locked scroll)
 */
export const trackScrollLockClick = (scrollId, scrollTitle, requiredTier, userTier) => {
  queueEvent({
    name: 'scroll_lock_clicked',
    category: 'conversion',
    label: scrollTitle,
    properties: {
      scroll_id: scrollId,
      scroll_title: scrollTitle,
      required_tier: requiredTier,
      user_tier: userTier || 'free',
      user_id: getUserId(),
      ...getReferralData()
    }
  })
}

/**
 * Track scroll unlock animation shown
 */
export const trackScrollUnlock = (scrollId, scrollTitle, tier) => {
  queueEvent({
    name: 'scroll_unlocked',
    category: 'engagement',
    label: scrollTitle,
    properties: {
      scroll_id: scrollId,
      scroll_title: scrollTitle,
      unlocked_tier: tier,
      user_id: getUserId(),
      ...getReferralData()
    }
  })
}

/**
 * Track scroll reading time
 */
export const trackScrollReadingTime = (scrollId, scrollTitle, durationSeconds) => {
  queueEvent({
    name: 'scroll_read_time',
    category: 'engagement',
    label: scrollTitle,
    value: durationSeconds,
    properties: {
      scroll_id: scrollId,
      scroll_title: scrollTitle,
      duration_seconds: durationSeconds,
      user_id: getUserId()
    }
  })
}

/**
 * Track scroll completion
 */
export const trackScrollComplete = (scrollId, scrollTitle) => {
  queueEvent({
    name: 'scroll_completed',
    category: 'engagement',
    label: scrollTitle,
    properties: {
      scroll_id: scrollId,
      scroll_title: scrollTitle,
      user_id: getUserId()
    }
  })
}

// ============================================================================
// UPGRADE & CONVERSION TRACKING
// ============================================================================

/**
 * Track upgrade modal opened
 */
export const trackUpgradeModalOpen = (trigger, currentTier, scrollId = null) => {
  queueEvent({
    name: 'upgrade_modal_opened',
    category: 'conversion',
    label: trigger,
    properties: {
      trigger, // 'scroll_lock', 'cta_button', 'recommendation', etc.
      current_tier: currentTier || 'free',
      scroll_id: scrollId,
      user_id: getUserId(),
      ...getReferralData()
    }
  })
}

/**
 * Track tier selection in upgrade modal
 */
export const trackTierSelected = (selectedTier, billingCycle, currentTier) => {
  queueEvent({
    name: 'tier_selected',
    category: 'conversion',
    label: selectedTier,
    properties: {
      selected_tier: selectedTier,
      billing_cycle: billingCycle,
      current_tier: currentTier || 'free',
      user_id: getUserId(),
      ...getReferralData()
    }
  })
}

/**
 * Track upgrade button click
 */
export const trackUpgradeClick = (tier, billingCycle, price, currency) => {
  queueEvent({
    name: 'upgrade_clicked',
    category: 'conversion',
    label: tier,
    value: price,
    properties: {
      tier,
      billing_cycle: billingCycle,
      price,
      currency,
      user_id: getUserId(),
      ...getReferralData()
    }
  })
}

/**
 * Track successful subscription
 */
export const trackSubscriptionSuccess = (tier, billingCycle, price, currency) => {
  queueEvent({
    name: 'subscription_completed',
    category: 'conversion',
    label: tier,
    value: price,
    properties: {
      tier,
      billing_cycle: billingCycle,
      price,
      currency,
      user_id: getUserId(),
      ...getReferralData()
    }
  })
  
  // Also track as conversion for ad platforms
  if (window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: `sub_${Date.now()}`,
      value: price,
      currency: currency,
      items: [{
        item_id: tier,
        item_name: `Creator Pass - ${tier}`,
        item_category: 'subscription',
        price: price,
        quantity: 1
      }]
    })
  }
}

// ============================================================================
// CLI ONBOARDING TRACKING
// ============================================================================

/**
 * Track CLI onboarding started
 */
export const trackCLIOnboardingStart = (roleId, roleName) => {
  queueEvent({
    name: 'cli_onboarding_started',
    category: 'onboarding',
    label: roleName,
    properties: {
      role_id: roleId,
      role_name: roleName,
      user_id: getUserId()
    }
  })
}

/**
 * Track CLI command execution
 */
export const trackCLICommand = (command, roleId) => {
  queueEvent({
    name: 'cli_command_executed',
    category: 'engagement',
    label: command,
    properties: {
      command,
      role_id: roleId,
      user_id: getUserId()
    }
  })
}

/**
 * Track CLI step completion
 */
export const trackCLIStepComplete = (stepIndex, stepTitle, roleId) => {
  queueEvent({
    name: 'cli_step_completed',
    category: 'onboarding',
    label: stepTitle,
    properties: {
      step_index: stepIndex,
      step_title: stepTitle,
      role_id: roleId,
      user_id: getUserId()
    }
  })
}

/**
 * Track CLI onboarding completion
 */
export const trackCLIOnboardingComplete = (roleId, roleName, completionTimeSeconds) => {
  queueEvent({
    name: 'cli_onboarding_completed',
    category: 'onboarding',
    label: roleName,
    value: completionTimeSeconds,
    properties: {
      role_id: roleId,
      role_name: roleName,
      completion_time_seconds: completionTimeSeconds,
      user_id: getUserId()
    }
  })
}

/**
 * Track achievement earned
 */
export const trackAchievementEarned = (achievementId, achievementTitle) => {
  queueEvent({
    name: 'achievement_earned',
    category: 'engagement',
    label: achievementTitle,
    properties: {
      achievement_id: achievementId,
      achievement_title: achievementTitle,
      user_id: getUserId()
    }
  })
}

// ============================================================================
// REFERRAL & SYNDICATION TRACKING
// ============================================================================

/**
 * Track referral link generation
 */
export const trackReferralGenerated = (referralCode, sourceType) => {
  queueEvent({
    name: 'referral_generated',
    category: 'referral',
    label: sourceType,
    properties: {
      referral_code: referralCode,
      source_type: sourceType, // 'scroll_share', 'creator_pass', 'manual'
      user_id: getUserId()
    }
  })
}

/**
 * Track referral link clicked
 */
export const trackReferralClick = (referralCode, source) => {
  queueEvent({
    name: 'referral_clicked',
    category: 'referral',
    label: referralCode,
    properties: {
      referral_code: referralCode,
      source,
      user_id: getUserId()
    }
  })
  
  // Store referral code for attribution
  localStorage.setItem('vauntico_referral_code', referralCode)
  localStorage.setItem('vauntico_referral_source', source)
}

/**
 * Track scroll share
 */
export const trackScrollShare = (scrollId, scrollTitle, platform) => {
  queueEvent({
    name: 'scroll_shared',
    category: 'social',
    label: platform,
    properties: {
      scroll_id: scrollId,
      scroll_title: scrollTitle,
      platform, // 'twitter', 'linkedin', 'copy_link', etc.
      user_id: getUserId()
    }
  })
}

/**
 * Track embed snippet generated
 */
export const trackEmbedGenerated = (scrollId, scrollTitle, embedType) => {
  queueEvent({
    name: 'embed_generated',
    category: 'syndication',
    label: embedType,
    properties: {
      scroll_id: scrollId,
      scroll_title: scrollTitle,
      embed_type: embedType, // 'iframe', 'script', 'widget'
      user_id: getUserId()
    }
  })
}

/**
 * Track embed view (when scroll is viewed via embed)
 */
export const trackEmbedView = (scrollId, embedId, referrerDomain) => {
  queueEvent({
    name: 'embed_viewed',
    category: 'syndication',
    label: referrerDomain,
    properties: {
      scroll_id: scrollId,
      embed_id: embedId,
      referrer_domain: referrerDomain,
      user_id: getUserId()
    }
  })
}

// ============================================================================
// PAGE & NAVIGATION TRACKING
// ============================================================================

/**
 * Track page view
 */
export const trackPageView = (pagePath, pageTitle) => {
  queueEvent({
    name: 'page_view',
    category: 'navigation',
    label: pageTitle,
    properties: {
      page_path: pagePath,
      page_title: pageTitle,
      user_id: getUserId(),
      ...getReferralData()
    }
  })
}

/**
 * Track /ascend page visit
 */
export const trackAscendPageView = (soulStackProgress) => {
  queueEvent({
    name: 'ascend_page_viewed',
    category: 'navigation',
    label: 'Soul Stack Map',
    properties: {
      soul_stack_progress: soulStackProgress,
      user_id: getUserId(),
      ...getReferralData()
    }
  })
}

/**
 * Track soul stack tier unlock
 */
export const trackSoulStackUnlock = (tierName, tierIndex) => {
  queueEvent({
    name: 'soul_stack_unlocked',
    category: 'engagement',
    label: tierName,
    properties: {
      tier_name: tierName,
      tier_index: tierIndex,
      user_id: getUserId()
    }
  })
}

// ============================================================================
// COMPETITIVE POSITIONING TRACKING
// ============================================================================

/**
 * Track comparison table viewed
 */
export const trackComparisonTableView = (competitors) => {
  queueEvent({
    name: 'comparison_table_viewed',
    category: 'engagement',
    label: 'Competitive Comparison',
    properties: {
      competitors_shown: competitors,
      user_id: getUserId()
    }
  })
}

/**
 * Track old vs new way section viewed
 */
export const trackOldVsNewView = () => {
  queueEvent({
    name: 'old_vs_new_viewed',
    category: 'engagement',
    label: 'Enemy Positioning',
    properties: {
      section_type: 'old_way_vs_new_way',
      user_id: getUserId()
    }
  })
}

/**
 * Track competitor comparison page viewed
 */
export const trackCompetitorComparisonView = (competitorName) => {
  queueEvent({
    name: 'competitor_comparison_clicked',
    category: 'engagement',
    label: competitorName,
    properties: {
      competitor_name: competitorName,
      page_path: window.location.pathname,
      user_id: getUserId()
    }
  })
}

/**
 * Track CTA click from comparison section
 */
export const trackComparisonCTAClick = (ctaText, ctaDestination, competitorName = null) => {
  queueEvent({
    name: 'cta_clicked_from_comparison',
    category: 'conversion',
    label: competitorName || 'Comparison Section',
    properties: {
      cta_text: ctaText,
      cta_destination: ctaDestination,
      competitor_name: competitorName,
      user_id: getUserId(),
      ...getReferralData()
    }
  })
}

// ============================================================================
// EMAIL CAPTURE & LEAD GENERATION TRACKING
// ============================================================================

/**
 * Track email capture success
 */
export const trackEmailCapture = (email, leadMagnet, source) => {
  queueEvent({
    name: 'email_captured',
    category: 'conversion',
    label: leadMagnet,
    properties: {
      email_domain: email.split('@')[1], // Track domain for B2B insights
      lead_magnet: leadMagnet,
      source, // 'scroll_unlock', 'banner', 'modal', etc.
      user_id: getUserId(),
      ...getReferralData()
    }
  })
  
  // Also track in Mixpanel with full email
  if (window.mixpanel) {
    window.mixpanel.people.set({
      $email: email,
      lead_magnet: leadMagnet,
      subscription_source: source,
      subscribed_at: new Date().toISOString()
    })
  }
}

/**
 * Track email capture form view
 */
export const trackEmailCaptureView = (variant, location) => {
  queueEvent({
    name: 'email_capture_viewed',
    category: 'engagement',
    label: variant,
    properties: {
      variant, // 'inline', 'modal', 'banner'
      location, // 'lore_vault', 'scroll_lock', 'homepage'
      user_id: getUserId()
    }
  })
}

/**
 * Track email capture form submission attempt (before validation)
 */
export const trackEmailCaptureAttempt = (variant, isValid) => {
  queueEvent({
    name: 'email_capture_attempted',
    category: 'conversion',
    label: variant,
    properties: {
      variant,
      is_valid: isValid,
      user_id: getUserId()
    }
  })
}

// ============================================================================
// FEATURE USAGE TRACKING
// ============================================================================

/**
 * Track tier comparison calculator usage
 */
export const trackTierComparison = (selectedTiers) => {
  queueEvent({
    name: 'tier_comparison_used',
    category: 'engagement',
    label: 'Tier Calculator',
    properties: {
      selected_tiers: selectedTiers,
      user_id: getUserId()
    }
  })
}

/**
 * Track credit tracker viewed
 */
export const trackCreditTrackerView = (credits) => {
  queueEvent({
    name: 'credit_tracker_viewed',
    category: 'engagement',
    label: 'Credit Tracker',
    properties: {
      credits_used: credits.used,
      credits_total: credits.total,
      credits_remaining: credits.remaining,
      user_id: getUserId()
    }
  })
}

/**
 * Track personalized recommendation clicked
 */
export const trackRecommendationClick = (recommendationType, scrollId) => {
  queueEvent({
    name: 'recommendation_clicked',
    category: 'engagement',
    label: recommendationType,
    properties: {
      recommendation_type: recommendationType,
      scroll_id: scrollId,
      user_id: getUserId()
    }
  })
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Initialize analytics on app load
 */
export const initAnalytics = () => {
  // Track initial page view
  trackPageView(window.location.pathname, document.title)
  
  // Process UTM parameters
  const utmParams = getUTMParameters()
  if (Object.values(utmParams).some(v => v !== null)) {
    // Store UTM params for attribution
    Object.entries(utmParams).forEach(([key, value]) => {
      if (value) {
        localStorage.setItem(`vauntico_${key}`, value)
      }
    })
  }
  
  // Check for referral code in URL
  const params = new URLSearchParams(window.location.search)
  const ref = params.get('ref')
  if (ref) {
    trackReferralClick(ref, 'url_parameter')
  }
  
  // Flush events on page unload
  window.addEventListener('beforeunload', () => {
    flushEventQueue()
  })
  
  if (ANALYTICS_CONFIG.debug) {
    console.log('📊 Vauntico Analytics initialized')
    console.log('Session ID:', getSessionId())
    console.log('User ID:', getUserId())
  }
}

/**
 * Manually flush event queue (useful before navigation)
 */
export const flushAnalytics = () => {
  flushEventQueue()
}

/**
 * Update analytics configuration
 */
export const configureAnalytics = (config) => {
  Object.assign(ANALYTICS_CONFIG, config)
}

// ============================================================================
// DEV UTILITIES
// ============================================================================

export const ANALYTICS_DEV = {
  /**
   * Get current event queue
   */
  getQueue: () => eventQueue,
  
  /**
   * Force flush queue
   */
  flush: flushEventQueue,
  
  /**
   * Clear session
   */
  clearSession: () => {
    sessionStorage.removeItem('vauntico_session_id')
    console.log('Session cleared')
  },
  
  /**
   * View analytics state
   */
  logState: () => {
    console.log('=== Analytics State ===')
    console.log('Session ID:', getSessionId())
    console.log('User ID:', getUserId())
    console.log('Referral Data:', getReferralData())
    console.log('Queue Size:', eventQueue.length)
    console.log('Debug Mode:', ANALYTICS_CONFIG.debug)
    console.log('======================')
  }
}

// Expose dev utilities and tracking wrapper in development
if (import.meta.env.DEV) {
  window.VaunticoAnalytics = {
    ...ANALYTICS_DEV,
    
    /**
     * Wrapper for tracking custom events directly via Mixpanel
     * Usage: window.VaunticoAnalytics.trackEvent('event_name', { prop: 'value' })
     */
    trackEvent: (eventName, props = {}) => {
      if (window.mixpanel) {
        window.mixpanel.track(eventName, {
          ...props,
          user_id: getUserId(),
          session_id: getSessionId(),
          timestamp: new Date().toISOString()
        })
        console.log('🎯 Mixpanel Event:', eventName, props)
      } else {
        console.warn('⚠️ Mixpanel not initialized')
      }
    },
    
    /**
     * Set user properties in Mixpanel
     */
    identifyUser: (userId, userProperties = {}) => {
      if (window.mixpanel) {
        window.mixpanel.identify(userId)
        window.mixpanel.people.set(userProperties)
        localStorage.setItem('vauntico_user_id', userId)
        console.log('👤 Mixpanel User Identified:', userId, userProperties)
      }
    },
    
    /**
     * Track user properties
     */
    setUserProperties: (properties) => {
      if (window.mixpanel) {
        window.mixpanel.people.set(properties)
        console.log('👤 Mixpanel User Properties Updated:', properties)
      }
    },
    
    /**
     * Increment user property (e.g., scrolls_read, commands_executed)
     */
    incrementUserProperty: (property, amount = 1) => {
      if (window.mixpanel) {
        window.mixpanel.people.increment(property, amount)
        console.log('📈 Mixpanel Property Incremented:', property, amount)
      }
    }
  }
  
  console.log('📊 Analytics Dev Utils: window.VaunticoAnalytics')
  console.log('🎯 Mixpanel Tracking: window.VaunticoAnalytics.trackEvent(name, props)')
} else {
  // Expose trackEvent in production as well for integrations
  window.VaunticoAnalytics = {
    trackEvent: (eventName, props = {}) => {
      if (window.mixpanel) {
        window.mixpanel.track(eventName, {
          ...props,
          user_id: getUserId(),
          session_id: getSessionId(),
          timestamp: new Date().toISOString()
        })
      }
    },
    
    identifyUser: (userId, userProperties = {}) => {
      if (window.mixpanel) {
        window.mixpanel.identify(userId)
        window.mixpanel.people.set(userProperties)
        localStorage.setItem('vauntico_user_id', userId)
      }
    },
    
    setUserProperties: (properties) => {
      if (window.mixpanel) {
        window.mixpanel.people.set(properties)
      }
    },
    
    incrementUserProperty: (property, amount = 1) => {
      if (window.mixpanel) {
        window.mixpanel.people.increment(property, amount)
      }
    }
  }
}

// Auto-initialize
if (typeof window !== 'undefined') {
  initAnalytics()
}
