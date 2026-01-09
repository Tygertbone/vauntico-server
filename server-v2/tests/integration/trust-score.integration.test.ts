import request from 'supertest';
import app from '../../src/app';

describe('Trust Score Integration Tests', () => {
  let authToken: string;
  let testUserId: string;

  beforeAll(async () => {
    // Setup test user and get auth token
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: 'testpassword123'
      });

    if (loginResponse.status === 200) {
      authToken = loginResponse.body.token;
      testUserId = loginResponse.body.user.id;
    }
  });

  test('should calculate trust score for authenticated user', async () => {
    const trustData = {
      platform: 'twitter',
      username: 'testuser',
      includePrivateData: false
    };

    const response = await request(app)
      .post('/api/v1/trust-score/calculate')
      .set('Authorization', `Bearer ${authToken}`)
      .send(trustData)
      .expect(200);

    expect(response.body).toHaveProperty('trustScore');
    expect(response.body).toHaveProperty('factors');
    expect(response.body.trustScore).toBeGreaterThanOrEqual(0);
    expect(response.body.trustScore).toBeLessThanOrEqual(100);
  });

  test('should retrieve trust score history', async () => {
    const response = await request(app)
      .get('/api/v1/trust-score/history')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('scores');
    expect(Array.isArray(response.body.scores)).toBe(true);
  });

  test('should handle trust score calculation with different platforms', async () => {
    const platforms = ['twitter', 'linkedin', 'github'];

    for (const platform of platforms) {
      const trustData = {
        platform,
        username: `testuser_${platform}`,
        includePrivateData: false
      };

      const response = await request(app)
        .post('/api/v1/trust-score/calculate')
        .set('Authorization', `Bearer ${authToken}`)
        .send(trustData)
        .expect(200);

      expect(response.body).toHaveProperty('trustScore');
      expect(response.body).toHaveProperty('platform');
      expect(response.body.platform).toBe(platform);
    }
  });

  test('should validate trust score factors are calculated correctly', async () => {
    const trustData = {
      platform: 'twitter',
      username: 'testuser',
      includePrivateData: true
    };

    const response = await request(app)
      .post('/api/v1/trust-score/calculate')
      .set('Authorization', `Bearer ${authToken}`)
      .send(trustData)
      .expect(200);

    expect(response.body).toHaveProperty('factors');
    expect(response.body.factors).toHaveProperty('accountAge');
    expect(response.body.factors).toHaveProperty('followerCount');
    expect(response.body.factors).toHaveProperty('engagementRate');
    expect(response.body.factors).toHaveProperty('contentQuality');
  });

  test('should handle trust score export functionality', async () => {
    const exportData = {
      format: 'pdf',
      includeDetailedFactors: true
    };

    const response = await request(app)
      .post('/api/v1/trust-score/export')
      .set('Authorization', `Bearer ${authToken}`)
      .send(exportData)
      .expect(200);

    expect(response.body).toHaveProperty('exportUrl');
    expect(response.body).toHaveProperty('expiresAt');
  });

  test('should validate blind spot mitigations for trust scores', async () => {
    const response = await request(app)
      .get('/api/v1/metrics/blind-spots')
      .expect(200);

    expect(response.body).toHaveProperty('data_privacy_checked');
    expect(response.body).toHaveProperty('platform_dependency_checked');
    expect(response.body).toHaveProperty('algorithm_gaming_checked');

    // Trust score specific checks
    expect(response.body.data_privacy_checked).toBe(true);
    expect(response.body.platform_dependency_checked).toBe(true);
  });

  test('should track trust calculator usage in KPIs', async () => {
    // First trigger a trust score calculation
    await request(app)
      .post('/api/v1/trust-score/calculate')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        platform: 'twitter',
        username: 'testuser',
        includePrivateData: false
      });

    // Then check KPI metrics
    const response = await request(app)
      .get('/api/v1/metrics/kpi')
      .expect(200);

    expect(response.body).toHaveProperty('kpi_metrics');
    expect(response.body.kpi_metrics).toHaveProperty('trust_calculator_usage');
    expect(response.body.kpi_metrics.trust_calculator_usage).toBeGreaterThan(0);
  });

  test('should handle trust score comparison between platforms', async () => {
    const comparisonData = {
      platforms: [
        { platform: 'twitter', username: 'testuser' },
        { platform: 'linkedin', username: 'testuser' }
      ]
    };

    const response = await request(app)
      .post('/api/v1/trust-score/compare')
      .set('Authorization', `Bearer ${authToken}`)
      .send(comparisonData)
      .expect(200);

    expect(response.body).toHaveProperty('comparison');
    expect(response.body.comparison).toHaveProperty('platforms');
    expect(Array.isArray(response.body.comparison.platforms)).toBe(true);
    expect(response.body.comparison.platforms).toHaveLength(2);
  });

  test('should validate trust score decay over time', async () => {
    // Calculate initial score
    const initialResponse = await request(app)
      .post('/api/v1/trust-score/calculate')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        platform: 'twitter',
        username: 'testuser',
        includePrivateData: false
      });

    const initialScore = initialResponse.body.trustScore;

    // Simulate time passing and recalculate
    // Note: In a real test, you might mock the time or use a time manipulation library
    const updatedResponse = await request(app)
      .post('/api/v1/trust-score/calculate')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        platform: 'twitter',
        username: 'testuser',
        includePrivateData: false
      });

    const updatedScore = updatedResponse.body.trustScore;

    // Score should be similar (decay would happen over longer periods)
    expect(Math.abs(initialScore - updatedScore)).toBeLessThan(10);
  });

  test('should handle trust score calculation errors gracefully', async () => {
    const invalidData = {
      platform: 'invalid_platform',
      username: '',
      includePrivateData: false
    };

    const response = await request(app)
      .post('/api/v1/trust-score/calculate')
      .set('Authorization', `Bearer ${authToken}`)
      .send(invalidData)
      .expect(400);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('Invalid platform or username');
  });
});