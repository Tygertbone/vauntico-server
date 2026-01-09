import { Request, Response, NextFunction } from 'express';
import { TrustScoreService } from '../services/trustScoreService';

// API Key storage - In production, this would be stored securely
// For Phase 2 demo, we'll use a simple in-memory store
const API_KEYS = new Map<string, { tier: string; usageCount: number; lastUsed: Date }>();

// Initialize with some demo API keys
API_KEYS.set('basic_key_xyz123', { tier: 'basic', usageCount: 0, lastUsed: new Date() });
API_KEYS.set('pro_key_abc456', { tier: 'pro', usageCount: 0, lastUsed: new Date() });
API_KEYS.set('enterprise_key_def789', { tier: 'enterprise', usageCount: 0, lastUsed: new Date() });

// Rate limiting storage
const RATE_LIMITS = new Map<string, { count: number; resetTime: Date }>();

export const authenticateApiKey = async (apiKey: string | string[]): Promise<boolean> => {
  if (!apiKey) return false;
  
  // Handle string array case for headers
  const apiKeyStr = Array.isArray(apiKey) ? apiKey[0] : apiKey;
  const keyData = API_KEYS.get(apiKeyStr);
  if (!keyData) return false;
  
  // Update usage tracking
  keyData.usageCount++;
  keyData.lastUsed = new Date();
  API_KEYS.set(apiKeyStr, keyData);
  
  return true;
};

export const validateSubscriptionTier = async (apiKey: string | string[], userId: string): Promise<string | null> => {
  // Handle string array case for headers
  const apiKeyStr = Array.isArray(apiKey) ? apiKey[0] : apiKey;
  const keyData = API_KEYS.get(apiKeyStr);
  if (!keyData) return null;
  
  return keyData.tier;
};

export const checkRateLimit = async (apiKey: string | string[], endpoint: string): Promise<{ allowed: boolean; message?: string }> => {
  // Handle string array case for headers
  const apiKeyStr = Array.isArray(apiKey) ? apiKey[0] : apiKey;
  const keyData = API_KEYS.get(apiKeyStr);
  if (!keyData) return { allowed: false, message: 'Invalid API key' };
  
  const rateLimitKey = `${apiKeyStr}:${endpoint}`;
  const now = new Date();
  const currentLimit = RATE_LIMITS.get(rateLimitKey);
  
  // Define rate limits per tier
  const rateLimits = {
    basic: { requests: 100, windowMs: 60000 }, // 100 requests per minute
    pro: { requests: 1000, windowMs: 60000 }, // 1000 requests per minute
    enterprise: { requests: 10000, windowMs: 60000 } // 10000 requests per minute
  };
  
  const tierLimit = rateLimits[keyData.tier as keyof typeof rateLimits];
  
  // Reset window if expired
  if (!currentLimit || now.getTime() - currentLimit.resetTime.getTime() > tierLimit.windowMs) {
    RATE_LIMITS.set(rateLimitKey, { count: 1, resetTime: now });
    return { allowed: true };
  }
  
  // Check if over limit
  if (currentLimit.count >= tierLimit.requests) {
    return { allowed: false, message: 'Rate limit exceeded' };
  }
  
  // Increment counter
  currentLimit.count++;
  RATE_LIMITS.set(rateLimitKey, currentLimit);
  
  return { allowed: true };
};

// Middleware for API key authentication and rate limiting
export const apiAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'API key required'
    });
  }
  
  // Handle string array case for headers
  const apiKeyStr = Array.isArray(apiKey) ? apiKey[0] : apiKey;
  if (!await authenticateApiKey(apiKeyStr)) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid API key'
    });
  }
  
  // Add user and tier info to request for later use
  const keyData = API_KEYS.get(apiKeyStr);
  req.user = { 
    userId: apiKeyStr, 
    email: `${apiKeyStr}@api-user.com`, // Placeholder email for API key users
    subscriptionTier: keyData?.tier || 'basic' 
  };
  
  next();
};

// Check if user can access specific feature based on tier
export const checkFeatureAccess = (userTier: string, requiredTier: string): boolean => {
  const tiers = ['basic', 'pro', 'enterprise'];
  const userTierIndex = tiers.indexOf(userTier);
  const requiredTierIndex = tiers.indexOf(requiredTier);
  
  return userTierIndex >= requiredTierIndex;
};