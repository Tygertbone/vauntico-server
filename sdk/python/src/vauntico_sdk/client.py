"""
Vauntico API Client for Python
"""

import asyncio
from typing import Optional, Dict, Any, Union
import httpx
from .types import (
    VaunticoApiError,
    RateLimitError,
    TrustScoreResponse,
    TrustScoreCalculationRequest,
    TrustScoreCalculationResponse,
    TrendResponse,
    FeaturesResponse,
    User,
    HealthCheck,
    SubscriptionTier,
    Timeframe,
    Granularity,
    FeatureStatus,
    FeatureCategory,
)


class VaunticoApiClient:
    """Async Vauntico API Client"""
    
    def __init__(
        self,
        base_url: str = "https://api.vauntico.com/v1",
        api_key: Optional[str] = None,
        access_token: Optional[str] = None,
        timeout: float = 30.0,
        retries: int = 3,
        headers: Optional[Dict[str, str]] = None
    ):
        self.base_url = base_url
        self.api_key = api_key
        self.access_token = access_token
        self.timeout = timeout
        self.retries = retries
        
        # Setup HTTP client
        self.client = httpx.AsyncClient(
            timeout=timeout,
            headers={
                "Content-Type": "application/json",
                "User-Agent": "vauntico-sdk-python/1.0.0",
                **(headers or {}),
            }
        )
        
        # Add authentication headers
        if api_key:
            self.client.headers["X-API-Key"] = api_key
        elif access_token:
            self.client.headers["Authorization"] = f"Bearer {access_token}"

    def _handle_response_error(self, response: httpx.Response) -> None:
        """Handle API error responses"""
        if response.status_code == 429:
            # Rate limit error
            data = response.json()
            raise RateLimitError(data)
        elif response.status_code >= 400:
            # Other API errors
            try:
                data = response.json()
                if isinstance(data, dict) and "error" in data:
                    raise VaunticoApiError(
                        response=data,
                        code=data.get("code"),
                        correlation_id=data.get("metadata", {}).get("correlationId")
                    )
            except Exception:
                pass
            
            # Generic HTTP error
            raise VaunticoApiError(
                response={"error": f"HTTP {response.status_code}"},
                code="HTTP_ERROR",
                correlation_id=response.headers.get("x-correlation-id")
            )

    async def _make_request(
        self,
        method: str,
        endpoint: str,
        **kwargs
    ) -> Dict[str, Any]:
        """Make HTTP request with error handling"""
        url = f"{self.base_url}{endpoint}"
        
        for attempt in range(self.retries):
            try:
                response = await self.client.request(method, url, **kwargs)
                
                # Check for error status codes
                if response.status_code >= 400:
                    self._handle_response_error(response)
                
                return response.json()
                
            except httpx.HTTPStatusError as e:
                if attempt == self.retries - 1:
                    raise VaunticoApiError(
                        response={"error": f"HTTP error: {str(e)}"},
                        code="HTTP_ERROR"
                    )
                await asyncio.sleep(2 ** attempt)  # Exponential backoff
                
            except httpx.RequestError as e:
                if attempt == self.retries - 1:
                    raise VaunticoApiError(
                        response={"error": f"Network error: {str(e)}"},
                        code="NETWORK_ERROR"
                    )
                await asyncio.sleep(2 ** attempt)
                
            except Exception as e:
                raise VaunticoApiError(
                    response={"error": f"Unknown error: {str(e)}"},
                    code="UNKNOWN_ERROR"
                )

    async def get_trust_score(
        self,
        user_id: str,
        include_factors: bool = True,
        cache: bool = True
    ) -> TrustScoreResponse:
        """Get user trust score"""
        response_data = await self._make_request(
            "GET",
            "/dashboard/trustscore",
            params={
                "userId": user_id,
                "includeFactors": include_factors,
                "cache": cache,
            }
        )
        
        from .types import TrustScoreResponse
        return TrustScoreResponse(**response_data["data"])

    async def calculate_trust_score(
        self,
        request: TrustScoreCalculationRequest
    ) -> TrustScoreCalculationResponse:
        """Trigger trust score calculation"""
        response_data = await self._make_request(
            "POST",
            "/dashboard/trustscore",
            json=request.dict()
        )
        
        from .types import TrustScoreCalculationResponse
        return TrustScoreCalculationResponse(**response_data["data"])

    async def get_trust_score_trends(
        self,
        user_id: str,
        timeframe: Timeframe = Timeframe.DAYS_30,
        granularity: Granularity = Granularity.DAILY,
        include_benchmark: bool = True
    ) -> TrendResponse:
        """Get trust score trends"""
        response_data = await self._make_request(
            "GET",
            "/dashboard/trend",
            params={
                "userId": user_id,
                "timeframe": timeframe.value,
                "granularity": granularity.value,
                "includeBenchmark": include_benchmark,
            }
        )
        
        from .types import TrendResponse
        return TrendResponse(**response_data["data"])

    async def get_user_features(
        self,
        user_id: str,
        category: Optional[FeatureCategory] = None,
        status: Optional[FeatureStatus] = None,
        include_coming_soon: bool = True
    ) -> FeaturesResponse:
        """Get user features"""
        params = {
            "userId": user_id,
            "includeComingSoon": include_coming_soon,
        }
        
        if category:
            params["category"] = category.value
        if status:
            params["status"] = status.value
            
        response_data = await self._make_request(
            "GET",
            "/dashboard/features",
            params=params
        )
        
        from .types import FeaturesResponse
        return FeaturesResponse(**response_data["data"])

    async def get_current_user(self) -> User:
        """Get current user profile"""
        response_data = await self._make_request("GET", "/users/me")
        
        from .types import User
        return User(**response_data["data"])

    async def get_user_by_id(
        self,
        user_id: str,
        include_private: bool = False
    ) -> User:
        """Get user by ID"""
        response_data = await self._make_request(
            "GET",
            f"/users/{user_id}",
            params={"includePrivate": include_private}
        )
        
        from .types import User
        return User(**response_data["data"])

    async def health_check(self) -> HealthCheck:
        """System health check"""
        response_data = await self._make_request("GET", "/health")
        
        from .types import HealthCheck
        return HealthCheck(**response_data["data"])

    def update_config(
        self,
        base_url: Optional[str] = None,
        api_key: Optional[str] = None,
        access_token: Optional[str] = None,
        timeout: Optional[float] = None,
        headers: Optional[Dict[str, str]] = None
    ) -> None:
        """Update client configuration"""
        if base_url is not None:
            self.base_url = base_url
        if api_key is not None:
            self.api_key = api_key
            self.client.headers["X-API-Key"] = api_key
            # Remove Bearer token if switching to API key
            if "Authorization" in self.client.headers:
                del self.client.headers["Authorization"]
        elif access_token is not None:
            self.access_token = access_token
            self.client.headers["Authorization"] = f"Bearer {access_token}"
            # Remove API key if switching to Bearer token
            if "X-API-Key" in self.client.headers:
                del self.client.headers["X-API-Key"]
                
        if timeout is not None:
            self.timeout = timeout
            self.client.timeout = timeout
            
        if headers is not None:
            self.client.headers.update(headers)

    def get_config(self) -> Dict[str, Any]:
        """Get current configuration"""
        return {
            "base_url": self.base_url,
            "api_key": self.api_key,
            "access_token": self.access_token,
            "timeout": self.timeout,
            "retries": self.retries,
        }

    async def close(self) -> None:
        """Close the HTTP client"""
        await self.client.aclose()


# Convenience function for creating client
def create_api_client(
    base_url: str = "https://api.vauntico.com/v1",
    api_key: Optional[str] = None,
    access_token: Optional[str] = None,
    timeout: float = 30.0,
    retries: int = 3,
    headers: Optional[Dict[str, str]] = None
) -> VaunticoApiClient:
    """Create a new Vauntico API client instance"""
    return VaunticoApiClient(
        base_url=base_url,
        api_key=api_key,
        access_token=access_token,
        timeout=timeout,
        retries=retries,
        headers=headers
    )
