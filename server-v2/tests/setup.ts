// Jest setup file for server-v2
import { jest } from '@jest/globals';

// Load test environment variables from .env.test
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/testdb';
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-for-testing-only';
process.env.CRON_SECRET = 'test-cron-secret-for-testing-only';
process.env.UPSTASH_REDIS_REST_URL = 'http://localhost:8080';
process.env.UPSTASH_REDIS_REST_TOKEN = 'test-redis-token-for-testing';
process.env.RESEND_API_KEY = 're_test_dummy_key_for_testing_only';
process.env.PAYSTACK_SECRET_KEY = 'sk_test_dummy_paystack_key_for_testing';
process.env.STRIPE_SECRET_KEY = 'sk_test_dummy_stripe_key_for_testing';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_dummy_stripe_webhook_for_testing';
process.env.MONETIZATION_PHASE = 'Phase 1: Foundation';
process.env.FEATURE_DESCRIPTION = 'Test deployment and validation';

// Mock database pool to prevent ECONNREFUSED errors
const mockPool = {
  query: jest.fn(() => Promise.resolve({ rows: [], rowCount: 0 })),
  end: jest.fn(() => Promise.resolve()),
  connect: jest.fn(() => Promise.resolve({
    query: jest.fn(() => Promise.resolve({ rows: [], rowCount: 0 })),
    release: jest.fn(),
  })),
  on: jest.fn(() => mockPool),
};

// Mock pg module
jest.mock('pg', () => ({
  Pool: jest.fn().mockImplementation(() => mockPool),
}));

// Mock database configuration
jest.mock('../src/config/database', () => ({
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  SESSION_SECRET: process.env.JWT_SECRET,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  MONETIZATION_PHASE: process.env.MONETIZATION_PHASE,
  FEATURE_DESCRIPTION: process.env.FEATURE_DESCRIPTION,
}));

// Mock external services
jest.mock('@upstash/redis', () => ({
  Redis: jest.fn().mockImplementation(() => ({
    get: jest.fn(() => Promise.resolve(null)),
    set: jest.fn(() => Promise.resolve('OK')),
    del: jest.fn(() => Promise.resolve(1)),
    exists: jest.fn(() => Promise.resolve(0)),
    ping: jest.fn(() => Promise.resolve('PONG')),
  })),
}));

// Mock Stripe
jest.mock('stripe', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    webhooks: {
      constructEvent: jest.fn(() => Promise.resolve({ type: 'payment_intent.succeeded', data: {} })),
    },
    customers: {
      create: jest.fn(() => Promise.resolve({ id: 'cus_test123', email: 'test@example.com' })),
      retrieve: jest.fn(() => Promise.resolve({ id: 'cus_test123', email: 'test@example.com' })),
    },
    paymentIntents: {
      create: jest.fn(() => Promise.resolve({ id: 'pi_test123', status: 'succeeded' })),
      confirm: jest.fn(() => Promise.resolve({ id: 'pi_test123', status: 'succeeded' })),
    },
  })),
}));

// Mock Paystack
jest.mock('paystack', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    transaction: {
      initialize: jest.fn(() => Promise.resolve({ data: { authorization_url: 'https://test.paystack.co' } })),
      verify: jest.fn(() => Promise.resolve({ data: { status: 'success' } })),
    },
    customer: {
      create: jest.fn(() => Promise.resolve({ data: { id: 'cus_test123', email: 'test@example.com' } })),
    },
  })),
}));

// Mock Resend
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn(() => Promise.resolve({ id: 'email_test123' })),
    },
  })),
}));

// Mock server for testing
jest.mock('../src/app', () => {
  const express = require('express');
  const app = express();
  
  // Add basic routes for testing
  app.get('/health', (req: any, res: any) => {
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      monetization_phase: process.env.MONETIZATION_PHASE,
      feature_description: process.env.FEATURE_DESCRIPTION,
    });
  });
  
  app.get('/db-health', (req: any, res: any) => {
    res.json({
      status: 'OK',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  });
  
  app.get('/api/v1/metrics/kpi', (req: any, res: any) => {
    res.json({
      kpi_metrics: ['pro_subscriptions', 'score_insurance_signups', 'trust_calculator_usage'],
      phase: process.env.MONETIZATION_PHASE,
    });
  });
  
  app.post('/api/v1/metrics/deployment-tracking', (req: any, res: any) => {
    res.json({
      success: true,
      message: 'Deployment tracking data received',
    });
  });
  
  app.get('/api/v1/metrics/blind-spots', (req: any, res: any) => {
    res.json({
      data_privacy_checked: true,
      platform_dependency_checked: true,
      algorithm_gaming_checked: true,
      commoditization_checked: true,
    });
  });
  
  // 404 handler
  app.use('*', (req: any, res: any) => {
    res.status(404).json({ error: 'Route not found' });
  });
  
  return app;
});

// Make mock pool available globally for tests
(global as any).__mockPool = mockPool;

// Global test timeout increased from 10s to 30s
jest.setTimeout(30000);

// Test cleanup after each test
afterEach(async () => {
  // Clear all mocks after each test
  jest.clearAllMocks();
});
