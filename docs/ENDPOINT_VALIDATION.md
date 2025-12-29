# Vauntico Endpoint Validation Guide

## Overview
This guide provides validation scripts and procedures for testing Vauntico's API endpoints before and after production deployment.

## Prerequisites

### Test Environment Setup
```bash
# Install dependencies
npm install -g artillery@latest
npm install -g newman@latest  # For Postman collection testing

# Clone repository
git clone https://github.com/vauntico/vauntico-mvp.git
cd vauntico-mvp

# Install project dependencies
npm install  # Frontend
cd server-v2 && npm install  # Backend
cd ../vauntico-fulfillment-engine && npm install  # Fulfillment
```

## Health Check Validation

### Script: `validate-health-endpoints.js`
```javascript
const axios = require('axios');

async function validateHealthEndpoints() {
  const services = {
    backend: 'http://localhost:3001/health',
    fulfillment: 'http://localhost:5000/api/status',
    frontend: 'http://localhost:5173/health'  // Dev mode only
  };

  console.log('🔍 Validating service health endpoints...\n');

  for (const [service, url] of Object.entries(services)) {
    try {
      const response = await axios.get(url, { timeout: 5000 });
      console.log(`✅ ${service}: ${response.status} - ${JSON.stringify(response.data)}`);
    } catch (error) {
      console.log(`❌ ${service}: ${error.code || 'ERROR'} - ${error.message}`);
    }
  }
}

validateHealthEndpoints();
```

**Expected Results:**
```
🔍 Validating service health endpoints...

✅ backend: 200 - {"status":"healthy","version":"2.0.0","uptime":"1h 23m"}
✅ fulfillment: 200 - {"status":"ok","message":"Vauntico Fulfillment Engine is live"}
✅ frontend: 200 - {"buildVersion":"abc123","timestamp":"2025-12-05T14:30:00Z"}
```

## Security Validation

### Authentication Tests

**1. Test secure Claude endpoint (should fail without API key)**
```bash
curl -X POST http://localhost:5000/api/claude/complete \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello world", "maxTokens": 100}'

# Expected: 401 Unauthorized - "Missing or invalid API key"
```

**2. Test webhook signature validation (invalid signature)**
```bash
curl -X POST http://localhost:5000/webhook \
  -H "svix-signature: invalid_signature" \
  -H "svix-timestamp: 1234567890" \
  -H "Content-Type: application/json" \
  -d '{"type": "email.delivered", "id": "test123"}'

# Expected: 401 Unauthorized - "Invalid webhook signature"
```

**3. Test CORS restrictions**
```bash
curl -X GET http://localhost:5173/ \
  -H "Origin: https://malicious-site.com"

# Expected: No 'Access-Control-Allow-Origin: https://malicious-site.com' header
```

## Functional Tests

### Trust Score API Validation
```bash
# Test trust score calculation (requires auth)
curl -X GET "http://localhost:3001/trust-score" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected: 200 OK with trust score data
```

### Payment Flow Validation
```javascript
// Test PayStack integration
const PAYSTACK_PUBLIC_KEY = process.env.VITE_PAYSTACK_PUBLIC_KEY;
console.log('PayStack Key Loaded:', PAYSTACK_PUBLIC_KEY ? '✅' : '❌');

// Expected: ✅ PayStack key loads correctly
```

## Performance Benchmarking

### Artillery Load Testing Script
Create file: `tests/load-test.yml`
```yaml
config:
  target: 'http://localhost:3001'
  phases:
    - duration: 60
      arrivalRate: 10  # 10 requests/second
      name: "Warm up phase"
    - duration: 120
      arrivalRate: 20  # 20 requests/second
      name: "Sustain phase"
  defaults:
    headers:
      Authorization: 'Bearer YOUR_TEST_JWT'

scenarios:
  - name: 'Trust Score API Load Test'
    weight: 60
    requests:
      - get:
          url: '/trust-score'

  - name: 'Health Check Load Test'
    weight: 40
    requests:
      - get:
          url: '/health'
```

**Run Load Test:**
```bash
npx artillery run tests/load-test.yml --output results.json
npx artillery report results.json
```

**Expected Performance Metrics:**
- Response time: <500ms (95th percentile)
- Error rate: <1%
- Throughput: 15-20 RPS sustained

## Database Validation

### Connection Test
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database connected:', result.rows[0]);
    client.release();
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
  } finally {
    pool.end();
  }
}

testConnection();
```

### Migration Validation
```bash
cd server-v2
node scripts/migrate.js

# Expected: All migrations apply successfully without errors
```

## Redis/Queue Validation

### Upstash Redis Test
```javascript
const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL
});

async function testRedis() {
  try {
    await redis.set('test:key', 'test_value');
    const value = await redis.get('test:key');
    console.log('✅ Redis working:', value === 'test_value');
  } catch (err) {
    console.error('❌ Redis failed:', err.message);
  }
}

testRedis();
```

## Monitoring Validation

### Sentry Error Tracking Test
```javascript
import Sentry from '@sentry/node';

async function testErrorReporting() {
  try {
    throw new Error('Test error for Sentry validation');
  } catch (error) {
    Sentry.captureException(error);
    console.log('✅ Error sent to Sentry');
  }
}

testErrorReporting();
```

### Logging Validation
```javascript
// Check Winston logging
const logger = require('./server-v2/src/utils/logger');

logger.info('Test log entry');
logger.error('Test error entry');

// Expected: Logs appear in console and file outputs
```

## Automated Validation Pipeline

### GitHub Actions Validation
```yaml
# .github/workflows/pre-deploy-validation.yml
name: Pre-Deploy Validation
on:
  pull_request:
    branches: [ main ]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm install

      - name: Run health checks
        run: node docs/scripts/validate-health-endpoints.js

      - name: Run security tests
        run: npm run test:security

      - name: Run performance benchmark
        run: npx artillery run docs/scripts/load-test.yml
```

## Success Criteria

### All validations must pass:
- ✅ **100%** of health endpoints respond successfully
- ✅ **0%** of authentication bypass attempts succeed
- ✅ **<500ms** average API response time
- ✅ **<1%** error rate under normal load
- ✅ **All** database connections established
- ✅ **All** external services accessible
- ✅ **Security** headers properly configured
- ✅ **Monitoring** events captured and forwarded

---

*Last Updated: December 2025*
*Validation Version: 2.0.0*
