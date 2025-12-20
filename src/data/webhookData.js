// Mock webhook data for VaultDashboard
// This file contains simulated metrics and logs for webhook monitoring

const webhookData = {
  // Overview Metrics
  totalRequests: 15847,
  successRate: 98.7,
  rejectedCount: 206,
  uptime: 99.95,
  averageResponseTime: 127, // milliseconds
  
  // Replay Protection Status
  replayProtection: {
    enabled: true,
    windowDuration: 300, // seconds (5 minutes)
    rejectedReplays: 42,
    lastUpdated: new Date('2025-01-18T09:30:00').toISOString()
  },
  
  // Rate Limiting
  rateLimiting: {
    enabled: true,
    requestsPerMinute: 100,
    currentUsage: 67,
    throttledRequests: 15
  },
  
  // Recent Activity Summary
  recentActivity: {
    last24Hours: {
      totalRequests: 1256,
      successful: 1241,
      failed: 15,
      avgResponseTime: 132
    },
    last7Days: {
      totalRequests: 8794,
      successful: 8671,
      failed: 123,
      avgResponseTime: 128
    },
    last30Days: {
      totalRequests: 35642,
      successful: 35167,
      failed: 475,
      avgResponseTime: 125
    }
  },
  
  // Detailed Audit Logs
  logs: [
    {
      id: 'log-001',
      timestamp: new Date('2025-01-18T09:45:23').toISOString(),
      endpoint: '/webhook/payment-success',
      method: 'POST',
      status: 200,
      statusText: 'Success',
      signature: 'sha256=a3f5b8c9d2e1f4g7h6i5j8k1l0m9n8o7p6q5r4s3t2u1v0w9',
      ipAddress: '192.168.1.45',
      responseTime: 98,
      userAgent: 'PaystackWebhook/1.0',
      payload: {
        event: 'charge.success',
        amount: 4900,
        currency: 'NGN',
        customer: 'customer_abc123'
      }
    },
    {
      id: 'log-002',
      timestamp: new Date('2025-01-18T09:44:15').toISOString(),
      endpoint: '/webhook/payment-success',
      method: 'POST',
      status: 200,
      statusText: 'Success',
      signature: 'sha256=b4g6c9e2f5h8i1k4l7m0n3o6p9q2r5s8t1u4v7w0x3y6z9',
      ipAddress: '192.168.1.67',
      responseTime: 112,
      userAgent: 'PaystackWebhook/1.0',
      payload: {
        event: 'charge.success',
        amount: 9900,
        currency: 'NGN',
        customer: 'customer_xyz789'
      }
    },
    {
      id: 'log-003',
      timestamp: new Date('2025-01-18T09:43:02').toISOString(),
      endpoint: '/webhook/subscription-created',
      method: 'POST',
      status: 200,
      statusText: 'Success',
      signature: 'sha256=c5h7d0f3g6i9j2k5l8m1n4o7p0q3r6s9t2u5v8w1x4y7z0',
      ipAddress: '192.168.1.89',
      responseTime: 145,
      userAgent: 'StripeWebhook/2.0',
      payload: {
        event: 'customer.subscription.created',
        plan: 'premium',
        customer: 'customer_def456'
      }
    },
    {
      id: 'log-004',
      timestamp: new Date('2025-01-18T09:41:48').toISOString(),
      endpoint: '/webhook/payment-success',
      method: 'POST',
      status: 401,
      statusText: 'Unauthorized',
      signature: 'sha256=invalid_signature_example_here',
      ipAddress: '203.45.67.89',
      responseTime: 15,
      userAgent: 'curl/7.68.0',
      payload: null,
      error: 'Invalid signature'
    },
    {
      id: 'log-005',
      timestamp: new Date('2025-01-18T09:40:33').toISOString(),
      endpoint: '/webhook/payment-failed',
      method: 'POST',
      status: 200,
      statusText: 'Success',
      signature: 'sha256=d6i8e1f4g7j0k3l6m9n2o5p8q1r4s7t0u3v6w9x2y5z8a1',
      ipAddress: '192.168.1.112',
      responseTime: 103,
      userAgent: 'PaystackWebhook/1.0',
      payload: {
        event: 'charge.failed',
        amount: 14900,
        currency: 'NGN',
        customer: 'customer_ghi789'
      }
    },
    {
      id: 'log-006',
      timestamp: new Date('2025-01-18T09:39:21').toISOString(),
      endpoint: '/webhook/payment-success',
      method: 'POST',
      status: 429,
      statusText: 'Too Many Requests',
      signature: 'sha256=e7j9f2g5h8k1l4m7n0o3p6q9r2s5t8u1v4w7x0y3z6a9b2',
      ipAddress: '192.168.1.134',
      responseTime: 8,
      userAgent: 'PaystackWebhook/1.0',
      payload: null,
      error: 'Rate limit exceeded'
    },
    {
      id: 'log-007',
      timestamp: new Date('2025-01-18T09:38:09').toISOString(),
      endpoint: '/webhook/refund-processed',
      method: 'POST',
      status: 200,
      statusText: 'Success',
      signature: 'sha256=f8k0g3h6i9l2m5n8o1p4q7r0s3t6u9v2w5x8y1z4a7b0c3',
      ipAddress: '192.168.1.156',
      responseTime: 134,
      userAgent: 'PaystackWebhook/1.0',
      payload: {
        event: 'refund.processed',
        amount: 4900,
        currency: 'NGN',
        customer: 'customer_jkl012'
      }
    },
    {
      id: 'log-008',
      timestamp: new Date('2025-01-18T09:36:55').toISOString(),
      endpoint: '/webhook/payment-success',
      method: 'POST',
      status: 200,
      statusText: 'Success',
      signature: 'sha256=g9l1h4i7j0m3n6o9p2q5r8s1t4u7v0w3x6y9z2a5b8c1d4',
      ipAddress: '192.168.1.178',
      responseTime: 119,
      userAgent: 'PaystackWebhook/1.0',
      payload: {
        event: 'charge.success',
        amount: 4900,
        currency: 'NGN',
        customer: 'customer_mno345'
      }
    },
    {
      id: 'log-009',
      timestamp: new Date('2025-01-18T09:35:42').toISOString(),
      endpoint: '/webhook/payment-success',
      method: 'POST',
      status: 403,
      statusText: 'Forbidden',
      signature: 'sha256=replay_detected_duplicate_request',
      ipAddress: '203.45.67.89',
      responseTime: 12,
      userAgent: 'curl/7.68.0',
      payload: null,
      error: 'Replay attack detected'
    },
    {
      id: 'log-010',
      timestamp: new Date('2025-01-18T09:34:28').toISOString(),
      endpoint: '/webhook/payment-success',
      method: 'POST',
      status: 200,
      statusText: 'Success',
      signature: 'sha256=h0m2i5j8k1n4o7p0q3r6s9t2u5v8w1x4y7z0a3b6c9d2e5',
      ipAddress: '192.168.1.201',
      responseTime: 108,
      userAgent: 'PaystackWebhook/1.0',
      payload: {
        event: 'charge.success',
        amount: 9900,
        currency: 'NGN',
        customer: 'customer_pqr678'
      }
    },
    {
      id: 'log-011',
      timestamp: new Date('2025-01-18T09:33:15').toISOString(),
      endpoint: '/webhook/subscription-cancelled',
      method: 'POST',
      status: 200,
      statusText: 'Success',
      signature: 'sha256=i1n3j6k9l2o5p8q1r4s7t0u3v6w9x2y5z8a1b4c7d0e3f6',
      ipAddress: '192.168.1.223',
      responseTime: 156,
      userAgent: 'StripeWebhook/2.0',
      payload: {
        event: 'customer.subscription.deleted',
        plan: 'basic',
        customer: 'customer_stu901'
      }
    },
    {
      id: 'log-012',
      timestamp: new Date('2025-01-18T09:32:03').toISOString(),
      endpoint: '/webhook/payment-success',
      method: 'POST',
      status: 200,
      statusText: 'Success',
      signature: 'sha256=j2o4k7l0m3p6q9r2s5t8u1v4w7x0y3z6a9b2c5d8e1f4g7',
      ipAddress: '192.168.1.245',
      responseTime: 95,
      userAgent: 'PaystackWebhook/1.0',
      payload: {
        event: 'charge.success',
        amount: 14900,
        currency: 'NGN',
        customer: 'customer_vwx234'
      }
    },
    {
      id: 'log-013',
      timestamp: new Date('2025-01-18T09:30:51').toISOString(),
      endpoint: '/webhook/payment-success',
      method: 'POST',
      status: 500,
      statusText: 'Internal Server Error',
      signature: 'sha256=k3p5l8m1n4q7r0s3t6u9v2w5x8y1z4a7b0c3d6e9f2g5h8',
      ipAddress: '192.168.1.12',
      responseTime: 3000,
      userAgent: 'PaystackWebhook/1.0',
      payload: {
        event: 'charge.success',
        amount: 4900,
        currency: 'NGN',
        customer: 'customer_yza567'
      },
      error: 'Database connection timeout'
    },
    {
      id: 'log-014',
      timestamp: new Date('2025-01-18T09:29:38').toISOString(),
      endpoint: '/webhook/payment-success',
      method: 'POST',
      status: 200,
      statusText: 'Success',
      signature: 'sha256=l4q6m9n2o5r8s1t4u7v0w3x6y9z2a5b8c1d4e7f0g3h6i9',
      ipAddress: '192.168.1.34',
      responseTime: 121,
      userAgent: 'PaystackWebhook/1.0',
      payload: {
        event: 'charge.success',
        amount: 9900,
        currency: 'NGN',
        customer: 'customer_bcd890'
      }
    },
    {
      id: 'log-015',
      timestamp: new Date('2025-01-18T09:28:26').toISOString(),
      endpoint: '/webhook/payment-success',
      method: 'POST',
      status: 200,
      statusText: 'Success',
      signature: 'sha256=m5r7n0o3p6s9t2u5v8w1x4y7z0a3b6c9d2e5f8g1h4i7j0',
      ipAddress: '192.168.1.56',
      responseTime: 114,
      userAgent: 'PaystackWebhook/1.0',
      payload: {
        event: 'charge.success',
        amount: 4900,
        currency: 'NGN',
        customer: 'customer_efg123'
      }
    }
  ],
  
  // Analytics Data
  analytics: {
    // Request distribution by status
    statusDistribution: {
      success: 15641,
      unauthorized: 89,
      forbidden: 42,
      tooManyRequests: 15,
      serverError: 60
    },
    
    // Top endpoints
    topEndpoints: [
      {
        endpoint: '/webhook/payment-success',
        requests: 12456,
        successRate: 99.1
      },
      {
        endpoint: '/webhook/subscription-created',
        requests: 1834,
        successRate: 98.9
      },
      {
        endpoint: '/webhook/payment-failed',
        requests: 892,
        successRate: 100.0
      },
      {
        endpoint: '/webhook/refund-processed',
        requests: 445,
        successRate: 97.8
      },
      {
        endpoint: '/webhook/subscription-cancelled',
        requests: 220,
        successRate: 99.5
      }
    ],
    
    // Hourly request distribution (last 24 hours)
    hourlyDistribution: [
      { hour: '00:00', requests: 45 },
      { hour: '01:00', requests: 32 },
      { hour: '02:00', requests: 28 },
      { hour: '03:00', requests: 21 },
      { hour: '04:00', requests: 18 },
      { hour: '05:00', requests: 35 },
      { hour: '06:00', requests: 52 },
      { hour: '07:00', requests: 68 },
      { hour: '08:00', requests: 89 },
      { hour: '09:00', requests: 112 },
      { hour: '10:00', requests: 98 },
      { hour: '11:00', requests: 87 },
      { hour: '12:00', requests: 76 },
      { hour: '13:00', requests: 65 },
      { hour: '14:00', requests: 71 },
      { hour: '15:00', requests: 82 },
      { hour: '16:00', requests: 94 },
      { hour: '17:00', requests: 88 },
      { hour: '18:00', requests: 79 },
      { hour: '19:00', requests: 67 },
      { hour: '20:00', requests: 58 },
      { hour: '21:00', requests: 51 },
      { hour: '22:00', requests: 43 },
      { hour: '23:00', requests: 38 }
    ],
    
    // Response time distribution
    responseTimeDistribution: {
      under50ms: 3456,
      under100ms: 5678,
      under200ms: 4892,
      under500ms: 1567,
      over500ms: 254
    },
    
    // Geographic distribution (top countries)
    geographicDistribution: [
      { country: 'Nigeria', requests: 8945, percentage: 56.4 },
      { country: 'United States', requests: 3456, percentage: 21.8 },
      { country: 'United Kingdom', requests: 1892, percentage: 11.9 },
      { country: 'South Africa', requests: 892, percentage: 5.6 },
      { country: 'Ghana', requests: 662, percentage: 4.2 }
    ]
  },
  
  // Security Metrics
  security: {
    suspiciousActivity: 47,
    blockedIPs: 12,
    failedAuthAttempts: 89,
    replayAttemptsBlocked: 42,
    lastSecurityIncident: new Date('2025-01-17T14:23:00').toISOString(),
    
    // Recent security events
    recentSecurityEvents: [
      {
        id: 'sec-001',
        timestamp: new Date('2025-01-18T09:41:48').toISOString(),
        type: 'Invalid Signature',
        ipAddress: '203.45.67.89',
        action: 'Rejected',
        severity: 'Medium'
      },
      {
        id: 'sec-002',
        timestamp: new Date('2025-01-18T09:35:42').toISOString(),
        type: 'Replay Attack',
        ipAddress: '203.45.67.89',
        action: 'Blocked',
        severity: 'High'
      },
      {
        id: 'sec-003',
        timestamp: new Date('2025-01-18T09:39:21').toISOString(),
        type: 'Rate Limit Exceeded',
        ipAddress: '192.168.1.134',
        action: 'Throttled',
        severity: 'Low'
      }
    ]
  }
};

export default webhookData;
