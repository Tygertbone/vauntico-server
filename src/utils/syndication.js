/**
 * Vauntico Syndication & Sharing Utilities
 * Phase 5: Shareable links, referral codes, embed snippets
 */

import { trackScrollShare, trackReferralGenerated, trackEmbedGenerated } from './analytics'
import { getCreatorPassTier } from './pricing'

// ============================================================================
// REFERRAL CODE GENERATION
// ============================================================================

/**
 * Generate unique referral code for user
 */
export const generateReferralCode = (userId = null) => {
  const user = userId || localStorage.getItem('vauntico_user_id') || 'anon'
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 7)
  
  // Format: USER-TIMESTAMP-RANDOM (e.g., "TYRONE-K8X9-A7B2")
  const code = `${user.substring(0, 6).toUpperCase()}-${timestamp.substring(0, 4).toUpperCase()}-${random.toUpperCase()}`
  
  // Store in localStorage
  const existingCode = localStorage.getItem('vauntico_my_referral_code')
  if (!existingCode) {
    localStorage.setItem('vauntico_my_referral_code', code)
  }
  
  return existingCode || code
}

/**
 * Get user's referral code (or create if doesn't exist)
 */
export const getMyReferralCode = () => {
  let code = localStorage.getItem('vauntico_my_referral_code')
  if (!code) {
    code = generateReferralCode()
  }
  return code
}

// ============================================================================
// SHAREABLE LINK GENERATION
// ============================================================================

/**
 * Generate shareable link for a scroll
 */
export const generateScrollShareLink = (scrollId, scrollTitle, includeReferral = true) => {
  const baseUrl = window.location.origin
  const path = `/lore`
  
  const params = new URLSearchParams()
  params.set('scroll', scrollId)
  
  if (includeReferral) {
    const referralCode = getMyReferralCode()
    params.set('ref', referralCode)
  }
  
  const shareUrl = `${baseUrl}${path}?${params.toString()}`
  
  return {
    url: shareUrl,
    shortUrl: shareUrl, // TODO: Implement URL shortening service
    scrollId,
    scrollTitle,
    referralCode: includeReferral ? getMyReferralCode() : null
  }
}

/**
 * Generate Creator Pass referral link
 */
export const generateCreatorPassReferralLink = () => {
  const baseUrl = window.location.origin
  const referralCode = getMyReferralCode()
  
  const params = new URLSearchParams()
  params.set('ref', referralCode)
  params.set('utm_source', 'referral')
  params.set('utm_medium', 'creator_pass')
  params.set('utm_campaign', 'affiliate')
  
  const shareUrl = `${baseUrl}/creator-pass?${params.toString()}`
  
  trackReferralGenerated(referralCode, 'creator_pass')
  
  return {
    url: shareUrl,
    referralCode,
    commission: getCommissionRate()
  }
}

/**
 * Get commission rate based on tier
 */
const getCommissionRate = () => {
  const tierData = getCreatorPassTier()
  
  if (!tierData) return 0
  
  const rates = {
    starter: 5,
    pro: 10,
    legacy: 15
  }
  
  return rates[tierData.tier] || 0
}

// ============================================================================
// SOCIAL SHARE FUNCTIONS
// ============================================================================

/**
 * Share scroll on Twitter/X
 */
export const shareOnTwitter = (scrollId, scrollTitle) => {
  const { url } = generateScrollShareLink(scrollId, scrollTitle)
  const text = `Check out this scroll: ${scrollTitle} on @Vauntico`
  
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
  
  trackScrollShare(scrollId, scrollTitle, 'twitter')
  window.open(twitterUrl, '_blank', 'width=550,height=420')
}

/**
 * Share scroll on LinkedIn
 */
export const shareOnLinkedIn = (scrollId, scrollTitle) => {
  const { url } = generateScrollShareLink(scrollId, scrollTitle)
  
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
  
  trackScrollShare(scrollId, scrollTitle, 'linkedin')
  window.open(linkedInUrl, '_blank', 'width=550,height=420')
}

/**
 * Copy share link to clipboard
 */
export const copyShareLink = async (scrollId, scrollTitle) => {
  const { url } = generateScrollShareLink(scrollId, scrollTitle)
  
  try {
    await navigator.clipboard.writeText(url)
    trackScrollShare(scrollId, scrollTitle, 'copy_link')
    return { success: true, url }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Failed to copy link:', error)
    }
    return { success: false, error }
  }
}

