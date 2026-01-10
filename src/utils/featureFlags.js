/**
 * Feature Flag System for Vauntico
 * Enables gradual rollout and A/B testing of new features
 */

const featureFlags = {
  // Dual-personality platform features with gradual rollout
  dualPersonalityHomepage: {
    enabled: true,
    rolloutPercentage: 10,  // Start with 10% of users
    audiences: ['new-visitors']  // Only new visitors first
  },

  enterpriseApiDocs: {
    enabled: true,
    rolloutPercentage: 100  // Can go 100% immediately (new page)
  },

  routeAliases: {
    enabled: true,
    rolloutPercentage: 100  // Safe to enable (backward compatible)
  },

  sacredFeaturesShowcase: {
    enabled: true,
    rolloutPercentage: 10   // Gradual rollout
  },

  trustScoreCalculator: {
    enabled: true,
    rolloutPercentage: 100  // Core feature, always available
  },

  // Legacy flags for backward compatibility
  DUAL_PERSONALITY_PLATFORM: true,
  CREATOR_FIRST_HOMEPAGE: true,
  TRUST_SCORE_CALCULATOR: true,
  SACRED_FEATURES_SHOWCASE: true,
  ENTERPRISE_API_DOCS: true,

  // Route alias features (now enabled)
  ROUTE_ALIASES: true,
  TRUST_LINEAGE_ALIAS: true,
  CREDIBILITY_CIRCLES_ALIAS: true,   // Now enabled
  NARRATIVE_ENGINE_ALIAS: true,      // Now enabled
  COMMUNITY_RESONANCE_ALIAS: true,   // Now enabled

  // Analytics and tracking
  ANALYTICS_TRACKING: true,
  ROUTE_ALIAS_ANALYTICS: true,
  FEATURE_USAGE_ANALYTICS: true
};

/**
 * Check if a feature is enabled
 * @param {string} featureName - Name of the feature to check
 * @returns {boolean} - True if feature is enabled
 */
export function isFeatureEnabled(featureName) {
  const flag = featureFlags[featureName];

  // Handle new structured flags
  if (typeof flag === 'object' && flag !== null) {
    return flag.enabled || false;
  }

  // Handle legacy boolean flags
  return flag || false;
};

/**
 * Check if a feature is enabled for a specific user (with rollout percentage)
 * @param {string} featureName - Name of the feature to check
 * @param {string} userId - User ID for rollout percentage calculation
 * @param {string} audience - User audience (optional)
 * @returns {boolean} - True if feature is enabled for this user
 */
export function isFeatureEnabledForUser(featureName, userId, audience = null) {
  const flag = featureFlags[featureName];

  // Handle new structured flags
  if (typeof flag === 'object' && flag !== null) {
    if (!flag.enabled) return false;

    // Check audience if specified
    if (audience && flag.audiences && !flag.audiences.includes(audience)) {
      return false;
    }

    // Check rollout percentage
    if (flag.rolloutPercentage && flag.rolloutPercentage < 100) {
      return isUserInTestGroup(userId, featureName, flag.rolloutPercentage);
    }

    return true;
  }

  // Handle legacy boolean flags
  return flag || false;
};

/**
 * Set feature flag value
 * @param {string} featureName - Name of the feature
 * @param {boolean} enabled - Enable/disable the feature
 */
export function setFeatureFlag(featureName, enabled) {
  if (featureFlags.hasOwnProperty(featureName)) {
    featureFlags[featureName] = enabled;
  } else {
    console.warn(`Feature flag '${featureName}' does not exist`);
  }
};

/**
 * Get all feature flags
 * @returns {Object} - All feature flags and their status
 */
export function getAllFeatureFlags() {
  return { ...featureFlags };
};

/**
 * Check if user is in A/B test group
 * @param {string} userId - User ID
 * @param {string} testName - A/B test name
 * @param {number} percentage - Percentage of users to include (0-100)
 * @returns {boolean} - True if user is in test group
 */
export function isUserInTestGroup(userId, testName, percentage = 50) {
  if (!userId || percentage <= 0) return false;
  if (percentage >= 100) return true;

  // Simple hash-based determination for consistent grouping
  const hash = simpleHash(`${userId}-${testName}`);
  return hash % 100 < percentage;
};

/**
 * Simple hash function for consistent A/B testing
 * @param {string} str - String to hash
 * @returns {number} - Hash value
 */
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

/**
 * Feature flag context for React components
 * @returns {Object} - Feature flag context
 */
export function getFeatureFlagContext() {
  return {
    isFeatureEnabled,
    isUserInTestGroup,
    featureFlags: getAllFeatureFlags()
  };
};

// Export for CommonJS compatibility
module.exports = {
  isFeatureEnabled,
  isFeatureEnabledForUser,
  setFeatureFlag,
  getAllFeatureFlags,
  isUserInTestGroup,
  getFeatureFlagContext
};
