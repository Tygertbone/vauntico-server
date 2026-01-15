import request from "supertest";
import app from "../../src/app";

describe("API Key Error Handling Tests", () => {
  describe("Invalid API Key Scenarios", () => {
    it("should reject requests with missing API key", async () => {
      const response = await request(app)
        .get("/trustscore/user_123")
        .expect(401);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toHaveProperty("code");
      expect(response.body.error).toHaveProperty("message");
      expect(response.body.error.code).toBe("MISSING_API_KEY");
      expect(response.body.error.message).toContain("API key is required");
    });

    it("should reject requests with empty API key", async () => {
      const response = await request(app)
        .get("/trustscore/user_123")
        .set("Authorization", "Bearer ")
        .expect(401);

      expect(response.body.error.code).toBe("MISSING_API_KEY");
    });

    it("should reject requests with malformed API key", async () => {
      const response = await request(app)
        .get("/trustscore/user_123")
        .set("Authorization", "Bearer invalid_format")
        .expect(401);

      expect(response.body.error.code).toBe("INVALID_API_KEY_FORMAT");
      expect(response.body.error.message).toContain("malformed");
    });

    it("should reject requests with revoked API key", async () => {
      const response = await request(app)
        .get("/trustscore/user_123")
        .set("Authorization", "Bearer revoked_key_123")
        .expect(401);

      expect(response.body.error.code).toBe("API_KEY_REVOKED");
      expect(response.body.error.message).toContain("revoked");
    });

    it("should reject requests with expired API key", async () => {
      const response = await request(app)
        .get("/trustscore/user_123")
        .set("Authorization", "Bearer expired_key_123")
        .expect(401);

      expect(response.body.error.code).toBe("API_KEY_EXPIRED");
      expect(response.body.error.message).toContain("expired");
    });

    it("should reject requests with rate-limited API key", async () => {
      const response = await request(app)
        .get("/trustscore/user_123")
        .set("Authorization", "Bearer rate_limited_key")
        .expect(429);

      expect(response.body.error.code).toBe("RATE_LIMITED");
      expect(response.body.error.message).toContain("rate limited");
    });

    it("should handle API key with insufficient permissions", async () => {
      const response = await request(app)
        .get("/admin/users")
        .set("Authorization", "Bearer read_only_key")
        .expect(403);

      expect(response.body.error.code).toBe("INSUFFICIENT_PERMISSIONS");
      expect(response.body.error.message).toContain("insufficient permissions");
    });
  });

  describe("API Key Validation Rules", () => {
    it("should validate API key format requirements", async () => {
      const validKeys = [
        "ak_test_valid_key_123456",
        "prod_v1_valid_key_789012",
      ];

      const invalidKeys = [
        "", // Empty
        "short", // Too short (min 20 chars)
        "invalid_format_key", // Contains invalid characters
        "toolongkey_12345678901234567890123456789", // Too long (max 200 chars)
        "key_with_spaces", // Contains spaces
        "key_with_special_chars", // Contains special characters except allowed ones
        null, // Null value
        undefined, // Undefined value
      ];

      // Test valid keys
      for (const validKey of validKeys) {
        const response = await request(app)
          .get("/trustscore/validate-key")
          .set("Authorization", `Bearer ${validKey}`)
          .expect(200);

        expect(response.body).toHaveProperty("valid");
        expect(response.body).toHaveProperty("key");
        expect(response.body.valid).toBe(true);
      }

      // Test invalid keys
      for (const invalidKey of invalidKeys) {
        const response = await request(app)
          .get("/trustscore/validate-key")
          .set("Authorization", `Bearer ${invalidKey}`)
          .expect(400);

        expect(response.body).toHaveProperty("valid");
        expect(response.body.valid).toBe(false);
        expect(response.body).toHaveProperty("errors");
        expect(Array.isArray(response.body.errors)).toBe(true);
      }
    });

    it("should enforce API key usage limits", async () => {
      const testKey = "test_rate_limit_key";

      // Test rate limiting by making rapid requests
      const requests = Array.from({ length: 10 }, (_, index) =>
        request(app)
          .get("/trustscore/user_123")
          .set("Authorization", `Bearer ${testKey}`)
      );

      const responses = await Promise.all(requests);

      // First few should succeed, then rate limiting should kick in
      const successful = responses.filter((r) => r.status === 200);
      const rateLimited = responses.filter((r) => r.status === 429);

      expect(successful.length).toBeGreaterThan(0);
      expect(rateLimited.length).toBeGreaterThan(0);
      expect(rateLimited.length).toBeLessThan(10);
    });

    it("should track API key usage metrics", async () => {
      const response = await request(app)
        .get("/trustscore/key-usage")
        .set("Authorization", "Bearer test-admin-key")
        .expect(200);

      expect(response.body).toHaveProperty("usage");
      expect(response.body).toHaveProperty("metrics");
      expect(response.body).toHaveProperty("limits");

      expect(typeof response.body.usage).toBe("object");
      expect(typeof response.body.metrics).toBe("object");
      expect(typeof response.body.limits).toBe("object");
    });
  });

  describe("API Key Management Endpoints", () => {
    it("should allow admin to generate new API keys", async () => {
      const keyData = {
        name: "Test API Key",
        permissions: ["read:trust-score", "write:trust-score"],
        expiresIn: 30,
        description: "API key for testing purposes",
      };

      const response = await request(app)
        .post("/admin/keys")
        .set("Authorization", "Bearer test-admin-key")
        .send(keyData)
        .expect(201);

      expect(response.body).toHaveProperty("keyId");
      expect(response.body).toHaveProperty("apiKey");
      expect(response.body).toHaveProperty("permissions");
      expect(response.body).toHaveProperty("createdAt");
      expect(response.body).toHaveProperty("expiresAt");

      expect(typeof response.body.apiKey).toBe("string");
      expect(response.body.apiKey).toMatch(/^[a-zA-Z0-9]{32,}$/);
      expect(Array.isArray(response.body.permissions)).toBe(true);
      expect(response.body.permissions).toContain("read:trust-score");
      expect(response.body.permissions).toContain("write:trust-score");
    });

    it("should allow user to view their API keys", async () => {
      const response = await request(app)
        .get("/admin/keys")
        .set("Authorization", "Bearer test-user-key")
        .expect(200);

      expect(response.body).toHaveProperty("keys");
      expect(Array.isArray(response.body.keys)).toBe(true);

      response.body.keys.forEach((key: any) => {
        expect(key).toHaveProperty("keyId");
        expect(key).toHaveProperty("name");
        expect(key).toHaveProperty("permissions");
        expect(key).toHaveProperty("createdAt");
        expect(key).toHaveProperty("expiresAt");
        expect(key).toHaveProperty("lastUsed");
        expect(key).toHaveProperty("usageCount");
      });
    });

    it("should allow admin to revoke API keys", async () => {
      const revokeData = {
        keyId: "test_key_to_revoke",
        reason: "Testing revocation functionality",
      };

      const response = await request(app)
        .post("/admin/keys/revoke")
        .set("Authorization", "Bearer test-admin-key")
        .send(revokeData)
        .expect(200);

      expect(response.body).toHaveProperty("revocationId");
      expect(response.body).toHaveProperty("revokedAt");
      expect(response.body).toHaveProperty("reason");
      expect(response.body).toHaveProperty("status");
      expect(response.body.status).toBe("revoked");
    });
  });

  describe("API Key Security Features", () => {
    it("should implement API key rotation", async () => {
      const rotationData = {
        keyId: "test_key_to_rotate",
        newApiKey: "rotated_key_123",
        gracePeriod: 300, // 5 minutes
      };

      const response = await request(app)
        .post("/admin/keys/rotate")
        .set("Authorization", "Bearer test-admin-key")
        .send(rotationData)
        .expect(200);

      expect(response.body).toHaveProperty("rotationId");
      expect(response.body).toHaveProperty("oldApiKey");
      expect(response.body).toHaveProperty("newApiKey");
      expect(response.body).toHaveProperty("gracePeriodEnds");
      expect(response.body).toHaveProperty("rotatedAt");
      expect(response.body).toHaveProperty("status");
      expect(response.body.status).toBe("rotated");
    });

    it("should provide API key usage audit trail", async () => {
      const response = await request(app)
        .get("/admin/keys/test_key_123/audit")
        .set("Authorization", "Bearer test-admin-key")
        .expect(200);

      expect(response.body).toHaveProperty("auditId");
      expect(response.body).toHaveProperty("keyId");
      expect(response.body).toHaveProperty("auditData");
      expect(response.body).toHaveProperty("generatedAt");

      expect(typeof response.body.auditData).toBe("object");
      expect(response.body.auditData).toHaveProperty("usage");
      expect(response.body.auditData).toHaveProperty("accessLog");
      expect(response.body.auditData).toHaveProperty("violations");
    });
  });

  describe("API Key Error Response Format", () => {
    it("should return consistent error response format", async () => {
      const response = await request(app)
        .get("/trustscore/user_123")
        .set("Authorization", "Bearer invalid_key");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error");
      expect(response.body).toHaveProperty("code");
      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("timestamp");
      expect(response.body).toHaveProperty("requestId");

      expect(typeof response.body.error.code).toBe("string");
      expect(typeof response.body.error.message).toBe("string");
      expect(typeof response.body.error.timestamp).toBe("string");
      expect(typeof response.body.error.requestId).toBe("string");

      // Verify timestamp format (ISO 8601)
      expect(() => {
        const timestamp = new Date(response.body.error.timestamp);
        return !isNaN(timestamp.getTime());
      }).toBe(true);
    });
  });
});