// ============================================================================
// EMBED SNIPPET GENERATION
// ============================================================================

/**
 * Generate iframe embed code for scroll
 */
export const generateIframeEmbed = (scrollId, scrollTitle, options = {}) => {
  const {
    width = '100%',
    height = '600px',
    theme = 'light',
    showHeader = true
  } = options
  
  const baseUrl = window.location.origin
  const embedUrl = `${baseUrl}/embed/scroll/${scrollId}?theme=${theme}&header=${showHeader}`
  
  const embedCode = `<iframe 
  src="${embedUrl}" 
  width="${width}" 
  height="${height}" 
  frameborder="0" 
  allow="clipboard-write" 
  title="${scrollTitle}"
  style="border: 1px solid #e5e7eb; border-radius: 8px;"
></iframe>`
  
  trackEmbedGenerated(scrollId, scrollTitle, 'iframe')
  
  return {
    embedCode,
    embedUrl,
    scrollId,
    scrollTitle
  }
}

/**
 * Generate JavaScript widget embed
 */
export const generateWidgetEmbed = (scrollId, scrollTitle, options = {}) => {
  const {
    theme = 'light',
    width = 'auto',
    height = 'auto'
  } = options
  
  const baseUrl = window.location.origin
  
  const embedCode = `<div id="vauntico-scroll-${scrollId}"></div>
<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${baseUrl}/embed/widget.js';
    script.setAttribute('data-scroll-id', '${scrollId}');
    script.setAttribute('data-theme', '${theme}');
    script.setAttribute('data-width', '${width}');
    script.setAttribute('data-height', '${height}');
    document.head.appendChild(script);
  })();
</script>`
  
  trackEmbedGenerated(scrollId, scrollTitle, 'widget')
  
  return {
    embedCode,
    scrollId,
    scrollTitle
  }
}

/**
 * Generate preview card embed (for agency presentations)
 */
export const generatePreviewCard = (scrollId, scrollTitle, scrollDescription, tier) => {
  const { url } = generateScrollShareLink(scrollId, scrollTitle, false)
  
  const embedCode = `<div class="vauntico-preview-card" style="
  max-width: 400px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  background: white;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
">
  <div style="display: flex; align-items: center; margin-bottom: 12px;">
    <span style="font-size: 24px; margin-right: 8px;">📜</span>
    <span style="
      font-size: 10px;
      font-weight: 600;
      color: #6366f1;
      text-transform: uppercase;
      letter-spacing: 1px;
    ">${tier} Scroll</span>
  </div>
  <h3 style="
    font-size: 18px;
    font-weight: 700;
    margin: 0 0 8px 0;
    color: #111827;
  ">${scrollTitle}</h3>
  <p style="
    font-size: 14px;
    color: #6b7280;
    margin: 0 0 16px 0;
    line-height: 1.5;
  ">${scrollDescription}</p>
  <a href="${url}" style="
    display: inline-block;
    padding: 10px 20px;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: white;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 600;
    font-size: 14px;
  ">View Scroll →</a>
</div>`
  
  trackEmbedGenerated(scrollId, scrollTitle, 'preview_card')
  
  return {
    embedCode,
    scrollId,
    scrollTitle
  }
}

// ============================================================================
// TIER PREVIEW LOGIC
// ============================================================================

/**
 * Generate tier preview for shared links
 */
export const generateTierPreview = (requiredTier, userTier = null) => {
  const tierInfo = {
    starter: {
      emoji: '⚔️',
      name: 'Starter',
      message: 'This scroll is available with the Starter tier or higher'
    },
    pro: {
      emoji: '🏰',
      name: 'Pro',
      message: 'This scroll is available with the Pro tier or higher'
    },
    legacy: {
      emoji: '👑',
      name: 'Legacy',
      message: 'This scroll is available with the Legacy tier'
    },
    free: {
      emoji: '📖',
      name: 'Free',
      message: 'This scroll is freely available'
    }
  }
  
  const info = tierInfo[requiredTier] || tierInfo.free
  const canAccess = checkTierAccess(requiredTier, userTier)
  
  return {
    ...info,
    requiredTier,
    userTier,
    canAccess,
    needsUpgrade: !canAccess
  }
}

