# Vauntico TypeScript SDK

Official TypeScript client SDK for the Vauntico Trust Score Dashboard API.

## Installation

```bash
npm install vauntico-sdk
```

## Usage

### Basic Setup

```typescript
import { VaunticoApi, Configuration } from "vauntico-sdk";

// Initialize the API client
const configuration = new Configuration({
  basePath: "https://api.vauntico.com/v1",
  // For API key authentication
  apiKey: "your-api-key-here",
  // Or for JWT authentication
  headers: {
    Authorization: "Bearer your-jwt-token-here",
  },
});

const api = new VaunticoApi(configuration);
```

### Authentication

#### API Key Authentication

```typescript
const configuration = new Configuration({
  basePath: "https://api.vauntico.com/v1",
  apiKey: "vauntico_live_1234567890abcdef",
});
```

#### JWT Bearer Authentication

```typescript
const configuration = new Configuration({
  basePath: "https://api.vauntico.com/v1",
  headers: {
    Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  },
});
```

### Trust Score Examples

#### Get Current Trust Score

```typescript
async function getTrustScore(userId: string) {
  try {
    const response = await api.getTrustScore({
      userId,
      includeFactors: true,
      cache: true,
    });

    console.log("Trust Score:", response.data);
    console.log("Score:", response.data.score);
    console.log("Tier:", response.data.tier);
    console.log("Factors:", response.data.factors);
  } catch (error) {
    console.error("Error fetching trust score:", error);
  }
}
```

#### Trigger Trust Score Calculation

```typescript
async function calculateTrustScore(userId: string) {
  try {
    const response = await api.calculateTrustScore({
      userId,
      force: true,
      factors: ["engagement", "quality"],
    });

    console.log("Calculation ID:", response.data.calculationId);
    console.log("Status:", response.data.status);
    console.log("Estimated Time:", response.data.estimatedTime);
  } catch (error) {
    console.error("Error calculating trust score:", error);
  }
}
```

### Trend Data Examples

#### Get Trust Score Trends

```typescript
async function getTrends(userId: string) {
  try {
    const response = await api.getTrustScoreTrends({
      userId,
      timeframe: "30d",
      granularity: "daily",
      includeBenchmark: true,
    });

    console.log("Trend Data:", response.data.data);
    console.log("Timeframe:", response.data.timeframe);
    console.log("Average Score:", response.data.metadata.averageScore);
  } catch (error) {
    console.error("Error fetching trends:", error);
  }
}
```

### Features Examples

#### Get User Features

```typescript
async function getUserFeatures(userId: string) {
  try {
    const response = await api.getUserFeatures({
      userId,
      category: "content",
      status: "active",
      includeComingSoon: true,
    });

    console.log("Features:", response.data.features);
    console.log("User Level:", response.data.userLevel);
    console.log("Unlocked Count:", response.data.unlockedCount);
  } catch (error) {
    console.error("Error fetching features:", error);
  }
}
```

### User Management Examples

#### Get Current User Profile

```typescript
async function getCurrentUser() {
  try {
    const response = await api.getCurrentUser();

    console.log("User Profile:", response.data);
    console.log("Subscription Tier:", response.data.tier);
    console.log("API Quota:", response.data.subscription.apiQuota);
  } catch (error) {
    console.error("Error fetching user profile:", error);
  }
}
```

#### Get User by ID

```typescript
async function getUserById(userId: string) {
  try {
    const response = await api.getUserById({
      userId,
      includePrivate: false,
    });

    console.log("User Info:", response.data);
  } catch (error) {
    console.error("Error fetching user:", error);
  }
}
```

### Health Check Example

```typescript
async function checkHealth() {
  try {
    const response = await api.healthCheck();

    console.log("System Status:", response.data.status);
    console.log("Services:", response.data.services);
  } catch (error) {
    console.error("Health check failed:", error);
  }
}
```

## Error Handling

The SDK provides structured error handling with proper error types:

```typescript
try {
  const response = await api.getTrustScore({ userId: "user_123" });
} catch (error) {
  if (error.response) {
    // API responded with error status
    console.error("API Error:", error.response.data);
    console.error("Error Code:", error.response.data.code);
    console.error(
      "Correlation ID:",
      error.response.data.metadata.correlationId,
    );
  } else if (error.request) {
    // Network error
    console.error("Network Error:", error.message);
  } else {
    // Other error
    console.error("Error:", error.message);
  }
}
```

## Rate Limiting

The SDK automatically handles rate limiting responses:

```typescript
try {
  const response = await api.getTrustScore({ userId: "user_123" });
} catch (error) {
  if (error.response?.status === 429) {
    const retryAfter = error.response.data.retryAfter;
    console.log(`Rate limited. Retry after ${retryAfter} seconds`);
  }
}
```

## Subscription Tiers

Access to features is controlled by subscription tiers:

- **Bronze**: Basic trust score access
- **Silver**: Advanced analytics and trends
- **Gold**: Enterprise features and API access
- **Platinum**: Full enterprise suite with priority support

The SDK will return appropriate errors when trying to access features beyond your subscription tier.

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

## Support

For API support and documentation, visit:

- [API Documentation](https://docs.vauntico.com/api)
- [Support Portal](https://vauntico.com/support)
- [GitHub Issues](https://github.com/vauntico/typescript-sdk/issues)

## License

MIT License - see [LICENSE](LICENSE) file for details.
