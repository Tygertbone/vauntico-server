import request from 'supertest';
import app from '../src/app';

// Mock database for testing
const mockPool = {
  query: jest.fn().mockResolvedValue([]),
  end: jest.fn().mockResolvedValue(),
  on: jest.fn().mockImplementation(() => mockPool),
};

// Mock environment variables
const mockEnv = {
  DATABASE_URL: 'postgresql://test:test@localhost:5432/testdb',
  JWT_SECRET: 'test-jwt-secret',
  SESSION_SECRET: 'test-session-secret'
  RESEND_API_KEY: 'test-resend-key',
  PAYSTACK_SECRET_KEY: 'test-paystack-secret',
  STRIPE_SECRET_KEY: 'test-stripe-secret',
  STRIPE_WEBHOOK_SECRET: 'test-stripe-webhook-secret',
  MONETIZATION_PHASE: 'Phase 1: Foundation',
  FEATURE_DESCRIPTION: 'Test deployment'
};

// Add to global test setup
beforeAll(async () => {
  // Mock database pool for all tests
  jest.mock('../src/database', () => ({
    getPool: jest.fn().mockReturnValue(mockPool),
  }));

  // Mock environment variables
  jest.mock('../src/config/database', () => ({
    DATABASE_URL: mockEnv.DATABASE_URL,
    JWT_SECRET: mockEnv.JWT_SECRET,
    SESSION_SECRET: mockEnv.SESSION_SECRET,
    RESEND_API_KEY: mockEnv.RESEND_API_KEY,
    PAYSTACK_SECRET_KEY: mockEnv.PAYSTACK_SECRET_KEY,
    STRIPE_SECRET_KEY: mockEnv.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: mockEnv.STRIPE_WEBHOOK_SECRET,
  MONETIZATION_PHASE: mockEnv.MONETIZATION_PHASE,
    FEATURE_DESCRIPTION: mockEnv.FEATURE_DESCRIPTION,
  }));

  // Mock environment for app
  jest.mock('../src/app', () => ({
    config: {
      DATABASE_URL: mockEnv.DATABASE_URL,
      JWT_SECRET: mockEnv.JWT_SECRET,
      SESSION_SECRET: mockEnv.SESSION_SECRET,
      RESEND_API_KEY: mockEnv.RESEND_API_KEY,
      PAYSTACK_SECRET_KEY: mockEnv.PAYSTACK_SECRET_KEY,
      STRIPE_SECRET_KEY: mockEnv.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: mockEnv.STRIPE_WEBHOOK_SECRET,
      MONETIZATION_PHASE: mockEnv.MONETIZATION_PHASE,
      FEATURE_DESCRIPTION: mockEnv.FEATURE_DESCRIPTION,
    }
  }));
});

// Add to global test cleanup
afterAll(async () => {
  // Clear all mocks
  jest.clearAllMocks();
  
  // Close database connections if they exist
  if (mockPool.end) {
    await mockPool.end();
  }
});

describe('Application Tests', () => {
  test('should respond to health check', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
    
    expect(response.body).toHaveProperty('status');
  });

  test('should return 404 for unknown routes', async () => {
    const response = await request(app)
      .get('/unknown-route')
      .expect(404);
  });

  test('should handle health check with database connectivity', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
    
    expect(response.body).toHaveProperty('status');
    expect(response.body.status).toBe('OK');
  });

  test('should handle database connectivity gracefully', async () => {
    // Mock database connection failure for this test
    jest.mock('../src/database', () => ({
      getPool: jest.fn().mockImplementation(() => {
        query: jest.fn().mockRejectedValue(new Error('Database connection failed')),
        end: jest.fn().mockImplementation(() => mockPool),
      }),
    }));

    const response = await request(app)
      .get('/db-health')
      .expect(200);
    
    expect(response.body).toHaveProperty('status');
    expect(response.body.message).toContain('Database not connected');
  });

  test('should return 500 when server errors', async () => {
    // Mock server error
    jest.mock('../src/app', () => ({
      get: jest.fn().mockImplementation(() => {
        listen: jest.fn().mockRejectedValue(new Error('Server crashed')),
      }),
    }));

    const response = await request(app)
      .get('/health')
      .expect(500);
    
    expect(response.body).toHaveProperty('error');
    expect(response.status).toBe(500);
  });

  test('should validate monetization context is extracted correctly', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
    
    expect(response.body).toHaveProperty('status');
    expect(response.body.monetization_phase).toBe('Phase 1: Foundation');
  });

  test('should validate KPI endpoints are accessible', async () => {
    const response = await request(app)
      .get('/api/v1/metrics/kpi')
      .expect(200);
    
    expect(response.body).toHaveProperty('kpi_metrics');
    expect(response.body.kpi_metrics).toContain('pro_subscriptions');
  });

  test('should handle deployment tracking payload', async () => {
    const deploymentPayload = {
      deployment_id: 'test-deployment-123',
      monetization_phase: 'Phase 1: Foundation',
      feature_description: 'Test deployment',
      phase_target: '100K MRR from creators',
      kpi_metrics: 'pro_subscriptions,score_insurance_signups,trust_calculator_usage',
      blind_spots: 'data_privacy,platform_dependency',
      deployment_timestamp: new Date().toISOString(),
      github_sha: 'test-sha-123',
      github_ref: 'refs/heads/main',
      github_actor: 'test-user'
    };

    const response = await request(app)
      .post('/api/v1/metrics/deployment-tracking')
      .send(deploymentPayload)
      .expect(200);
    
    expect(response.body).toHaveProperty('success');
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Deployment tracking data received');
  });

  test('should validate blind spot mitigations are checked', async () => {
    const response = await request(app)
      .get('/api/v1/metrics/blind-spots')
      .expect(200);
    
    expect(response.body).toHaveProperty('data_privacy_checked');
    expect(response.body).toHaveProperty('platform_dependency_checked');
    expect(response.body).toHaveProperty('algorithm_gaming_checked');
    expect(response.body).toHaveProperty('commoditization_checked');
  });

  test('should handle authentication failure gracefully', async () => {
    // Mock authentication failure
    jest.mock('../src/middleware/auth', () => ({
      verifyToken: jest.fn().mockRejectedValue(new Error('Invalid token')),
    }));

    const response = await request(app)
      .get('/health')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
    
    expect(response.body).toHaveProperty('error');
    expect(response.status).toBe(401);
  });

  test('should handle rate limiting gracefully', async () => {
    // Mock rate limiting
    jest.mock('../src/middleware/rateLimit', () => ({
      checkRateLimit: jest.fn().mockRejectedValue(new Error('Rate limit exceeded')),
    }));

    const response = await request(app)
      .get('/health')
      .expect(429);
    
    expect(response.body).toHaveProperty('error');
    expect(response.status).toBe(429);
  });
});