/**
 * Check if user tier allows access
 */
const checkTierAccess = (requiredTier, userTier) => {
  if (!requiredTier || requiredTier === 'free') return true
  if (!userTier) return false
  
  const tierHierarchy = {
    free: 0,
    starter: 1,
    pro: 2,
    legacy: 3
  }
  
  return tierHierarchy[userTier] >= tierHierarchy[requiredTier]
}

// ============================================================================
// AGENCY PARTNER UTILITIES
// ============================================================================

/**
 * Generate agency demo kit
 */
export const generateAgencyDemoKit = (agencyName, scrollIds = []) => {
  const referralCode = getMyReferralCode()
  const baseUrl = window.location.origin
  
  // Generate individual scroll links
  const scrollLinks = scrollIds.map(id => ({
    scrollId: id,
    url: `${baseUrl}/lore?scroll=${id}&ref=${referralCode}&utm_source=agency&utm_medium=demo&utm_campaign=${agencyName}`
  }))
  
  // Generate demo package
  const demoPackage = {
    agencyName,
    referralCode,
    commission: getCommissionRate(),
    scrollLinks,
    dashboardUrl: `${baseUrl}/dashboard?ref=${referralCode}`,
    creatorPassUrl: `${baseUrl}/creator-pass?ref=${referralCode}`,
    brandingAssets: `${baseUrl}/assets/branding-kit.zip`,
    apiDocs: `${baseUrl}/docs/api`
  }
  
  trackReferralGenerated(referralCode, 'agency_demo')
  
  return demoPackage
}

/**
 * Generate white-label configuration
 */
export const generateWhiteLabelConfig = (agencyConfig) => {
  const {
    agencyName,
    agencyLogo,
    primaryColor = '#6366f1',
    secondaryColor = '#8b5cf6',
    domain = null
  } = agencyConfig
  
  return {
    branding: {
      name: agencyName,
      logo: agencyLogo,
      colors: {
        primary: primaryColor,
        secondary: secondaryColor
      }
    },
    domain: domain || `${agencyName.toLowerCase().replace(/\s+/g, '')}.vauntico.com`,
    referralCode: getMyReferralCode(),
    customCSS: `
      :root {
        --brand-primary: ${primaryColor};
        --brand-secondary: ${secondaryColor};
      }
      .vault-gradient {
        background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%);
      }
    `
  }
}

// ============================================================================
// EXPORT UTILITIES
// ============================================================================

/**
 * Export referral analytics for user
 */
export const exportReferralStats = () => {
  const referralCode = getMyReferralCode()
  const tierData = getCreatorPassTier()
  
  // TODO: Fetch from actual API
  const mockStats = {
    referralCode,
    tier: tierData?.tier || 'free',
    commission: getCommissionRate(),
    stats: {
      clicks: 0,
      signups: 0,
      conversions: 0,
      earnings: 0
    },
    links: {
      creatorPass: generateCreatorPassReferralLink().url,
      dashboard: `${window.location.origin}/?ref=${referralCode}`
    }
  }
  
  return mockStats
}

// ============================================================================
// DEV UTILITIES
// ============================================================================

export const SYNDICATION_DEV = {
  generateTestLink: (scrollId = 'test-scroll') => {
    return generateScrollShareLink(scrollId, 'Test Scroll', true)
  },
  
  getMyCode: () => {
    return getMyReferralCode()
  },
  
  resetCode: () => {
    localStorage.removeItem('vauntico_my_referral_code')
    if (import.meta.env.DEV) {
      console.log('Referral code reset')
    }
  },
  
  viewStats: () => {
    const stats = exportReferralStats()
    if (import.meta.env.DEV) {
      console.log('=== Syndication Stats ===')
      console.log('Referral Code:', stats.referralCode)
      console.log('Commission Rate:', stats.commission + '%')
      console.log('Creator Pass Link:', stats.links.creatorPass)
      console.log('========================')
    }
    return stats
  }
}

if (import.meta.env.DEV) {
  window.VaunticoSyndication = SYNDICATION_DEV
  console.log('🔗 Syndication Dev Utils: window.VaunticoSyndication')
}
