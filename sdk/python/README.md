# Vauntico Python SDK

Official Python client SDK for the Vauntico Trust Score Dashboard API.

## Installation

```bash
pip install vauntico-sdk
```

## Usage

### Basic Setup

```python
from vauntico_sdk import VaunticoApi, Configuration
from vauntico_sdk.api_client import ApiClient
from vauntico_sdk.configuration import Configuration as OpenApiConfig

# Initialize the API client
config = OpenApiConfig(
    host="https://api.vauntico.com/v1",
    # For API key authentication
    api_key={"apiKeyAuth": "your-api-key-here"},
    # Or for JWT authentication
    access_token="your-jwt-token-here"
)

api_client = ApiClient(configuration=config)
api = VaunticoApi(api_client)
```

### Authentication

#### API Key Authentication

```python
config = OpenApiConfig(
    host="https://api.vauntico.com/v1",
    api_key={"apiKeyAuth": "vauntico_live_1234567890abcdef"}
)
```

#### JWT Bearer Authentication

```python
config = OpenApiConfig(
    host="https://api.vauntico.com/v1",
    access_token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
)
```

### Trust Score Examples

#### Get Current Trust Score

```python
async def get_trust_score(user_id: str):
    try:
        response = await api.get_trust_score(
            user_id=user_id,
            include_factors=True,
            cache=True
        )

        print("Trust Score:", response.data)
        print("Score:", response.data.score)
        print("Tier:", response.data.tier)
        print("Factors:", response.data.factors)
    except Exception as error:
        print(f"Error fetching trust score: {error}")
```

#### Trigger Trust Score Calculation

```python
async def calculate_trust_score(user_id: str):
    try:
        request_body = {
            "user_id": user_id,
            "force": True,
            "factors": ["engagement", "quality"]
        }

        response = await api.calculate_trust_score(
            trust_score_calculation_request=request_body
        )

        print("Calculation ID:", response.data.calculation_id)
        print("Status:", response.data.status)
        print("Estimated Time:", response.data.estimated_time)
    except Exception as error:
        print(f"Error calculating trust score: {error}")
```

### Trend Data Examples

#### Get Trust Score Trends

```python
async def get_trends(user_id: str):
    try:
        response = await api.get_trust_score_trends(
            user_id=user_id,
            timeframe="30d",
            granularity="daily",
            include_benchmark=True
        )

        print("Trend Data:", response.data.data)
        print("Timeframe:", response.data.timeframe)
        print("Average Score:", response.data.metadata.average_score)
    except Exception as error:
        print(f"Error fetching trends: {error}")
```

### Features Examples

#### Get User Features

```python
async def get_user_features(user_id: str):
    try:
        response = await api.get_user_features(
            user_id=user_id,
            category="content",
            status="active",
            include_coming_soon=True
        )

        print("Features:", response.data.features)
        print("User Level:", response.data.user_level)
        print("Unlocked Count:", response.data.unlocked_count)
    except Exception as error:
        print(f"Error fetching features: {error}")
```

### User Management Examples

#### Get Current User Profile

```python
async def get_current_user():
    try:
        response = await api.get_current_user()

        print("User Profile:", response.data)
        print("Subscription Tier:", response.data.tier)
        print("API Quota:", response.data.subscription.api_quota)
    except Exception as error:
        print(f"Error fetching user profile: {error}")
```

#### Get User by ID

```python
async def get_user_by_id(user_id: str):
    try:
        response = await api.get_user_by_id(
            user_id=user_id,
            include_private=False
        )

        print("User Info:", response.data)
    except Exception as error:
        print(f"Error fetching user: {error}")
```

### Health Check Example

```python
async def check_health():
    try:
        response = await api.health_check()

        print("System Status:", response.data.status)
        print("Services:", response.data.services)
    except Exception as error:
        print(f"Health check failed: {error}")
```

## Error Handling

The SDK provides structured error handling with proper exception types:

```python
from vauntico_sdk.exceptions import ApiException

try:
    response = await api.get_trust_score(user_id="user_123")
except ApiException as error:
    # API responded with error status
    print(f"API Error: {error.body}")
    print(f"Status Code: {error.status}")

    # Parse error response
    import json
    error_data = json.loads(error.body)
    print(f"Error Code: {error_data.get('code')}")
    print(f"Correlation ID: {error_data.get('metadata', {}).get('correlation_id')}")
except Exception as error:
    # Network or other error
    print(f"Error: {error}")
```

## Rate Limiting

The SDK automatically handles rate limiting responses:

```python
from vauntico_sdk.exceptions import ApiException

try:
    response = await api.get_trust_score(user_id="user_123")
except ApiException as error:
    if error.status == 429:
        import json
        error_data = json.loads(error.body)
        retry_after = error_data.get('retry_after')
        print(f"Rate limited. Retry after {retry_after} seconds")
```

## Subscription Tiers

Access to features is controlled by subscription tiers:

- **Bronze**: Basic trust score access
- **Silver**: Advanced analytics and trends
- **Gold**: Enterprise features and API access
- **Platinum**: Full enterprise suite with priority support

The SDK will return appropriate errors when trying to access features beyond your subscription tier.

## Async vs Sync

The Python SDK supports both async and synchronous operations:

### Async (Recommended)

```python
import asyncio
from vauntico_sdk import VaunticoApi

async def main():
    api = VaunticoApi()
    response = await api.get_trust_score(user_id="user_123")
    print(response.data)

asyncio.run(main())
```

### Sync

```python
from vauntico_sdk import VaunticoApi

api = VaunticoApi()
response = api.get_trust_score(user_id="user_123")
print(response.data)
```

## Development

### Installation from Source

```bash
git clone https://github.com/vauntico/python-sdk.git
cd python-sdk
pip install -e .
```

### Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=vauntico_sdk

# Run specific test
pytest tests/test_trust_score.py
```

### Building

```bash
python setup.py sdist bdist_wheel
```

## Requirements

- Python 3.7+
- httpx (for async HTTP requests)
- pydantic (for data validation)
- typing-extensions (for type hints)

## Support

For API support and documentation, visit:

- [API Documentation](https://docs.vauntico.com/api)
- [Support Portal](https://vauntico.com/support)
- [GitHub Issues](https://github.com/vauntico/python-sdk/issues)

## License

MIT License - see [LICENSE](LICENSE) file for details.
