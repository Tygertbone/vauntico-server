"""
Vauntico Python SDK
Official Python client SDK for the Vauntico Trust Score Dashboard API
"""

from .client import VaunticoApiClient, create_api_client
from .types import (
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
    VaunticoApiError,
    RateLimitError,
)

__version__ = "1.0.0"
__author__ = "Vauntico Team"
__email__ = "api-support@vauntico.com"

__all__ = [
    # Classes
    "VaunticoApiClient",
    "create_api_client",
    
    # Enums
    "SubscriptionTier",
    "FeatureStatus", 
    "Timeframe",
    "Granularity",
    "TrendDirection",
    "FeatureCategory",
    
    # Models
    "TrustScoreFactors",
    "ResponseMetadata",
    "ErrorMetadata",
    "SuccessResponse",
    "ErrorResponse",
    "RateLimitErrorResponse",
    "TrustScoreResponse",
    "TrustScoreCalculationRequest",
    "TrustScoreCalculationResponse",
    "TrendDataPoint",
    "TrendMetadata",
    "TrendResponse",
    "SacredFeature",
    "FeaturesMetadata",
    "FeaturesResponse",
    "SubscriptionInfo",
    "User",
    "ServiceHealth",
    "HealthCheck",
    
    # Exceptions
    "VaunticoApiError",
    "RateLimitError",
]
