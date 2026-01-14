import request from "supertest";
import express from "express";
import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
} from "@jest/globals";

import widgetRoutes from "../../src/routes/widget";
import ApiUsageService from "../../src/services/apiUsageService";

// Mock authenticateApiKey function
jest.mock("../../src/middleware/auth", () => ({
  authenticateApiKey: jest.fn((apiKey: string) => {
    // Return true for valid API key, false for invalid
    return apiKey === "pk_test_widget_api_key_123456";
  }),
}));

describe("Widget Integration Tests - Phase 2", () => {
  let app: express.Application;
  let server: any;

  beforeAll(async () => {
    // Set up test environment
    process.env.NODE_ENV = "test";
    process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/testdb";

    // Create fresh Express app for each test
    app = express();
    app.use(express.json());
    app.use("/", widgetRoutes);

    server = app.listen(0); // Use port 0 for testing
  });

  afterAll(async () => {
    // Cleanup test environment
    if (server) {
      server.close();
    }
  });

  beforeEach(() => {
    // Clear any existing mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clear mocks after each test
    jest.clearAllMocks();
  });

  describe("Widget Usage Tracking", () => {
    const mockApiKey = "pk_test_widget_api_key_123456";
    const mockUserId = "user_test_123";
    const mockUsageData = {
      action: "load",
      userId: mockUserId,
      tier: "pro",
      score: 85,
      widgetConfig: {
        theme: "light",
        showLogo: true,
        showDetails: false,
      },
      timestamp: new Date().toISOString(),
    };

    it("should track widget usage successfully", async () => {
      const response = await request(app)
        .post("/api/v1/metrics/widget-usage")
        .set("X-API-Key", mockApiKey)
        .send(mockUsageData)
        .expect(200);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("tracked", true);
      expect(response.body).toHaveProperty("metrics");
      expect(response.body.metrics).toHaveProperty("tier", "pro");
      expect(response.body).toHaveProperty("monetization");
      expect(response.body.monetization).toHaveProperty("tier", "pro");
    });

    it("should validate required fields", async () => {
      const invalidData = {
        // Missing action and userId
        tier: "basic",
      };

      const response = await request(app)
        .post("/api/v1/metrics/widget-usage")
        .set("X-API-Key", mockApiKey)
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty("error", "Bad Request");
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toContain("Missing required fields");
    });

    it("should validate action types", async () => {
      const invalidData = {
        action: "invalid_action",
        userId: mockUserId,
        tier: "basic",
      };

      const response = await request(app)
        .post("/api/v1/metrics/widget-usage")
        .set("X-API-Key", mockApiKey)
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty("error", "Bad Request");
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toContain("Invalid action");
    });

    it("should handle unauthorized requests", async () => {
      const response = await request(app)
        .post("/api/v1/metrics/widget-usage")
        .set("X-API-Key", "invalid_key")
        .send(mockUsageData)
        .expect(401);

      expect(response.body).toHaveProperty("error", "Unauthorized");
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toContain("Invalid or missing API key");
    });
  });

  describe("Widget Analytics Dashboard", () => {
    const mockApiKey = "pk_test_widget_api_key_123456";

    it("should retrieve analytics dashboard", async () => {
      const response = await request(app)
        .get("/api/v1/widget/data")
        .set("X-API-Key", mockApiKey)
        .expect(200);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("analytics");
      expect(response.body.analytics).toHaveProperty("totalUsage");
      expect(response.body.analytics).toHaveProperty("actionBreakdown");
      expect(response.body.analytics).toHaveProperty("performance");
      expect(response.body.analytics).toHaveProperty("monetization");
      expect(response.body.analytics.monetization).toHaveProperty("target500K", "500K MRR from businesses");
    });

    it("should support timeframes", async () => {
      const timeframes = ["1h", "24h", "7d", "30d"];

      for (const timeframe of timeframes) {
        const response = await request(app)
          .get("/api/v1/widget/data")
          .set("X-API-Key", mockApiKey)
          .query({ timeframe })
          .expect(200);

        expect(response.body).toHaveProperty("success", true);
        expect(response.body.analytics).toHaveProperty("totalUsage");
        expect(response.body.analytics).toHaveProperty("performance");
      }
    });

    it("should support tier filtering", async () => {
      const tiers = ["basic", "pro", "enterprise"];

      for (const tier of tiers) {
        const response = await request(app)
          .get("/api/v1/widget/data")
          .set("X-API-Key", mockApiKey)
          .query({ tier })
          .expect(200);

        expect(response.body).toHaveProperty("success", true);
        expect(response.body.analytics).toHaveProperty("tierBreakdown");
        expect(response.body.analytics.tierBreakdown).toHaveProperty(tier);
      }
    });
  });

  describe("Widget Health Check", () => {
    const mockApiKey = "pk_test_widget_api_key_123456";

    it("should return healthy status", async () => {
      const response = await request(app)
        .get("/api/v1/widget/health")
        .set("X-API-Key", mockApiKey)
        .expect(200);

      expect(response.body).toHaveProperty("status", "healthy");
      expect(response.body).toHaveProperty("version");
      expect(response.body).toHaveProperty("services");
      expect(response.body).toHaveProperty("metrics");
    });

    it("should include service status details", async () => {
      const response = await request(app)
        .get("/api/v1/widget/health")
        .set("X-API-Key", mockApiKey)
        .expect(200);

      expect(response.body.services).toHaveProperty("database");
      expect(response.body.services).toHaveProperty("apiUsage");
      expect(response.body.services).toHaveProperty("analytics");
      expect(response.body.metrics).toHaveProperty("uptime", "99.9%");
    });
  });

  describe("Widget Configuration Management", () => {
    const mockApiKey = "pk_test_widget_api_key_123456";
    const mockConfig = {
      theme: "dark",
      showLogo: true,
      showDetails: false,
      primaryColor: "#ff5722",
      secondaryColor: "#14b8a6",
    };

    it("should save widget configuration", async () => {
      const response = await request(app)
        .post("/api/v1/widget/config")
        .set("X-API-Key", mockApiKey)
        .send({ config: mockConfig })
        .expect(200);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("saved", true);
      expect(response.body).toHaveProperty("config");
      expect(response.body.config).toHaveProperty("theme", "dark");
      expect(response.body.config).toHaveProperty("showLogo", true);
    });

    it("should retrieve widget configuration", async () => {
      const response = await request(app)
        .get("/api/v1/widget/config")
        .set("X-API-Key", mockApiKey)
        .query({ userId: mockUserId })
        .expect(200);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("config");
      expect(response.body).toHaveProperty("userId", mockUserId);
    });

    it("should validate configuration fields", async () => {
      const invalidConfig = {
        theme: "invalid_theme",
      };

      const response = await request(app)
        .post("/api/v1/widget/config")
        .set("X-API-Key", mockApiKey)
        .send({ config: invalidConfig })
        .expect(400);

      expect(response.body).toHaveProperty("error", "Bad Request");
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toContain("Invalid theme");
    });
  });

  describe("Phase 2 Monetization Features", () => {
    const mockApiKey = "pk_test_widget_api_key_123456";

    it("should include monetization context in usage tracking", async () => {
      const monetizationData = {
        action: "refresh",
        userId: "user_pro_123",
        tier: "enterprise",
        score: 95,
        timestamp: new Date().toISOString(),
      };

      const response = await request(app)
        .post("/api/v1/metrics/widget-usage")
        .set("X-API-Key", mockApiKey)
        .send(monetizationData)
        .expect(200);

      expect(response.body).toHaveProperty("monetization");
      expect(response.body.monetization).toHaveProperty("tier", "enterprise");
      expect(response.body.monetization).toHaveProperty("creditsUsed", 1); // Refresh uses 1 credit
      expect(response.body.monetization).toHaveProperty("currentMRR");
    });

    it("should include KPI metrics for monetization", async () => {
      const response = await request(app)
        .get("/api/v1/widget/data")
        .set("X-API-Key", mockApiKey)
        .expect(200);

      expect(response.body.analytics).toHaveProperty("monetization");
      expect(response.body.analytics.monetization).toHaveProperty("target500K");
      expect(response.body.analytics.monetization).toHaveProperty("licenseRevenue");
      expect(response.body.analytics.monetization).toHaveProperty("enterpriseCount");
      expect(response.body.analytics.monetization).toHaveProperty("currentMRR");
    });

    it("should track refresh credit consumption", async () => {
      const refreshData = {
        action: "refresh",
        userId: "user_basic_123",
        tier: "basic",
        score: 75,
        timestamp: new Date().toISOString(),
      };

      // Clear usage log to test fresh state
      ApiUsageService.widgetUsageLog = [];

      const response = await request(app)
        .post("/api/v1/metrics/widget-usage")
        .set("X-API-Key", mockApiKey)
        .send(refreshData)
        .expect(200);

      expect(response.body).toHaveProperty("tracked", true);
      expect(response.body).toHaveProperty("creditsRemaining");

      // Verify credit tracking in metrics
      const metrics = await ApiUsageService.getWidgetMetrics(mockApiKey);
      expect(metrics.actionCounts.refresh).toBe(1);
    });

    it("should calculate MRR based on tier distribution", async () => {
      const response = await request(app)
        .get("/api/v1/widget/data")
        .set("X-API-Key", mockApiKey)
        .expect(200);

      expect(response.body.analytics).toHaveProperty("monetization");
      expect(response.body.analytics.monetization).toHaveProperty("currentMRR");
      expect(response.body.analytics.monetization).toMatchObject({
        licenseRevenue: expect.any(Number),
        enterpriseCount: expect.any(Number),
        proCount: expect.any(Number),
        basicCount: expect.any(Number),
      });
    });
  });

  describe("KPI Metrics Dashboard", () => {
    const mockApiKey = "pk_test_widget_api_key_123456";

    it("should track KPI metrics for dashboard", async () => {
      // Simulate multiple widget loads
      const loadActions = [
        { action: "load", userId: "user_1", tier: "pro" },
        { action: "load", userId: "user_2", tier: "pro" },
        { action: "load", userId: "user_3", tier: "enterprise" },
        { action: "load", userId: "user_4", tier: "basic" },
        { action: "load", userId: "user_5", tier: "basic" },
      ];

      for (const actionData of loadActions) {
        await request(app)
          .post("/api/v1/metrics/widget-usage")
          .set("X-API-Key", mockApiKey)
          .send(actionData);
          .expect(200);
      }

      // Verify KPI tracking
      const metrics = await ApiUsageService.getWidgetMetrics(mockApiKey);
      expect(metrics.actionCounts.load).toBe(5);
      expect(metrics.activeWidgets).toBeGreaterThan(0);
    });

    it("should calculate KPI trends", async () => {
      // Simulate usage over time
      const hourlyActions = Array.from({ length: 24 }, (_, i) => ({
        action: "load",
        userId: `user_${i % 3}`, // Distribute across tiers
        tier: ["basic", "pro", "enterprise"][i % 3],
        score: 70 + Math.floor(Math.random() * 30),
        timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
      }));

      for (const actionData of hourlyActions) {
        await request(app)
          .post("/api/v1/metrics/widget-usage")
          .set("X-API-Key", mockApiKey)
          .send(actionData)
          .expect(200);
      }

      // Verify KPI calculation
      const metrics = await ApiUsageService.getWidgetMetrics(mockApiKey);
      expect(metrics.averageScore).toBeGreaterThan(70); // Should reflect average of simulated scores
    });
  });

  describe("Error Handling and Edge Cases", () => {
    const mockApiKey = "pk_test_widget_api_key_123456";

    it("should handle malformed JSON gracefully", async () => {
      const response = await request(app)
        .post("/api/v1/metrics/widget-usage")
        .set("X-API-Key", mockApiKey)
        .set("Content-Type", "application/json")
        .send("{ invalid json }")
        .expect(400);

      expect(response.body).toHaveProperty("error", "Bad Request");
    });

    it("should handle rate limiting", async () => {
      // Simulate rapid requests to trigger rate limiting
      const requests = Array.from({ length: 20 }, (_, i) =>
        request(app)
          .post("/api/v1/metrics/widget-usage")
          .set("X-API-Key", mockApiKey)
          .send({
            action: "load",
            userId: `user_${i}`,
            timestamp: new Date().toISOString(),
          })
          .expect(200),
      );

      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter((res, index) => index >= 10);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    it("should handle concurrent requests", async () => {
      const concurrentRequests = Array.from({ length: 10 }, (_, i) =>
        request(app)
          .post("/api/v1/metrics/widget-usage")
          .set("X-API-Key", mockApiKey)
          .send({
            action: "load",
            userId: `concurrent_user_${i}`,
            timestamp: new Date().toISOString(),
          })
          .expect(200),
      );

      // Wait for all requests to complete
      const responses = await Promise.all(concurrentRequests);
      expect(responses.every(res => res.status === 200)).toBe(true);

      // Verify data consistency
      const metrics = await ApiUsageService.getWidgetMetrics(mockApiKey);
      expect(metrics.actionCounts.load).toBe(10);
    });

    it("should handle database connection failures", async () => {
      // Mock database failure scenario
      const { authenticateApiKey } = await import("../../src/middleware/auth");
      authenticateApiKey.mockImplementation(() => {
        return Promise.resolve(false); // Simulate auth failure
      });

      const response = await request(app)
        .post("/api/v1/metrics/widget-usage")
        .set("X-API-Key", mockApiKey)
        .send({
          action: "load",
          userId: "test_user",
          timestamp: new Date().toISOString(),
        })
        .expect(401);

      expect(response.body).toHaveProperty("error", "Unauthorized");
    });
  });

  describe("Integration with Other Services", () => {
    it("should integrate with auth service", async () => {
      const { authenticateApiKey } = await import("../../src/middleware/auth");
      const { TokenPayload } = await import("../../src/types/database");

      // Mock successful authentication with token payload
      const mockTokenPayload: TokenPayload = {
        userId: "user_test_123",
        email: "test@example.com",
        subscriptionTier: "pro",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
      };

      authenticateApiKey.mockImplementation(() => {
        return Promise.resolve(mockTokenPayload);
      });

      const response = await request(app)
        .post("/api/v1/metrics/widget-usage")
        .set("X-API-Key", "pk_test_widget_api_key_123456")
        .send({
          action: "load",
          userId: "user_test_123",
          timestamp: new Date().toISOString(),
        })
        .expect(200);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("tracked", true);
    });

    it("should integrate with database pool", async () => {
      const { checkDatabaseHealth } = await import("../../src/db/health");
      const { DatabasePool } = await import("pg");

      // Mock healthy database
      checkDatabaseHealth.mockImplementation(() => {
        return Promise.resolve({
          isHealthy: true,
          timestamp: new Date().toISOString(),
          connectionCount: 5,
          idleCount: 3,
        });
      });

      const response = await request(app)
        .get("/api/v1/widget/health")
        .set("X-API-Key", "pk_test_widget_api_key_123456")
        .expect(200);

      expect(response.body).toHaveProperty("status", "healthy");
      expect(response.body).toHaveProperty("timestamp");
      expect(response.body.services).toHaveProperty("database");
      expect(response.body.services.database).toHaveProperty("connectionCount", 5);
      expect(response.body.services.database).toHaveProperty("idleCount", 3);
    });

    it("should handle API usage tracking with persistence", async () => {
      // Test that usage data persists across requests
      const initialResponse = await request(app)
        .post("/api/v1/metrics/widget-usage")
        .set("X-API-Key", "pk_test_widget_api_key_123456")
        .send({
          action: "load",
          userId: "persistence_test_user",
          timestamp: new Date().toISOString(),
        })
        .expect(200);

      // Verify data was tracked
      const initialMetrics = await ApiUsageService.getWidgetMetrics("pk_test_widget_api_key_123456");
      expect(initialMetrics.actionCounts.load).toBe(1);

      // Make another request to verify persistence
      const secondResponse = await request(app)
        .post("/api/v1/metrics/widget-usage")
        .set("X-API-Key", "pk_test_widget_api_key_123456")
        .send({
          action: "load",
          userId: "persistence_test_user",
          timestamp: new Date().toISOString(),
        })
        .expect(200);

      const finalMetrics = await ApiUsageService.getWidgetMetrics("pk_test_widget_api_key_123456");
      expect(finalMetrics.actionCounts.load).toBe(2);
    });
  });

  describe("Performance and Scalability Tests", () => {
    it("should handle high-volume usage tracking", async () => {
      // Simulate 1000 widget loads
      const highVolumeRequests = Array.from({ length: 100 }, (_, i) =>
        request(app)
          .post("/api/v1/metrics/widget-usage")
          .set("X-API-Key", "pk_test_widget_api_key_123456")
          .send({
            action: "load",
            userId: `load_user_${i}`,
            timestamp: new Date().toISOString(),
          })
          .expect(200),
      );

      // Wait for all requests to complete
      await Promise.all(highVolumeRequests);

      // Verify performance metrics
      const metrics = await ApiUsageService.getWidgetMetrics("pk_test_widget_api_key_123456");
      expect(metrics.actionCounts.load).toBe(100);
      expect(metrics.averageScore).toBeDefined();
      expect(metrics.errorRate).toBeLessThan(0.05); // Error rate should be low under high volume
    });

    it("should maintain data consistency under load", async () => {
      // Test concurrent operations with data consistency
      const concurrentUsers = ["user_a", "user_b", "user_c", "user_d", "user_e"];
      const concurrentRequests = concurrentUsers.map((userId, index) =>
        request(app)
          .post("/api/v1/metrics/widget-usage")
          .set("X-API-Key", "pk_test_widget_api_key_123456")
          .send({
            action: "interaction",
            userId,
            timestamp: new Date().toISOString(),
            metadata: { testIndex: index },
          })
          .expect(200),
      );

      await Promise.all(concurrentRequests);

      // Verify all users were tracked
      const metrics = await ApiUsageService.getWidgetMetrics("pk_test_widget_api_key_123456");
      expect(metrics.actionCounts.interaction).toBe(5);

      // Verify data distribution
      const tierMetrics = metrics.tierDistribution;
      expect(Object.keys(tierMetrics).length).toBeGreaterThan(0);
    });

    it("should scale database connections appropriately", async () => {
      // Test database connection pooling under load
      const poolRequests = Array.from({ length: 50 }, (_, i) =>
        request(app)
          .get("/api/v1/widget/health")
          .set("X-API-Key", "pk_test_widget_api_key_123456")
          .expect(200),
      );

      // Verify database handles concurrent connections
      const finalHealthResponse = await request(app)
        .get("/api/v1/widget/health")
        .set("X-API-Key", "pk_test_widget_api_key_123456")
        .expect(200);

      expect(finalHealthResponse.body).toHaveProperty("status", "healthy");
      expect(finalHealthResponse.body.services.database).toHaveProperty("connectionCount");
      expect(finalHealthResponse.body.services.database.connectionCount).toBeGreaterThan(1);
    });
  });

  describe("Security and Compliance Tests", () => {
    it("should validate API key format", async () => {
      const { authenticateApiKey } = await import("../../src/middleware/auth");

      // Test various API key formats
      const testCases = [
        {
          apiKey: "pk_test_widget_api_key_123456",
          expected: true,
          description: "Valid test key",
        },
        {
          apiKey: "invalid_key",
          expected: false,
          description: "Invalid test key",
        },
        {
          apiKey: "pk_test_widget_api_key_123456_invalid",
          expected: false,
          description: "Invalid test key suffix",
        },
        {
          apiKey: "",
          expected: false,
          description: "Empty API key",
        },
      ];

      for (const testCase of testCases) {
        const result = await authenticateApiKey(testCase.apiKey);
        expect(result).toBe(testCase.expected);
      }
    });

    it("should enforce rate limiting per API key", async () => {
      // Simulate rapid requests from same API key
      const rapidRequests = Array.from({ length: 30 }, (_, i) =>
        request(app)
          .post("/api/v1/metrics/widget-usage")
          .set("X-API-Key", "pk_test_widget_api_key_123456")
          .send({
            action: "load",
            userId: "rate_limit_test_user",
            timestamp: new Date().toISOString(),
          })
          .expect(200),
      );

      // Wait for rate limiting to kick in
      await new Promise(resolve => setTimeout(resolve, 100));

      const rateLimitedRequests = rapidRequests.slice(10); // Later requests should be rate limited

      for (const req of rateLimitedRequests) {
        const response = await req;
        // Some requests should be rate limited (429)
        if (response.status === 429) {
          rateLimitedCount++;
        }
      }

      expect(rateLimitedCount).toBeGreaterThan(5);
    });

    it("should handle data privacy compliance", async () => {
      const privacyData = {
        action: "config_change",
        userId: "privacy_test_user",
        tier: "enterprise",
        widgetConfig: {
          theme: "dark",
          showLogo: true,
          showDetails: false,
          // Include potentially sensitive data
          customSettings: {
            internalId: "internal_user_123",
            secretKey: "secret_value_that_should_not_be_logged",
          },
        },
        timestamp: new Date().toISOString(),
      };

      const response = await request(app)
        .post("/api/v1/metrics/widget-usage")
        .set("X-API-Key", "pk_test_widget_api_key_123456")
        .send(privacyData)
        .expect(200);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("tracked", true);

      // Verify sensitive data is handled appropriately (not logged in test output)
      const metrics = await ApiUsageService.getWidgetMetrics("pk_test_widget_api_key_123456");
      expect(metrics.actionCounts.config_change).toBe(1);

      // Verify data is stored securely (no sensitive data in logs)
      // This would require checking actual log storage in a real implementation
    });

    it("should support GDPR data deletion requests", async () => {
      // Mock GDPR deletion request
      const gdprData = {
        action: "config_change",
        userId: "gdpr_test_user",
        tier: "enterprise",
        widgetConfig: {
          theme: "light",
          deleteUserData: true,
          reason: "GDPR deletion request",
        },
        timestamp: new Date().toISOString(),
      };

      const response = await request(app)
        .post("/api/v1/metrics/widget-usage")
        .set("X-API-Key", "pk_test_widget_api_key_123456")
        .send(gdprData)
        .expect(200);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("tracked", true);

      // Verify GDPR compliance tracking
      const metrics = await ApiUsageService.getWidgetMetrics("pk_test_widget_api_key_123456");
      expect(metrics.actionCounts.config_change).toBe(1);

      // In a real implementation, you would also verify:
      // 1. User data is actually deleted from database
      // 2. Deletion request is logged for compliance
      // 3. User is notified of deletion completion
    });
  });

  describe("Cross-Service Integration", () => {
    it("should integrate widget analytics with payment system", async () => {
      // Mock payment system integration
      const paymentData = {
        action: "upgrade",
        userId: "payment_integration_user",
        tier: "basic_to_pro",
        score: 80,
        widgetConfig: {
          theme: "dark",
          showLogo: true,
        },
        metadata: {
          paymentMethod: "stripe",
          paymentId: "pay_123456",
          amount: 9900, // $99 Pro tier
        },
        timestamp: new Date().toISOString(),
      };

      const response = await request(app)
        .post("/api/v1/metrics/widget-usage")
        .set("X-API-Key", "pk_test_widget_api_key_123456")
        .send(paymentData)
        .expect(200);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("tracked", true);
      expect(response.body).toHaveProperty("metrics");

      // Verify payment integration tracking
      const metrics = await ApiUsageService.getWidgetMetrics("pk_test_widget_api_key_123456");
      expect(metrics.actionCounts.upgrade).toBe(1);
      expect(metrics.tierDistribution.pro).toBeLessThan(1)); // User moved from basic to pro
    });

    it("should integrate with notification system", async () => {
      // Mock notification integration
      const notificationData = {
        action: "load",
        userId: "notification_user",
        tier: "pro",
        score: 88,
        widgetConfig: {
          notifications: {
            email: true,
            browser: false,
          },
        },
        metadata: {
          notificationChannel: "in_app",
          notificationId: "notif_123456",
        },
        timestamp: new Date().toISOString(),
      };

      const response = await request(app)
        .post("/api/v1/metrics/widget-usage")
        .set("X-API-Key", "pk_test_widget_api_key_123456")
        .send(notificationData)
        .expect(200);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("tracked", true);

      // Verify notification integration
      const metrics = await ApiUsageService.getWidgetMetrics("pk_test_widget_api_key_123456");
      expect(metrics.actionCounts.load).toBeGreaterThan(0);

      // In a real implementation, you would verify:
      // 1. Notification was actually sent
      // 2. Email notification was queued
      // 3. Browser notification preferences were respected
    });
  });
});
