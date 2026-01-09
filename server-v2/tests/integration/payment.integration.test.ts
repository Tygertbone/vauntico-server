import request from 'supertest';
import app from '../../src/app';

describe('Payment Integration Tests', () => {
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

  test('should retrieve subscription plans', async () => {
    const response = await request(app)
      .get('/api/v1/subscriptions/plans')
      .expect(200);

    expect(response.body).toHaveProperty('plans');
    expect(Array.isArray(response.body.plans)).toBe(true);

    // Check for Pro subscription plan
    const proPlan = response.body.plans.find((plan: any) => plan.name === 'Pro');
    expect(proPlan).toBeDefined();
    expect(proPlan.price).toBe(49); // $49/month
  });

  test('should create Paystack subscription for Pro plan', async () => {
    const subscriptionData = {
      planId: 'pro-monthly',
      paymentMethod: 'paystack'
    };

    const response = await request(app)
      .post('/api/v1/subscriptions')
      .set('Authorization', `Bearer ${authToken}`)
      .send(subscriptionData)
      .expect(200);

    expect(response.body).toHaveProperty('subscription');
    expect(response.body).toHaveProperty('paystackUrl');
    expect(response.body.subscription.status).toBe('pending');
  });

  test('should retrieve user subscriptions', async () => {
    const response = await request(app)
      .get('/api/v1/subscriptions')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('subscriptions');
    expect(Array.isArray(response.body.subscriptions)).toBe(true);
  });

  test('should handle Paystack webhook events', async () => {
    const webhookData = {
      event: 'subscription.create',
      data: {
        id: 'test-subscription-id',
        customer: {
          email: 'test@example.com'
        },
        plan: {
          name: 'Pro',
          amount: 4900 // Amount in kobo (49 * 100)
        },
        status: 'active'
      }
    };

    // Mock Paystack webhook signature
    const response = await request(app)
      .post('/api/v1/paystack/webhook')
      .set('x-paystack-signature', 'test-signature')
      .send(webhookData)
      .expect(200);

    expect(response.body).toHaveProperty('status');
    expect(response.body.status).toBe('success');
  });

  test('should create Score Insurance subscription', async () => {
    const subscriptionData = {
      planId: 'score-insurance-monthly',
      paymentMethod: 'paystack'
    };

    const response = await request(app)
      .post('/api/v1/subscriptions')
      .set('Authorization', `Bearer ${authToken}`)
      .send(subscriptionData)
      .expect(200);

    expect(response.body).toHaveProperty('subscription');
    expect(response.body).toHaveProperty('paystackUrl');
    expect(response.body.subscription.planId).toBe('score-insurance-monthly');
  });

  test('should retrieve payment history', async () => {
    const response = await request(app)
      .get('/api/v1/payments/history')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('payments');
    expect(Array.isArray(response.body.payments)).toBe(true);
  });

  test('should handle subscription cancellation', async () => {
    const response = await request(app)
      .delete('/api/v1/subscriptions/test-subscription-id')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('cancelled');
  });

  test('should validate KPI tracking for payments', async () => {
    const response = await request(app)
      .get('/api/v1/metrics/kpi')
      .expect(200);

    expect(response.body).toHaveProperty('kpi_metrics');
    expect(response.body.kpi_metrics).toHaveProperty('pro_subscriptions');
    expect(response.body.kpi_metrics).toHaveProperty('score_insurance_signups');
  });

  test('should handle emergency payment bridge', async () => {
    const emergencyPaymentData = {
      amount: 500,
      reason: 'Creator financial emergency',
      paymentMethod: 'paystack'
    };

    const response = await request(app)
      .post('/api/v1/payment-bridge')
      .set('Authorization', `Bearer ${authToken}`)
      .send(emergencyPaymentData)
      .expect(200);

    expect(response.body).toHaveProperty('payment');
    expect(response.body).toHaveProperty('fee');
    expect(response.body.fee).toBe(emergencyPaymentData.amount * 0.1); // 10% fee
  });

  test('should validate monetization phase compliance', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toHaveProperty('monetization_phase');
    expect(response.body.monetization_phase).toBe('Phase 1: Foundation');
  });
});