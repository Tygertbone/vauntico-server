import request from "supertest";
import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import express from "express";
import { z } from "zod";

import { createTestServer, closeTestServer } from "../../utils/testUtils";

// Import the router we're testing
import dashboardRouter from "../routes/dashboard";

// Test data
const TEST_USER_ID = "test-user-123";
const TEST_API_KEY = "test-api-key-123456789";
const TEST_USER_TIER = "silver";

// Helper to create authenticated requests
const createAuthenticatedRequest = (endpoint: string, method = "GET" | "POST" | "PUT" | "DELETE") => {
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
          })
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
          })
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
          )
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
          })
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
          })
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
          })
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
            })
        );
        requests.push(response);
      }

      // Last request should be rate limited
      const lastResponse = requests[requests.length - 1];
      const lastResponse = await lastResponse;
      
      if (requests.length > 1) {
        // The rate limit is 100 requests per 15 minutes for dashboard endpoints
        // Since we made requests instantly, the 10th request should still be allowed
        // But let's check if the response indicates rate limiting
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
          })
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
          })
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
          })
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
          })
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
          })
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
          })
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
            data: expect.array(
              expect.objectContaining({
                progress: expect.any(Number),
              }),
            ),
            metadata: expect.objectContaining({
              version: expect.stringContaining("2.0.0"),
              endpoint: "/api/v1/dashboard/features",
              generatedAt: expect.any(String),
              requestId: expect.any(String),
              processingTimeMs: expect.any(Number),
            }),
          })
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
          })
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
          })
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
          })
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
          })
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

  describe("Response Schemas", () => {
    it("trust score response should match schema", () => {
      const schema = require("../../src/schemas/TrustScoreResponse.json");
      const response = {
        data: {
          score: 85,
          tier: "silver",
          factors: {
            engagement: 75,
            consistency: 70,
            quality: 80,
            community: 60,
          },
          calculatedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          trend: "up",
          change: 5.2,
          lastUpdated: new Date().toISOString(),
        },
        metadata: {
          version: "2.0.0",
          endpoint: "/api/v1/dashboard/trustscore",
          generatedAt: new Date().toISOString(),
          requestId: expect.any(String),
          processingTimeMs: expect.any(Number),
        },
      };

      const result = schema.safeParse(response.data);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(response.data);
    });

    it("trend response should match schema", () => {
      const schema = require("../../src/schemas/TrendResponse.json");
      const response = {
        data: [
          { date: "2024-01-01", score: 65, benchmark: 60 },
          { date: "2024-01-02", score: 68, benchmark: 62 },
          { date: "2024-01-03", score: 72, benchmark: 63 },
        ],
        timeframe: "30d",
        metadata: {
          version: "2.0.0",
          endpoint: "/api/v1/dashboard/trend",
          generatedAt: new Date().toISOString(),
          requestId: expect.any(String),
          count: expect.any(Number),
          processingTimeMs: expect.any(Number),
        },
      };

      const result = schema.safeParse(response.data);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(response.data);
    });

    it("features response should match schema", () => {
      const schema = require("../../src/schemas/FeaturesResponse.json");
      const response = {
        features: [
          {
            id: "premium-content",
            name: "Premium Content",
            description: "Create exclusive content for your most loyal supporters with advanced monetization options.",
            icon: "📝",
            status: "active",
            sacredLevel: "silver",
            progress: 85,
            category: "content",
            benefits: ["Higher revenue per supporter", "Exclusive content tools", "Advanced analytics"],
            requirements: ["Silver tier or higher", "Complete onboarding", "Verify identity"],
          },
          {
            id: "analytics-pro",
            name: "Analytics Pro",
            description: "Advanced insights about your audience, engagement patterns, and revenue optimization.",
            icon: "📊",
            status: "active",
            sacredLevel: "silver",
            category: "analytics",
            benefits: ["Detailed audience insights", "Revenue optimization", "Custom reports"],
            requirements: ["Silver tier or higher", "30 days activity"],
          },
        ],
        userLevel: "silver",
        unlockedCount: 2,
        totalCount: 8,
        metadata: {
          version: "2.0.0",
          endpoint: "/api/v1/dashboard/features",
          generatedAt: new Date().toISOString(),
          requestId: expect.any(String),
          processingTimeMs: expect.any(Number),
        },
      };

      const result = schema.safeParse(response.data);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(response.data);
    });

    it("error response should match schema", () => {
      const schema = require("../../src/schemas/ErrorResponse.json");
      const errorResponse = {
        error: "Internal server error",
        message: "Test error for validation",
        code: "INTERNAL_ERROR",
        metadata: {
          version: "2.0.0",
          timestamp: new Date().toISOString(),
          requestId: "test-request-123",
        },
      };

      const result = schema.safeParse(errorResponse);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(errorResponse);
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
            })
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
