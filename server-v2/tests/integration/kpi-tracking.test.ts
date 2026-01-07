import request from 'supertest';
import app from '../../src/app';

describe('KPI Tracking Integration Tests', () => {
  describe('Phase 1 KPI Endpoints', () => {
    test('should return Phase 1 KPI metrics', async () => {
      const response = await request(app)
        .get('/api/v1/metrics/kpi')
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('phase', 'Phase 1: Foundation');
      expect(response.body).toHaveProperty('kpi_metrics');
      expect(response.body.kpi_metrics).toContain('pro_subscriptions');
      expect(response.body.kpi_metrics).toContain('score_insurance_signups');
      expect(response.body.kpi_metrics).toContain('trust_calculator_usage');
      expect(response.body).toHaveProperty('mrr_current');
      expect(response.body).toHaveProperty('mrr_target', 100000);
    });

    test('should update KPI metrics incrementally', async () => {
      const initialResponse = await request(app)
        .get('/api/v1/metrics/kpi')
        .expect(200);
      
      const initialMrr = initialResponse.body.mrr_current || 0;
      
      // Increment pro subscriptions
      await request(app)
        .post('/api/v1/metrics/kpi')
        .send({ metric_type: 'pro_subscriptions', increment: 1 })
        .expect(200);
      
      const afterIncrementResponse = await request(app)
        .get('/api/v1/metrics/kpi')
        .expect(200);
      
      expect(afterIncrementResponse.body.mrr_current).toBe(initialMrr + 99);
    });
  });

  describe('Blind Spot Monitoring', () => {
    test('should return compliant blind spot status', async () => {
      const response = await request(app)
        .get('/api/v1/metrics/blind-spots')
        .expect(200);
      
      expect(response.body).toHaveProperty('blind_spots');
      expect(response.body.blind_spots.data_privacy.enabled).toBe(true);
      expect(response.body.blind_spots.platform_dependency.enabled).toBe(true);
      expect(response.body.blind_spots.algorithm_gaming.enabled).toBe(true);
      expect(response.body.blind_spots.commoditization.enabled).toBe(true);
      expect(response.body).toHaveProperty('compliance_status');
      expect(response.body.compliance_status.data_privacy).toBe('compliant');
      expect(response.body.compliance_status.platform_dependency).toBe('compliant');
      expect(response.body.compliance_status.algorithm_gaming).toBe('compliant');
      expect(response.body.compliance_status.commoditization).toBe('compliant');
    });
  });

  describe('Deployment Tracking', () => {
    test('should track deployment with monetization context', async () => {
      const deploymentPayload = {
        deployment_id: 'test-deployment-123',
        monetization_phase: 'Phase 1: Foundation',
        feature_description: 'Test deployment for governance validation',
        phase_target: '100K MRR from creators',
        kpi_metrics: 'pro_subscriptions,score_insurance_signups,trust_calculator_usage',
        blind_spots: 'data_privacy,platform_dependency',
        deployment_timestamp: new Date().toISOString(),
        github_sha: 'test-sha-123',
        github_ref: 'refs/heads/test',
        github_actor: 'test-user'
      };

      const response = await request(app)
        .post('/api/v1/metrics/deployment-tracking')
        .send(deploymentPayload)
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('deployment_id', 'test-deployment-123');
      expect(response.body).toHaveProperty('phase', 'Phase 1: Foundation');
    });

    test('should validate required deployment fields', async () => {
      const incompletePayload = {
        deployment_id: 'test-deployment-123'
        // Missing other required fields
      };

      const response = await request(app)
        .post('/api/v1/metrics/deployment-tracking')
        .send(incompletePayload)
        .expect(400);
      
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Missing required fields');
    });
  });
});