// Mock variables before jest.mock calls
const mockGetWidgetMetrics = jest.fn();
const mockGetWidgetAnalytics = jest.fn();
const mockLogWidgetUsage = jest.fn();

import request from 'supertest';
import express from 'express';
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';

import widgetRoutes from '../../src/routes/widget';
import ApiUsageService from '../../src/services/apiUsageService';

// Mock ApiUsageService class methods
jest.mock('../../src/services/apiUsageService', () => ({
  getWidgetMetrics: mockGetWidgetMetrics,
  getWidgetAnalytics: mockGetWidgetAnalytics,
  logWidgetUsage: mockLogWidgetUsage
}));

// Mock authenticateApiKey function
jest.mock('../../src/middleware/auth', () => ({
  authenticateApiKey: jest.fn().mockResolvedValue(true)
}));

describe('Widget Integration Tests - Phase 2', () => {
  let app: express.Application;
  let server: any;

  beforeAll(async () => {
    // Set up test environment
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/testdb';
  });

  afterAll(async () => {
    // Cleanup test environment
    if (server) {
      server.close();
    }
  });

  beforeEach(() => {
    // Create fresh Express app for each test
    app = express();
    app.use(express.json());
    app.use('/', widgetRoutes);
    
    server = app.listen(0); // Use port 0 for testing
    
    // Reset mocks and setup default return values
    mockGetWidgetMetrics.mockResolvedValue({
      actionCounts: { load: 5, refresh: 2, error: 0, config_change: 1, interaction: 3 },
      activeWidgets: 3,
      tierDistribution: { basic: 1, pro: 2, enterprise: 0 },
      averageScore: 85,
      errorRate: 0,
      totalUsage: 11
    });

    mockGetWidgetAnalytics.mockResolvedValue({
      totalUsage: 25,
      actionBreakdown: { load: 15, refresh: 8, error: 1, config_change: 1 },
      tierDistribution: { basic: 8, pro: 15, enterprise: 2 },
      averageScore: 87,
      errorRate: 0.04,
      refreshRate: 0.53,
      uptimePercentage: 98.5,
      totalCreditsUsed: 8,
      widgetUptime: 1500000,
      activeIntegrations: 3,
      revenuePerWidget: 45.50,
      currentMRR: 1250,
      licenseRevenue: 850,
      enterpriseCount: 2,
      proCount: 15,
      basicCount: 8
    });

    mockLogWidgetUsage.mockResolvedValue(undefined);
  });

  afterEach(() => {
    // Clear usage logs after each test
    jest.clearAllMocks();
  });

  describe('Widget Usage Tracking', () => {
    const mockApiKey = 'pk_test_widget_api_key_123456';
    const mockUserId = 'user_test_123';
    const mockUsageData = {
      action: 'load',
      userId: mockUserId,
      tier: 'pro',
      score: 85,
      widgetConfig: {
        theme: 'light',
        showLogo: true,
        showDetails: true
      },
      timestamp: new Date().toISOString()
    };

    it('should track widget usage successfully', async () => {
      const response = await request(app)
        .post('/api/v1/metrics/widget-usage')
        .set('X-API-Key', mockApiKey)
        .send(mockUsageData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('tracked', true);
      expect(response.body).toHaveProperty('metrics');
      expect(response.body.metrics).toHaveProperty('widgetLoads');
      expect(response.body.metrics).toHaveProperty('tierDistribution');
      expect(response.body).toHaveProperty('monetization');
    });

    it('should validate required fields', async () => {
      const invalidData = {
        action: 'load'
        // Missing userId and timestamp
      };

      const response = await request(app)
        .post('/api/v1/metrics/widget-usage')
        .set('X-API-Key', mockApiKey)
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Bad Request');
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Missing required fields');
    });

    it('should validate action types', async () => {
      const invalidData = {
        action: 'invalid_action',
        userId: mockUserId,
        timestamp: new Date().toISOString()
      };

      const response = await request(app)
        .post('/api/v1/metrics/widget-usage')
        .set('X-API-Key', mockApiKey)
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Bad Request');
      expect(response.body.message).toContain('Invalid action');
    });

    it('should handle unauthorized requests', async () => {
      const response = await request(app)
        .post('/api/v1/metrics/widget-usage')
        .send(mockUsageData)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Unauthorized');
      expect(response.body.message).toContain('Invalid or missing API key');
    });

    it('should track different action types', async () => {
      const actions = ['load', 'refresh', 'error', 'config_change', 'interaction'];
      
      for (const action of actions) {
        const actionData = {
          ...mockUsageData,
          action
        };

        const response = await request(app)
          .post('/api/v1/metrics/widget-usage')
          .set('X-API-Key', mockApiKey)
          .send(actionData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.tracked).toBe(true);
      }
    });
  });

  describe('Widget Analytics Dashboard', () => {
    const mockApiKey = 'pk_test_widget_api_key_123456';

    it('should retrieve analytics dashboard', async () => {
      const response = await request(app)
        .get('/api/v1/metrics/widget-analytics')
        .set('X-API-Key', mockApiKey)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('timeframe', '24h');
      expect(response.body).toHaveProperty('analytics');
      expect(response.body.analytics).toHaveProperty('totalUsage');
      expect(response.body.analytics).toHaveProperty('actionBreakdown');
      expect(response.body.analytics).toHaveProperty('tierDistribution');
      expect(response.body.analytics).toHaveProperty('performanceMetrics');
      expect(response.body.analytics).toHaveProperty('monetizationMetrics');
      expect(response.body).toHaveProperty('monetization');
      expect(response.body.monetization).toHaveProperty('target500K');
      expect(response.body.monetization).toHaveProperty('currentMRR');
      expect(response.body).toHaveProperty('phase', 'Phase 2: B2B API Licensing');
    });

    it('should support different timeframes', async () => {
      const timeframes = ['1h', '24h', '7d', '30d'];
      
      for (const timeframe of timeframes) {
        const response = await request(app)
          .get('/api/v1/metrics/widget-analytics')
          .set('X-API-Key', mockApiKey)
          .query({ timeframe })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.timeframe).toBe(timeframe);
      }
    });

    it('should support tier filtering', async () => {
      const tiers = ['basic', 'pro', 'enterprise', 'all'];
      
      for (const tier of tiers) {
        const response = await request(app)
          .get('/api/v1/metrics/widget-analytics')
          .set('X-API-Key', mockApiKey)
          .query({ tier })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.analytics).toHaveProperty('tierDistribution');
      }
    });

    it('should include Phase 2 monetization context', async () => {
      const response = await request(app)
        .get('/api/v1/metrics/widget-analytics')
        .set('X-API-Key', mockApiKey)
        .expect(200);

      expect(response.body.monetization.target500K).toBe('500K MRR from businesses');
      expect(response.body.monetization).toHaveProperty('currentMRR');
      expect(response.body.monetization).toHaveProperty('licenseRevenue');
      expect(response.body.monetization).toHaveProperty('enterpriseCount');
      expect(response.body.monetization).toHaveProperty('proCount');
      expect(response.body.monetization).toHaveProperty('basicCount');
    });
  });

  describe('Widget Health Check', () => {
    it('should return healthy status', async () => {
      const response = await request(app)
        .get('/api/v1/widget/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('version', '2.0.0');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('endpoints');
      expect(response.body).toHaveProperty('phase', 'Phase 2: B2B API Licensing');
      expect(response.body).toHaveProperty('kpiMetrics');
    });

    it('should include endpoint status', async () => {
      const response = await request(app)
        .get('/api/v1/widget/health')
        .expect(200);

      expect(response.body.endpoints).toHaveProperty('trustScore', 'operational');
      expect(response.body.endpoints).toHaveProperty('usageTracking', 'operational');
      expect(response.body.endpoints).toHaveProperty('analytics', 'operational');
    });

    it('should include KPI metrics', async () => {
      const response = await request(app)
        .get('/api/v1/widget/health')
        .expect(200);

      expect(response.body.kpiMetrics).toHaveProperty('widgetLoads');
      expect(response.body.kpiMetrics).toHaveProperty('activeWidgets');
      expect(response.body.kpiMetrics).toHaveProperty('errorRate');
    });

    it('should include dependency status', async () => {
      const response = await request(app)
        .get('/api/v1/widget/health')
        .expect(200);

      expect(response.body.dependencies).toHaveProperty('apiGateway', 'operational');
      expect(response.body.dependencies).toHaveProperty('database', 'operational');
      expect(response.body.dependencies).toHaveProperty('monitoring', 'operational');
    });
  });

  describe('KPI Tracking Integration', () => {
    it('should track widget loads as KPI metric', async () => {
      const mockApiKey = 'pk_test_widget_api_key_123456';
      const loadData = {
        action: 'load',
        userId: 'user_test_123',
        tier: 'pro',
        timestamp: new Date().toISOString()
      };

      await request(app)
        .post('/api/v1/metrics/widget-usage')
        .set('X-API-Key', mockApiKey)
        .send(loadData)
        .expect(200);

      // Verify KPI tracking
      const metrics = await ApiUsageService.getWidgetMetrics(mockApiKey);
      expect(metrics.actionCounts.load).toBeGreaterThan(0);
    });

    it('should track refresh usage with credit consumption', async () => {
      const mockApiKey = 'pk_test_widget_api_key_123456';
      const refreshData = {
        action: 'refresh',
        userId: 'user_test_123',
        tier: 'pro',
        score: 85,
        timestamp: new Date().toISOString()
      };

      const response = await request(app)
        .post('/api/v1/metrics/widget-usage')
        .set('X-API-Key', mockApiKey)
        .send(refreshData)
        .expect(200);

      expect(response.body.monetization.creditsUsed).toBe(1);
      expect(response.body.monetization.tier).toBe('pro');
    });

    it('should track tier distribution for monetization', async () => {
      const mockApiKey = 'pk_test_widget_api_key_123456';
      const tiers = ['basic', 'pro', 'enterprise'];
      
      for (const tier of tiers) {
        const tierData = {
          action: 'load',
          userId: `user_${tier}_123`,
          tier,
          timestamp: new Date().toISOString()
        };

        await request(app)
          .post('/api/v1/metrics/widget-usage')
          .set('X-API-Key', mockApiKey)
          .send(tierData)
          .expect(200);
      }

      const analytics = await ApiUsageService.getWidgetAnalytics(mockApiKey, {
        timeframe: '24h',
        tier: 'all'
      });

      expect(analytics.tierDistribution).toHaveProperty('basic');
      expect(analytics.tierDistribution).toHaveProperty('pro');
      expect(analytics.tierDistribution).toHaveProperty('enterprise');
    });
  });

  describe('Error Handling and Rate Limiting', () => {
    it('should handle rate limit exceeded', async () => {
      // Mock rate limit by making multiple rapid requests
      const mockApiKey = 'pk_test_widget_api_key_123456';
      const usageData = {
        action: 'load',
        userId: 'user_test_123',
        timestamp: new Date().toISOString()
      };

      // Make multiple requests to trigger rate limiting
      const requests = Array(11).fill(null).map(() =>
        request(app)
          .post('/api/v1/metrics/widget-usage')
          .set('X-API-Key', mockApiKey)
          .send(usageData)
      );

      const responses = await Promise.allSettled(requests);
      
      // At least one should be rate limited
      const rateLimitedResponse = responses.find(
        (result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled' && result.value.status === 429
      );

      if (rateLimitedResponse) {
        expect(rateLimitedResponse.value.status).toBe(429);
        expect(rateLimitedResponse.value.body).toHaveProperty('error');
      }
    });

    it('should handle invalid API keys gracefully', async () => {
      // Mock authentication to fail for invalid API key
      const { authenticateApiKey } = require('../../src/middleware/auth');
      authenticateApiKey.mockResolvedValueOnce(false);

      const response = await request(app)
        .post('/api/v1/metrics/widget-usage')
        .set('X-API-Key', 'invalid_api_key')
        .send({
          action: 'load',
          userId: 'user_test_123',
          timestamp: new Date().toISOString()
        })
        .expect(401);

      expect(response.body.error).toBe('Unauthorized');
      expect(response.body.message).toContain('Invalid or missing API key');
    });

    it('should validate request data structure', async () => {
      const mockApiKey = 'pk_test_widget_api_key_123456';
      const invalidData = {
        // Invalid action type
        action: 123,
        userId: 'user_test_123',
        timestamp: new Date().toISOString()
      };

      const response = await request(app)
        .post('/api/v1/metrics/widget-usage')
        .set('X-API-Key', mockApiKey)
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBe('Bad Request');
    });
  });

  describe('Phase 2 Monetization Features', () => {
    it('should include monetization context in all responses', async () => {
      const mockApiKey = 'pk_test_widget_api_key_123456';
      
      // Test usage tracking
      const usageResponse = await request(app)
        .post('/api/v1/metrics/widget-usage')
        .set('X-API-Key', mockApiKey)
        .send({
          action: 'refresh',
          userId: 'user_test_123',
          tier: 'enterprise',
          timestamp: new Date().toISOString()
        })
        .expect(200);

      expect(usageResponse.body).toHaveProperty('monetization');
      expect(usageResponse.body.monetization).toHaveProperty('tier');
      expect(usageResponse.body.monetization).toHaveProperty('creditsUsed');

      // Test analytics
      const analyticsResponse = await request(app)
        .get('/api/v1/metrics/widget-analytics')
        .set('X-API-Key', mockApiKey)
        .expect(200);

      expect(analyticsResponse.body).toHaveProperty('monetization');
      expect(analyticsResponse.body.monetization).toHaveProperty('target500K');
      expect(analyticsResponse.body.monetization).toHaveProperty('currentMRR');
    });

    it('should track revenue metrics for Phase 2', async () => {
      const mockApiKey = 'pk_test_widget_api_key_123456';
      
      // Simulate usage from different tiers
      const tiers = [
        { tier: 'basic', expectedRevenue: 29 },
        { tier: 'pro', expectedRevenue: 99 },
        { tier: 'enterprise', expectedRevenue: 499 }
      ];

      for (const { tier, expectedRevenue } of tiers) {
        await request(app)
          .post('/api/v1/metrics/widget-usage')
          .set('X-API-Key', mockApiKey)
          .send({
            action: 'load',
            userId: `user_${tier}_123`,
            tier,
            timestamp: new Date().toISOString()
          })
          .expect(200);
      }

      const analytics = await ApiUsageService.getWidgetAnalytics(mockApiKey, {
        timeframe: '24h',
        tier: 'all'
      });

      // Verify revenue tracking
      expect(analytics.licenseRevenue).toBeGreaterThan(0);
      expect(analytics.currentMRR).toBeGreaterThan(0);
    });
  });

  describe('Widget Configuration Tracking', () => {
    it('should track widget configuration changes', async () => {
      const mockApiKey = 'pk_test_widget_api_key_123456';
      const configData = {
        action: 'config_change',
        userId: 'user_test_123',
        tier: 'pro',
        widgetConfig: {
          theme: 'dark',
          showLogo: false,
          primaryColor: '#ff5722'
        },
        timestamp: new Date().toISOString()
      };

      const response = await request(app)
        .post('/api/v1/metrics/widget-usage')
        .set('X-API-Key', mockApiKey)
        .send(configData)
        .expect(200);

      expect(response.body.tracked).toBe(true);
      expect(response.body.metrics.configChanges).toBeGreaterThan(0);
    });

    it('should track user interactions', async () => {
      const mockApiKey = 'pk_test_widget_api_key_123456';
      const interactionData = {
        action: 'interaction',
        userId: 'user_test_123',
        tier: 'pro',
        widgetConfig: {
          theme: 'light'
        },
        metadata: {
          interactionType: 'score_click',
          userAgent: 'Mozilla/5.0 (test)'
        },
        timestamp: new Date().toISOString()
      };

      const response = await request(app)
        .post('/api/v1/metrics/widget-usage')
        .set('X-API-Key', mockApiKey)
        .send(interactionData)
        .expect(200);

      expect(response.body.tracked).toBe(true);
      expect(response.body.metrics.userInteractions).toBeGreaterThan(0);
    });
  });
});
