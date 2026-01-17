"""
Core API Types based on OpenAPI specification
"""

from typing import Optional, List, Dict, Any, Union, Literal
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum


class SubscriptionTier(str, Enum):
    BRONZE = "bronze"
    SILVER = "silver"
    GOLD = "gold"
    PLATINUM = "platinum"


class FeatureStatus(str, Enum):
    ACTIVE = "active"
    LOCKED = "locked"
    COMING_SOON = "coming-soon"
    DEPRECATED = "deprecated"


class Timeframe(str, Enum):
    DAYS_7 = "7d"
    DAYS_30 = "30d"
    DAYS_90 = "90d"
    YEAR_1 = "1y"


class Granularity(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"


class TrendDirection(str, Enum):
    UP = "up"
    DOWN = "down"
    STABLE = "stable"


class FeatureCategory(str, Enum):
    CONTENT = "content"
    ANALYTICS = "analytics"
    COMMUNITY = "community"
    COMMERCE = "commerce"
    SUPPORT = "support"
    AI = "ai"


class TrustScoreFactors(BaseModel):
    engagement: float
    consistency: float
    quality: float
    community: float


class ResponseMetadata(BaseModel):
    version: str
    timestamp: datetime
    request_id: str = Field(..., alias="requestId")
    processing_time_ms: Optional[int] = Field(None, alias="processingTimeMs")


class ErrorMetadata(BaseModel):
    version: str
    timestamp: datetime
    correlation_id: str = Field(..., alias="correlationId")
    endpoint: Optional[str] = None


class SuccessResponse(BaseModel):
    success: Literal[True]
    data: Dict[str, Any]
    metadata: ResponseMetadata


class ErrorResponse(BaseModel):
    success: Literal[False]
    error: str
    code: str
    details: Optional[Dict[str, Any]] = None
    metadata: ErrorMetadata


class RateLimitErrorResponse(ErrorResponse):
    retry_after: Optional[int] = Field(None, alias="retryAfter")
    limit: Optional[int] = None
    remaining: Optional[int] = None
    reset: Optional[int] = None


class TrustScoreResponse(BaseModel):
    score: float
    tier: SubscriptionTier
    factors: TrustScoreFactors
    calculated_at: datetime = Field(..., alias="calculatedAt")
    expires_at: datetime = Field(..., alias="expiresAt")
    trend: TrendDirection
    change: float
    last_updated: datetime = Field(..., alias="lastUpdated")


class TrustScoreCalculationRequest(BaseModel):
    user_id: str = Field(..., alias="userId")
    force: Optional[bool] = False
    factors: Optional[List[Literal["engagement", "consistency", "quality", "community"]]] = None


class TrustScoreCalculationResponse(BaseModel):
    calculation_id: str = Field(..., alias="calculationId")
    status: Literal["processing", "completed", "failed"]
    estimated_time: int = Field(..., alias="estimatedTime")
    started_at: Optional[datetime] = Field(None, alias="startedAt")


class TrendDataPoint(BaseModel):
    date: str
    score: float
    benchmark: float


class TrendMetadata(BaseModel):
    version: str
    endpoint: str
    generated_at: datetime = Field(..., alias="generatedAt")
    count: int
    average_score: Optional[float] = Field(None, alias="averageScore")
    highest_score: Optional[float] = Field(None, alias="highestScore")
    lowest_score: Optional[float] = Field(None, alias="lowestScore")


class TrendResponse(BaseModel):
    data: List[TrendDataPoint]
    timeframe: str
    metadata: TrendMetadata


class SacredFeature(BaseModel):
    id: str
    name: str
    description: str
    icon: str
    status: FeatureStatus
    sacred_level: SubscriptionTier = Field(..., alias="sacredLevel")
    progress: Optional[float] = None
    unlock_date: Optional[datetime] = Field(None, alias="unlockDate")
    category: Optional[FeatureCategory] = None
    benefits: Optional[List[str]] = None
    requirements: Optional[List[str]] = None


class FeaturesMetadata(BaseModel):
    version: str
    endpoint: str
    generated_at: datetime = Field(..., alias="generatedAt")
    next_unlock_feature: Optional[str] = Field(None, alias="nextUnlockFeature")
    next_unlock_progress: Optional[float] = Field(None, alias="nextUnlockProgress")


class FeaturesResponse(BaseModel):
    features: List[SacredFeature]
    user_level: SubscriptionTier = Field(..., alias="userLevel")
    unlocked_count: int = Field(..., alias="unlockedCount")
    total_count: int = Field(..., alias="totalCount")
    metadata: FeaturesMetadata


class SubscriptionInfo(BaseModel):
    tier: SubscriptionTier
    status: Literal["active", "inactive", "cancelled", "past_due"]
    current_period: Optional[Dict[str, str]] = Field(None, alias="currentPeriod")
    api_quota: Optional[Dict[str, Union[int, float]]] = Field(None, alias="apiQuota")


class User(BaseModel):
    id: str
    email: str
    username: str
    display_name: Optional[str] = Field(None, alias="displayName")
    avatar: Optional[str] = None
    tier: SubscriptionTier
    subscription: Optional[SubscriptionInfo] = None
    created_at: datetime = Field(..., alias="createdAt")
    last_login: Optional[datetime] = Field(None, alias="lastLogin")
    verified: bool


class ServiceHealth(BaseModel):
    status: Literal["up", "down", "degraded"]
    response_time: Optional[float] = Field(None, alias="responseTime")
    last_check: Optional[datetime] = Field(None, alias="lastCheck")


class HealthCheck(BaseModel):
    status: Literal["healthy", "degraded", "unhealthy"]
    timestamp: datetime
    uptime: Optional[int] = None
    services: Dict[str, ServiceHealth]


# Exception Classes
class VaunticoApiError(Exception):
    def __init__(
        self,
        response: Dict[str, Any],
        code: Optional[str] = None,
        correlation_id: Optional[str] = None
    ):
        self.response = response
        self.code = code
        self.correlation_id = correlation_id
        message = response.get("error", "API Error")
        super().__init__(message)
        self.name = "VaunticoApiError"


class RateLimitError(VaunticoApiError):
    def __init__(self, response: Dict[str, Any]):
        super().__init__(response, "RATE_LIMIT_EXCEEDED")
        self.name = "RateLimitError"
        self.retry_after = response.get("retryAfter")
        self.limit = response.get("limit")
        self.remaining = response.get("remaining")
        self.reset = response.get("reset")
