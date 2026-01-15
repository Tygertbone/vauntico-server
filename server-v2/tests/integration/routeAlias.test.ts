import request from "supertest";
import app from "../../src/app";

describe("Route Alias Mapping Validation", () => {
  describe("Route Alias Resolution", () => {
    it("should resolve aliased routes to canonical endpoints", async () => {
      // Test route aliases that map to canonical endpoints
      const aliasTests = [
        {
          alias: "/api/v2/users",
          canonical: "/api/users",
          description: "Users API v2 alias",
        },
        {
          alias: "/legacy/api/users",
          canonical: "/api/users",
          description: "Legacy users API alias",
        },
        {
          alias: "/api/v1/trust-score",
          canonical: "/api/trust-score",
          description: "Trust score API v1 alias",
        },
        {
          alias: "/api/v2/trust-score",
          canonical: "/api/trust-score",
          description: "Trust score API v2 alias",
        },
        {
          alias: "/marketplace/v2/items",
          canonical: "/api/marketplace/items",
          description: "Marketplace items API v2 alias",
        },
        {
          alias: "/api/v1/marketplace",
          canonical: "/api/marketplace/items",
          description: "Marketplace API v1 alias",
        },
      ];

      for (const aliasTest of aliasTests) {
        const response = await request(app)
          .get(aliasTest.alias)
          .set("Authorization", "Bearer test-valid-key")
          .expect(200);

        expect(response.body).toHaveProperty("canonicalPath");
        expect(response.body.canonicalPath).toBe(aliasTest.canonical);
        expect(response.body).toHaveProperty("alias");
        expect(response.body).toHaveProperty("description");
        expect(response.body.description).toBe(aliasTest.description);
      }
    });

    it("should handle conflicting route aliases", async () => {
      // Test conflicting aliases (same alias mapping to different canonical paths)
      const conflictingAliases = [
        {
          alias: "/api/v2/users",
          canonical: "/api/users-v2",
        },
        {
          alias: "/api/v2/users",
          canonical: "/api/users-v3",
        },
        {
          alias: "/api/trust-score",
          canonical: "/api/trust-score-v2",
        },
        {
          alias: "/api/trust-score",
          canonical: "/api/trust-score-v3",
        },
      ];

      for (const conflict of conflictingAliases) {
        const response = await request(app)
          .get(conflict.alias)
          .set("Authorization", "Bearer test-valid-key")
          .expect(409); // Conflict status code

        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toHaveProperty("code");
        expect(response.body.error).toHaveProperty("message");
        expect(response.body.error.code).toBe("ROUTE_ALIAS_CONFLICT");
      }
    });

    it("should handle invalid route aliases", async () => {
      const invalidAliases = [
        { alias: "", canonical: "/api/users" }, // Empty alias
        { alias: "/invalid-path", canonical: "/api/users" }, // Invalid alias format
        { alias: null, canonical: "/api/users" }, // Null alias
        { alias: undefined, canonical: "/api/users" }, // Undefined alias
        { alias: 123, canonical: "/api/users" }, // Non-string alias
        { alias: "/users", canonical: "" }, // Empty canonical path
      ];

      for (const invalidAlias of invalidAliases) {
        const aliasToTest = (invalidAlias.alias ?? "/invalid") as string; // Handle null/undefined
        const response = await request(app)
          .get(aliasToTest)
          .set("Authorization", "Bearer test-valid-key")
          .expect(400);

        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toHaveProperty("code");
        expect([
          "INVALID_ALIAS_FORMAT",
          "INVALID_CANONICAL_PATH",
          "NULL_ALIAS",
          "UNDEFINED_ALIAS",
          "NON_STRING_ALIAS",
          "EMPTY_CANONICAL_PATH",
        ]).toContain(response.body.error.code);
      }
    });

    it("should handle deprecated route aliases", async () => {
      // Test deprecated aliases with warnings
      const deprecatedAliases = [
        {
          alias: "/api/v1/old-endpoint",
          canonical: "/api/old-endpoint",
          deprecated: true,
          warning: "Use /api/v2/old-endpoint instead",
          deprecationDate: "2024-01-01T00:00:00Z",
        },
        {
          alias: "/api/legacy/trust-score",
          canonical: "/api/trust-score",
          deprecated: true,
          warning: "Legacy API deprecated. Use /api/trust-score with v2 format",
          sunsetDate: "2024-06-30T23:59:59Z",
        },
      ];

      for (const deprecatedAlias of deprecatedAliases) {
        const response = await request(app)
          .get(deprecatedAlias.alias)
          .set("Authorization", "Bearer test-valid-key")
          .expect(200);

        expect(response.body).toHaveProperty("canonicalPath");
        expect(response.body).toHaveProperty("alias");
        expect(response.body).toHaveProperty("deprecated");
        expect(response.body).toHaveProperty("warning");
        expect(response.body).toHaveProperty("deprecationDate");

        if (deprecatedAlias.deprecationDate) {
          expect(response.body.deprecationDate).toBe(
            deprecatedAlias.deprecationDate
          );
        }

        expect(response.body.canonicalPath).toBe(deprecatedAlias.canonical);
        expect(response.body.deprecated).toBe(true);
      }
    });
  });

  describe("Route Alias Performance", () => {
    it("should resolve aliased routes quickly", async () => {
      const startTime = Date.now();
      const aliases = Array.from({ length: 100 }, (_, index) => ({
        alias: `/test/alias/${index}`,
        canonical: `/api/test/endpoint/${index}`,
        description: `Test alias ${index}`,
      }));

      // Test all aliases concurrently
      const requests = aliases.map((alias) =>
        request(app)
          .get(alias.alias)
          .set("Authorization", "Bearer test-valid-key")
          .expect(200)
      );

      const responses = await Promise.all(requests);
      const endTime = Date.now();
      const avgResponseTime = (endTime - startTime) / aliases.length;

      expect(responses).toHaveLength(aliases.length);
      responses.forEach((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("canonicalPath");
      });

      expect(avgResponseTime).toBeLessThan(50); // Average response time under 50ms
    });

    it("should cache route alias mappings", async () => {
      // Test that route alias mappings are cached appropriately
      const aliasResponse = await request(app)
        .get("/api/route-aliases/cache-status")
        .set("Authorization", "Bearer test-valid-key")
        .expect(200);

      expect(aliasResponse.body).toHaveProperty("cacheEnabled");
      expect(typeof aliasResponse.body.cacheEnabled).toBe("boolean");

      // Invalidate cache and test again
      const invalidateResponse = await request(app)
        .post("/api/route-aliases/cache/invalidate")
        .set("Authorization", "Bearer test-valid-key")
        .set("X-Cache-Invalidate", "all")
        .expect(200);

      const secondLookupResponse = await request(app)
        .get("/api/route-aliases/cache-status")
        .set("Authorization", "Bearer test-valid-key")
        .expect(200);

      expect(secondLookupResponse.body.cacheEnabled).toBe(true); // Cache should still be enabled
    });
  });

  describe("Route Alias Management", () => {
    it("should allow admin to manage route aliases", async () => {
      const newAlias = {
        alias: "/api/v2/new-feature",
        canonical: "/api/new-feature",
        description: "New feature API alias",
      };

      const updateResponse = await request(app)
        .post("/api/route-aliases")
        .set("Authorization", "Bearer admin-key")
        .set("Content-Type", "application/json")
        .send(newAlias)
        .expect(201);

      expect(updateResponse.body).toHaveProperty("aliasId");
      expect(updateResponse.body).toHaveProperty("status");
      expect(updateResponse.body.status).toBe("active");
    });

    it("should allow admin to deprecate route aliases", async () => {
      const deprecationData = {
        alias: "/api/v1/old-feature",
        deprecated: true,
        warning: "Use /api/v2/new-feature instead",
        deprecationDate: new Date().toISOString(),
        sunsetDate: new Date(
          Date.now() + 90 * 24 * 60 * 60 * 1000
        ).toISOString(),
      };

      const deprecationResponse = await request(app)
        .post("/api/route-aliases")
        .set("Authorization", "Bearer admin-key")
        .set("Content-Type", "application/json")
        .send(deprecationData)
        .expect(200);

      expect(deprecationResponse.body).toHaveProperty("status");
      expect(deprecationResponse.body.status).toBe("deprecated");
      expect(deprecationResponse.body).toHaveProperty("deprecationDate");
    });

    it("should validate route alias configuration", async () => {
      const validationResponse = await request(app)
        .get("/api/route-aliases/validation")
        .set("Authorization", "Bearer test-valid-key")
        .expect(200);

      expect(validationResponse.body).toHaveProperty("isValid");
      expect(validationResponse.body).toHaveProperty("errors");
      expect(Array.isArray(validationResponse.body.errors)).toBe(true);
    });
  });

  describe("Error Handling and Edge Cases", () => {
    it("should handle circular route alias references", async () => {
      // Test circular references in route aliases
      const circularAliases = [
        {
          alias: "/api/v2/users",
          canonical: "/api/v2/users",
        },
        {
          alias: "/api/v2/profile",
          canonical: "/api/v2/users", // Both point to same canonical
        },
        {
          alias: "/api/v2/settings",
          canonical: "/api/v2/profile",
        },
      ];

      const responses = await Promise.all(
        circularAliases.map((alias) =>
          request(app)
            .get(alias.alias)
            .set("Authorization", "Bearer test-valid-key")
            .expect(200)
        )
      );

      responses.forEach((response) => {
        expect(response.status).toBe(200);
      });

      // Should not throw circular reference errors, but admin might be notified
    });

    it("should handle route alias validation errors gracefully", async () => {
      const malformedAlias = {
        alias: "/api/v2/invalid!@#$%^&*()",
        canonical: "/api/v2/endpoint",
      };

      const response = await request(app)
        .get(malformedAlias.alias)
        .set("Authorization", "Bearer test-valid-key")
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toHaveProperty("code");
      expect(response.body.error.code).toBe("INVALID_ALIAS_FORMAT");
      expect(response.body.error).toHaveProperty("message");
      expect(typeof response.body.error.message).toBe("string");
    });

    it("should handle concurrent route alias modifications safely", async () => {
      const aliasId = "/api/v2/test-alias";

      // Simulate concurrent modifications
      const modifications = Array.from({ length: 3 }, (_, index) => ({
        description: `Updated description ${index}`,
        priority: index % 2 === 0 ? "high" : "normal",
      }));

      const promises = modifications.map((mod) =>
        request(app)
          .patch(`/api/route-aliases/${aliasId}`)
          .set("Authorization", "Bearer admin-key")
          .set("Content-Type", "application/json")
          .send(mod)
      );

      const results = await Promise.allSettled(promises);

      // At least one should succeed, but conflicts should be handled
      const successful = results.filter((r) => r.status === "fulfilled");
      const conflicts = results.filter((r) => r.status === "rejected");

      expect(successful.length + conflicts.length).toBe(3);
      expect(conflicts.length).toBeGreaterThan(0);
    });
  });
});
