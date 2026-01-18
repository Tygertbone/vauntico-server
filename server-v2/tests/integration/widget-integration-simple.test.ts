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
  });
});
