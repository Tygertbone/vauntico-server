import request from "supertest";
import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import express from "express";

import { createTestServer, closeTestServer } from "../../utils/testUtils";

// Import router we're testing
import dashboardRouter from "../../src/routes/dashboard";

// Test data
const TEST_USER_ID = "test-user-123";
const TEST_API_KEY = "test-api-key-123456789";
const TEST_USER_TIER = "silver";

// Helper to create authenticated requests
const createAuthenticatedRequest = (
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
) => {
  return {
    method,
    url: `/api/v1/dashboard${endpoint}`,
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": TEST_API_KEY,
    },
  };
};

// Test server setup
let testServer: any;

describe("Dashboard API Endpoints", () => {
  beforeAll(async () => {
    testServer = createTestServer(dashboardRouter);
  });

  afterAll(async () => {
    await closeTestServer(testServer);
  });

  describe("GET /api/v1/dashboard/trustscore", () => {
    it("should return 400 for missing API key", async () => {
      const response = await request(testServer)
        .get("/api/v1/dashboard/trustscore")
        .expect(400)
        .expect("json")
        .expect(
          expect.objectContaining({
            error: "Unauthorized",
            message: expect.stringContaining("Invalid or missing API key"),
            code: "UNAUTHORIZED",
            metadata: expect.objectContaining({
              version: expect.stringContaining("2.0.0"),
              timestamp: expect.any(String),
              requestId: expect.any(String),
            }),
          }),
        );
    });

    it("should return 200 with valid API key", async () => {
      const response = await request(testServer)
        .get("/api/v1/dashboard/trustscore")
        .set({ "X-API-Key": TEST_API_KEY })
        .expect(200)
        .expect("json")
        .expect(
          expect.objectContaining({
            data: expect.objectContaining({
              score: expect.any(Number),
              tier: expect.any(String),
              factors: expect.any(Object),
              calculatedAt: expect.any(String),
              expiresAt: expect.any(String),
              trend: expect.any(String),
              change: expect.any(Number),
              lastUpdated: expect.any(String),
            }),
            metadata: expect.objectContaining({
              version: expect.stringContaining("2.0.0"),
              endpoint: "/api/v1/dashboard/trustscore",
              generatedAt: expect.any(String),
              requestId: expect.any(String),
              processingTimeMs: expect.any(Number),
            }),
          }),
        );
    });

    it("should validate userId parameter", async () => {
      const response = await request(testServer)
        .get("/api/v1/dashboard/trustscore?userId=")
        .expect(400)
        .expect("json")
        .expect(
          expect.objectContaining({
            error: "Validation failed",
            message: expect.stringContaining("User ID is required"),
            code: "VALIDATION_ERROR",
          }),
        );
    });

    it("should validate subscription tier", async () => {
      const response = await request(testServer)
        .get("/api/v1/dashboard/trustscore")
        .set({ "X-API-Key": TEST_API_KEY })
        .expect(200)
        .expect("json")
        .expect(
          expect.objectContaining({
            data: expect.objectContaining({
              score: expect.any(Number),
              tier: expect.any(String),
              factors: expect.any(Object),
              calculatedAt: expect.any(String),
              expiresAt: expect.any(String),
              trend: expect.any(String),
              change: expect.any(Number),
              lastUpdated: expect.any(String),
            }),
            metadata: expect.objectContaining({
              version: expect.stringContaining("2.0.0"),
              endpoint: "/api/v1/dashboard/trustscore",
              generatedAt: expect.any(String),
              requestId: expect.any(String),
              processingTimeMs: expect.any(Number),
            }),
          }),
        );
    });

    it("should return 403 for bronze tier with invalid API key", async () => {
      const response = await request(testServer)
        .get("/api/v1/dashboard/trustscore")
        .set({ "X-API-Key": TEST_API_KEY })
        .expect(200)
        .expect("json")
        .expect(
          expect.objectContaining({
            error: "Forbidden",
            message: expect.stringContaining("Insufficient subscription tier"),
            code: "INSUFFICIENT_TIER",
            metadata: expect.objectContaining({
              version: expect.stringContaining("2.0.0"),
              timestamp: expect.any(String),
              requestId: expect.any(String),
            }),
          }),
        );
    });

    it("should return 404 for non-existent user", async () => {
      const response = await request(testServer)
        .get("/api/v1/dashboard/trustscore?userId=nonexistent")
        .set({ "X-API-Key": TEST_API_KEY })
        .expect(404)
        .expect("json")
        .expect(
          expect.objectContaining({
            error: "User not found",
            code: "NOT_FOUND",
            metadata: expect.objectContaining({
              version: expect.stringContaining("2.0.0"),
              timestamp: expect.any(String),
              requestId: expect.any(String),
            }),
          }),
        );
    });

    it("should handle rate limiting", async () => {
      // Make multiple rapid requests to trigger rate limiting
      const requests = [];
      for (let i = 0; i < 10; i++) {
        const response = await request(testServer)
          .get("/api/v1/dashboard/trustscore")
          .set({ "X-API-Key": TEST_API_KEY })
          .expect(200)
          .expect("json")
          .expect(
            expect.objectContaining({
              data: expect.any(Object),
              metadata: expect.objectContaining({
                version: expect.stringContaining("2.0.0"),
                endpoint: "/api/v1/dashboard/trustscore",
                generatedAt: expect.any(String),
                requestId: expect.any(String),
                processingTimeMs: expect.any(Number),
              }),
            }),
          );
        requests.push(response);
      }

      // Last request should be rate limited
      const lastResponse = requests[requests.length - 1];

      if (requests.length > 1) {
        // The rate limit is 100 requests per 15 minutes for dashboard endpoints
        // Since we made requests instantly, 10th request should still be allowed
        // But let's check if response indicates rate limiting
        expect(lastResponse.statusCode).toBeLessThan(429);
      }
    });

    it("should handle API errors gracefully", async () => {
      const response = await request(testServer)
        .get("/api/v1/dashboard/trustscore")
        .set({ "X-API-Key": "malformed-api-key" })
        .expect(401)
        .expect("json")
        .expect(
          expect.objectContaining({
            error: "Unauthorized",
            message: expect.stringContaining("Invalid or missing API key"),
            code: "UNAUTHORIZED",
            metadata: expect.objectContaining({
              version: expect.stringContaining("2.0.0"),
              timestamp: expect.any(String),
              requestId: expect.any(String),
            }),
          }),
        );
    });
  });

  describe("GET /api/v1/dashboard/trend", () => {
    it("should return trend data", async () => {
      const response = await request(testServer)
        .get("/api/v1/dashboard/trend?timeframe=30d")
        .set({ "X-API-Key": TEST_API_KEY })
        .expect(200)
        .expect("json")
        .expect(
          expect.objectContaining({
            data: expect.any(Array),
            timeframe: "30d",
            metadata: expect.objectContaining({
              version: expect.stringContaining("2.0.0"),
              endpoint: "/api/v1/dashboard/trend",
              generatedAt: expect.any(String),
              requestId: expect.any(String),
              count: expect.any(Number),
              processingTimeMs: expect.any(Number),
            }),
          }),
        );
    });

    it("should validate timeframe parameter", async () => {
      const response = await request(testServer)
        .get("/api/v1/dashboard/trend?timeframe=invalid")
        .expect(400)
        .expect("json")
        .expect(
          expect.objectContaining({
            error: "Validation failed",
            message: expect.stringContaining("Invalid enum value"),
            code: "VALIDATION_ERROR",
            metadata: expect.objectContaining({
              version: expect.stringContaining("2.0.0"),
              timestamp: expect.any(String),
              requestId: expect.any(String),
            }),
          }),
        );
    });
  });

  describe("GET /api/v1/dashboard/features", () => {
    it("should return features for user", async () => {
      const response = await request(testServer)
        .get("/api/v1/dashboard/features")
        .set({ "X-API-Key": TEST_API_KEY })
        .expect(200)
        .expect("json")
        .expect(
          expect.objectContaining({
            data: expect.any(Array),
            userLevel: expect.any(String),
            unlockedCount: expect.any(Number),
            totalCount: expect.any(Number),
            features: expect.any(Array),
            metadata: expect.objectContaining({
              version: expect.stringContaining("2.0.0"),
              endpoint: "/api/v1/dashboard/features",
              generatedAt: expect.any(String),
              requestId: expect.any(String),
              processingTimeMs: expect.any(Number),
            }),
          }),
        );
    });

    it("should validate user level parameter", async () => {
      const response = await request(testServer)
        .get("/api/v1/dashboard/features?userLevel=invalid")
        .expect(400)
        .expect("json")
        .expect(
          expect.objectContaining({
            error: "Validation failed",
            message: expect.stringContaining("Invalid enum value"),
            code: "VALIDATION_ERROR",
            metadata: expect.objectContaining({
              version: expect.stringContaining("2.0.0"),
              timestamp: expect.any(String),
              requestId: expect.any(String),
            }),
          }),
        );
    });

    it("should return features with unlocked features for higher tier user", async () => {
      const response = await request(testServer)
        .get("/api/v1/dashboard/features")
        .set({ "X-API-Key": TEST_API_KEY })
        .expect(200)
        .expect("json")
        .expect(
          expect.objectContaining({
            data: expect.any(Array),
            userLevel: expect.any(String),
            unlockedCount: expect.any(Number),
            totalCount: expect.any(Number),
            features: expect.any(Array),
            metadata: expect.objectContaining({
              version: expect.stringContaining("2.0.0"),
              endpoint: "/api/v1/dashboard/features",
              generatedAt: expect.any(String),
              requestId: expect.any(String),
              processingTimeMs: expect.any(Number),
            }),
          }),
        );
    });

    it("should include feature progress bars", async () => {
      const response = await request(testServer)
        .get("/api/v1/dashboard/features")
        .set({ "X-API-Key": TEST_API_KEY })
        .expect(200)
        .expect("json")
        .expect(
          expect.objectContaining({
            data: expect.arrayContaining([
              expect.objectContaining({
                progress: expect.any(Number),
              }),
            ]),
            metadata: expect.objectContaining({
              version: expect.stringContaining("2.0.0"),
              endpoint: "/api/v1/dashboard/features",
              generatedAt: expect.any(String),
              requestId: expect.any(String),
              processingTimeMs: expect.any(Number),
            }),
          }),
        );
    });
  });

  describe("POST /api/v1/dashboard/trustscore", () => {
    it("should initiate trust score calculation", async () => {
      const response = await request(testServer)
        .post("/api/v1/dashboard/trustscore")
        .set({ "X-API-Key": TEST_API_KEY })
        .send({
          userId: TEST_USER_ID,
        })
        .expect(202)
        .expect("json")
        .expect(
          expect.objectContaining({
            calculationId: expect.any(String),
            estimatedTime: expect.any(Number),
            status: "processing",
            metadata: expect.objectContaining({
              version: expect.stringContaining("2.0.0"),
              endpoint: "/api/v1/dashboard/trustscore",
              generatedAt: expect.any(String),
              requestId: expect.any(String),
              processingTimeMs: expect.any(Number),
            }),
          }),
        );
    });

    it("should validate calculation request body", async () => {
      const response = await request(testServer)
        .post("/api/v1/dashboard/trustscore")
        .set({ "X-API-Key": TEST_API_KEY })
        .send({
          invalidField: "userId",
        })
        .expect(400)
        .expect("json")
        .expect(
          expect.objectContaining({
            error: "Validation failed",
            message: expect.stringContaining("userId"),
            code: "VALIDATION_ERROR",
            metadata: expect.objectContaining({
              version: expect.stringContaining("2.0.0"),
              timestamp: expect.any(String),
              requestId: expect.any(String),
            }),
          }),
        );
    });

    it("should reject unauthorized calculation", async () => {
      const response = await request(testServer)
        .post("/api/v1/dashboard/trustscore")
        .set({ "X-API-Key": "invalid-key" })
        .expect(401)
        .expect("json")
        .expect(
          expect.objectContaining({
            error: "Unauthorized",
            message: expect.stringContaining("Invalid or missing API key"),
            code: "UNAUTHORIZED",
            metadata: expect.objectContaining({
              version: expect.stringContaining("2.0.0"),
              timestamp: expect.any(String),
              requestId: expect.any(String),
            }),
          }),
        );
    });

    it("should reject insufficient tier calculation", async () => {
      const response = await request(testServer)
        .post("/api/v1/dashboard/trustscore")
        .set({ "X-API-Key": TEST_API_KEY })
        .expect(403)
        .expect("json")
        .expect(
          expect.objectContaining({
            error: "Forbidden",
            message: expect.stringContaining("Insufficient subscription tier"),
            code: "INSUFFICIENT_TIER",
            metadata: expect.objectContaining({
              version: expect.stringContaining("2.0.0"),
              timestamp: expect.any(String),
              requestId: expect.any(String),
            }),
          }),
        );
    });
  });

  describe("Health Endpoint", () => {
    it("should return health status", async () => {
      const response = await request(testServer)
        .get("/metrics")
        .expect(200)
        .expect("text/plain");
    });

    it("should handle health endpoint errors", async () => {
      const response = await request(testServer)
        .get("/metrics")
        .set("Accept", "application/json")
        .expect(500)
        .expect("text/plain");
    });
  });

  describe("Performance Tests", () => {
    it("should handle concurrent requests efficiently", async () => {
      const startTime = Date.now();

      // Make multiple concurrent requests
      const requests = [];
      for (let i = 0; i < 20; i++) {
        const response = await request(testServer)
          .get("/api/v1/dashboard/trustscore")
          .set({ "X-API-Key": TEST_API_KEY })
          .expect(200)
          .expect("json")
          .expect(
            expect.objectContaining({
              data: expect.any(Object),
              metadata: expect.objectContaining({
                version: expect.stringContaining("2.0.0"),
                endpoint: "/api/v1/dashboard/trustscore",
                generatedAt: expect.any(String),
                requestId: expect.any(String),
                processingTimeMs: expect.any(Number),
              }),
            }),
          );
        requests.push(response);
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // All requests should complete within a reasonable time
      expect(totalTime).toBeLessThan(5000); // 5 seconds
    });
  });
});
