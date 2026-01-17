// Core API Types based on OpenAPI specification

export type SubscriptionTier = "bronze" | "silver" | "gold" | "platinum";
export type FeatureStatus = "active" | "locked" | "coming-soon" | "deprecated";
export type Timeframe = "7d" | "30d" | "90d" | "1y";
export type Granularity = "daily" | "weekly" | "monthly";
export type TrendDirection = "up" | "down" | "stable";
export type FeatureCategory =
  | "content"
  | "analytics"
  | "community"
  | "commerce"
  | "support"
  | "ai";

export interface TrustScoreFactors {
  engagement: number;
  consistency: number;
  quality: number;
  community: number;
}

export interface ResponseMetadata {
  version: string;
  timestamp: string;
  requestId: string;
  processingTimeMs?: number;
}

export interface ErrorMetadata {
  version: string;
  timestamp: string;
  correlationId: string;
  endpoint?: string;
}

export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  metadata: ResponseMetadata;
}

export interface ErrorResponse {
  success: false;
  error: string;
  code: string;
  details?: Record<string, any>;
  metadata: ErrorMetadata;
}

export interface RateLimitErrorResponse extends ErrorResponse {
  retryAfter?: number;
  limit?: number;
  remaining?: number;
  reset?: number;
}

export interface TrustScoreResponse {
  score: number;
  tier: SubscriptionTier;
  factors: TrustScoreFactors;
  calculatedAt: string;
  expiresAt: string;
  trend: TrendDirection;
  change: number;
  lastUpdated: string;
}

export interface TrustScoreCalculationRequest {
  userId: string;
  force?: boolean;
  factors?: ("engagement" | "consistency" | "quality" | "community")[];
}

export interface TrustScoreCalculationResponse {
  calculationId: string;
  status: "processing" | "completed" | "failed";
  estimatedTime: number;
  startedAt?: string;
}

export interface TrendDataPoint {
  date: string;
  score: number;
  benchmark: number;
}

export interface TrendMetadata {
  version: string;
  endpoint: string;
  generatedAt: string;
  count: number;
  averageScore?: number;
  highestScore?: number;
  lowestScore?: number;
}

export interface TrendResponse {
  data: TrendDataPoint[];
  timeframe: string;
  metadata: TrendMetadata;
}

export interface SacredFeature {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: FeatureStatus;
  sacredLevel: SubscriptionTier;
  progress?: number;
  unlockDate?: string;
  category?: FeatureCategory;
  benefits?: string[];
  requirements?: string[];
}

export interface FeaturesMetadata {
  version: string;
  endpoint: string;
  generatedAt: string;
  nextUnlockFeature?: string;
  nextUnlockProgress?: number;
}

export interface FeaturesResponse {
  features: SacredFeature[];
  userLevel: SubscriptionTier;
  unlockedCount: number;
  totalCount: number;
  metadata: FeaturesMetadata;
}

export interface SubscriptionInfo {
  tier: SubscriptionTier;
  status: "active" | "inactive" | "cancelled" | "past_due";
  currentPeriod?: {
    start: string;
    end: string;
  };
  apiQuota?: {
    limit: number;
    used: number;
    reset: number;
  };
}

export interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  avatar?: string;
  tier: SubscriptionTier;
  subscription?: SubscriptionInfo;
  createdAt: string;
  lastLogin?: string;
  verified: boolean;
}

export interface ServiceHealth {
  status: "up" | "down" | "degraded";
  responseTime?: number;
  lastCheck?: string;
}

export interface HealthCheck {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  uptime?: number;
  services: {
    database?: ServiceHealth;
    redis?: ServiceHealth;
    api?: ServiceHealth;
  };
}

// API Request/Response Types
export interface GetTrustScoreParams {
  userId: string;
  includeFactors?: boolean;
  cache?: boolean;
}

export interface GetTrustScoreTrendsParams {
  userId: string;
  timeframe?: Timeframe;
  granularity?: Granularity;
  includeBenchmark?: boolean;
}

export interface GetUserFeaturesParams {
  userId: string;
  category?: FeatureCategory;
  status?: FeatureStatus;
  includeComingSoon?: boolean;
}

export interface GetUserByIdParams {
  userId: string;
  includePrivate?: boolean;
}

// Configuration Types
export interface ApiConfiguration {
  basePath?: string;
  apiKey?: string;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

// Error Classes
export class VaunticoApiError extends Error {
  constructor(
    public response: any,
    public code?: string,
    public correlationId?: string,
  ) {
    super(response?.error || "API Error");
    this.name = "VaunticoApiError";
  }
}

export class RateLimitError extends VaunticoApiError {
  public retryAfter?: number;
  public limit?: number;
  public remaining?: number;
  public reset?: number;

  constructor(response: any) {
    super(response, "RATE_LIMIT_EXCEEDED");
    this.name = "RateLimitError";
    this.retryAfter = response.retryAfter;
    this.limit = response.limit;
    this.remaining = response.remaining;
    this.reset = response.reset;
  }
}
