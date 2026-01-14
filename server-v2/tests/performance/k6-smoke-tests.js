import http from "k6/http";
import { check, sleep } from "k6";
import { Rate } from "k6/metrics";

export const options = {
  stages: [
    { duration: "2m", target: 100 }, // Warm up
    { duration: "5m", target: 200 }, // Load test
    { duration: "3m", target: 300 }, // Stress test
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"], // 95th percentile under 500ms
    http_req_failed: ["rate<0.1"], // Error rate under 10%
    http_reqs: ["rate>100"], // Throughput over 100 RPS
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

export default function () {
  // Test configuration
  const API_KEY = __ENV.API_KEY || "test-valid-key";

  // Test scenarios
  const testScenarios = [
    {
      name: "Health Check",
      weight: 1,
      fn: healthCheckTest,
    },
    {
      name: "Trust Score Retrieval",
      weight: 2,
      fn: trustScoreTest,
    },
    {
      name: "Marketplace Items",
      weight: 2,
      fn: marketplaceTest,
    },
    {
      name: "User Authentication",
      weight: 1,
      fn: authTest,
    },
    {
      name: "API Key Validation",
      weight: 1,
      fn: apiKeyTest,
    },
  ];

  // Run tests with weighted distribution
  testScenarios.forEach((scenario) => {
    scenario.fn();
  });
}

// Health endpoint test
function healthCheckTest() {
  const params = {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
  };

  const responses = http.batch([
    ["GET", `${BASE_URL}/health`, params],
    ["GET", `${BASE_URL}/health`, params],
    ["GET", `${BASE_URL}/health`, params],
    ["GET", `${BASE_URL}/health`, params],
    ["GET", `${BASE_URL}/health`, params],
  ]);

  responses.forEach((response) => {
    check(response, {
      "health endpoint status": response.status === 200,
      "response time < 100ms": response.timings.duration < 100,
      "response structure exists":
        response.json() && typeof response.json() === "object",
    });
  });
}

// Trust score service test
function trustScoreTest() {
  const userId = `test_user_${Math.random().toString(36).substring(2, 10)}`;

  const responses = http.batch([
    [
      "GET",
      `${BASE_URL}/api/trust-score/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    ],
    [
      "GET",
      `${BASE_URL}/api/trust-score/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    ],
    [
      "POST",
      `${BASE_URL}/api/trust-score/calculate`,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          tier: "basic",
        }),
      },
    ],
  ]);

  responses.forEach((response) => {
    check(response, {
      "trust score status": response.status < 400,
      "response time < 300ms": response.timings.duration < 300,
      "valid response structure":
        response.json() && response.json().hasOwnProperty("score"),
    });
  });
}

// Marketplace service test
function marketplaceTest() {
  const responses = http.batch([
    [
      "GET",
      `${BASE_URL}/api/marketplace/items`,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    ],
    [
      "GET",
      `${BASE_URL}/api/marketplace/items`,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    ],
    [
      "POST",
      `${BASE_URL}/api/marketplace/items/search`,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "widget",
          limit: 10,
          offset: 0,
        }),
      },
    ],
  ]);

  responses.forEach((response) => {
    check(response, {
      "marketplace status": response.status < 400,
      "response time < 400ms": response.timings.duration < 400,
      "valid response structure":
        response.json() && Array.isArray(response.json()),
    });
  });
}

// Authentication test
function authTest() {
  const testUser = {
    username: `testuser_${Math.random().toString(36).substring(2, 8)}`,
    email: `test${Math.random().toString(36).substring(2, 8)}@example.com`,
    password: "SecurePass123!",
  };

  const responses = http.batch([
    [
      "POST",
      `${BASE_URL}/api/auth/login`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testUser),
      },
    ],
    [
      "POST",
      `${BASE_URL}/api/auth/register`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: testUser.username,
          email: testUser.email,
          password: testUser.password,
          firstName: "Test",
          lastName: "User",
        }),
      },
    ],
    [
      "GET",
      `${BASE_URL}/api/auth/profile`,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    ],
  ]);

  responses.forEach((response) => {
    check(response, {
      "auth status": [200, 201].includes(response.status),
      "response time < 200ms": response.timings.duration < 200,
      "auth response structure":
        response.json() &&
        (response.json().hasOwnProperty("token") ||
          response.json().hasOwnProperty("user")),
    });
  });
}

// API key validation test
function apiKeyTest() {
  const invalidKey = "invalid-key-123";

  const responses = http.batch([
    [
      "GET",
      `${BASE_URL}/api/marketplace/items`,
      {
        headers: {
          Authorization: `Bearer ${invalidKey}`,
          "Content-Type": "application/json",
        },
      },
    ],
    [
      "POST",
      `${BASE_URL}/api/trust-score/calculate`,
      {
        headers: {
          Authorization: `Bearer ${invalidKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: "test_user",
          tier: "basic",
        }),
      },
    ],
    [
      "GET",
      `${BASE_URL}/api/protected-resource`,
      {
        headers: {
          Authorization: `Bearer ${invalidKey}`,
          "Content-Type": "application/json",
        },
      },
    ],
  ]);

  responses.forEach((response) => {
    check(response, {
      "invalid key rejected": response.status === 401,
      "error response structure":
        response.json() && response.json().hasOwnProperty("error"),
      "security headers present":
        response.headers && response.headers["X-Rate-Limit-Remaining"],
    });
  });
}

// Custom metrics collection
export function handleSummary(data) {
  return {
    data: data,
    metrics: {
      total_requests: data.length,
      failed_requests: data.filter((r) => r.status >= 400).length,
      avg_response_time:
        data.reduce((sum, r) => sum + r.timings.duration, 0) / data.length,
      p95_response_time: data.sort(
        (a, b) => a.timings.duration - b.timings.duration
      )[Math.floor(data.length * 0.95)].timings.duration,
      requests_per_second:
        data.length /
        (data[data.length - 1].timings.duration - data[0].timings.duration),
    },
  };
}
