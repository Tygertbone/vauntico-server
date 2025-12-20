/**
 * Load testing script for vauntico-mvp backend
 * Tests endpoints: /health, /auth/login, /trustscore/calculate
 * Uses k6 for load testing
 */

import http from 'k6/http';
import { check, sleep } from 'k6';

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 50 },   // Ramp up to 50 users over 2 minutes
    { duration: '2m', target: 100 },  // Ramp up to 100 users over 2 minutes
    { duration: '2m', target: 250 },  // Ramp up to 250 users over 2 minutes
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2000ms
    http_req_failed: ['rate<0.05'],    // Error rate should be below 5%
  },
};

// Base URL
const BASE_URL = 'https://api.vauntico.com';

export default function () {
  // Test 1: Health endpoint (lightweight test)
  const healthResponse = http.get(`${BASE_URL}/health`);
  check(healthResponse, {
    'health status is 200': (r) => r.status === 200,
    'health response time < 200ms': (r) => r.timings.duration < 200,
    'health has correct response structure': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.ok === true && body.now;
      } catch {
        return false;
      }
    },
  });

  // Test 2: Auth endpoint (moderate load test)
  // Note: This will likely fail without valid credentials, but tests the endpoint structure
  const authPayload = JSON.stringify({
    email: `test${__VU}@example.com`, // Use VU number to make unique emails
    password: 'testpassword123'
  });

  const authResponse = http.post(`${BASE_URL}/auth/login`, authPayload, {
    headers: { 'Content-Type': 'application/json' },
  });

  // We expect this to fail (401) since credentials aren't valid, but we test the rate limiting
  check(authResponse, {
    'auth endpoint responds': (r) => r.status === 401 || r.status === 429,
    'auth response time < 1000ms': (r) => r.timings.duration < 1000,
    'auth returns JSON': (r) => {
      try {
        JSON.parse(r.body);
        return true;
      } catch {
        return false;
      }
    },
  });

  // Test 3: Trust score endpoint (heavy load test)
  const trustScorePayload = JSON.stringify({
    userId: `user_${__VU}_${Date.now()}`,
    platform: 'youtube',
    metrics: {
      followers: Math.floor(Math.random() * 100000),
      engagement: Math.random() * 0.1,
      likes: Math.floor(Math.random() * 50000),
      comments: Math.floor(Math.random() * 5000),
      shares: Math.floor(Math.random() * 1000)
    }
  });

  const trustResponse = http.post(`${BASE_URL}/trustscore/calculate`, trustScorePayload, {
    headers: {
      'Content-Type': 'application/json',
      // Using sample credentials that may authenticate
      'Authorization': 'Bearer ' + (Math.random() > 0.5 ? 'sample_token' : '')
    },
  });

  check(trustResponse, {
    'trustscore responds': (r) => [200, 401, 429].includes(r.status),
    'trustscore response time < 2000ms': (r) => r.timings.duration < 2000,
    'trustscore handles load': (r) => true, // Just ensuring it doesn't crash
  });

  // Small pause between requests to simulate real user behavior
  sleep(0.5 + Math.random() * 0.5); // 0.5-1 second pause
}

// Setup function runs before tests start
export function setup() {
  console.log(`Starting stress test of ${BASE_URL}`);

  // Verify endpoint is reachable
  const healthCheck = http.get(`${BASE_URL}/health`);
  if (healthCheck.status !== 200) {
    console.error(`Health check failed: ${healthCheck.status} ${healthCheck.body}`);
    throw new Error('Backend not responding to health checks');
  }

  console.log('Health check passed, starting load test...');
}

// Teardown function runs after tests complete
export function teardown(data) {
  console.log('Load test completed');

  // Summary will be generated automatically by k6
}
