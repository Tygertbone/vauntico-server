// Main export file for Vauntico TypeScript SDK
export { VaunticoApiClient, createApiClient } from "./client";
export type {
  SubscriptionTier,
  FeatureStatus,
  Timeframe,
  Granularity,
  TrendDirection,
  FeatureCategory,
  TrustScoreFactors,
  ResponseMetadata,
  ErrorMetadata,
  SuccessResponse,
  ErrorResponse,
  RateLimitErrorResponse,
  TrustScoreResponse,
  TrustScoreCalculationRequest,
  TrustScoreCalculationResponse,
  TrendDataPoint,
  TrendMetadata,
  TrendResponse,
  SacredFeature,
  FeaturesMetadata,
  FeaturesResponse,
  SubscriptionInfo,
  User,
  ServiceHealth,
  HealthCheck,
  GetTrustScoreParams,
  GetTrustScoreTrendsParams,
  GetUserFeaturesParams,
  GetUserByIdParams,
  ApiConfiguration,
  VaunticoApiError,
  RateLimitError,
} from "./types";

// Default export for convenience
export { VaunticoApiClient as default } from "./client";
