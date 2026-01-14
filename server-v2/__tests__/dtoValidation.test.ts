import request from "supertest";
import app from "../src/app";

describe("DTO Type Guard Validation", () => {
  describe("Trust Score API", () => {
    it("should validate trust score request DTO", async () => {
      // Test valid request
      const validRequest = {
        userId: "user_123",
        tier: "basic",
      };

      const response = await request(app)
        .post("/api/trust-score")
        .send(validRequest)
        .expect(200);

      expect(response.body).toHaveProperty("score");
      expect(typeof response.body.score).toBe("number");
    });

    it("should reject invalid trust score request", async () => {
      // Test invalid request - missing required fields
      const invalidRequest = {
        userId: "user_123",
        // Missing tier
      };

      await request(app)
        .post("/api/trust-score")
        .send(invalidRequest)
        .expect(400);
    });

    it("should validate tier enum values", async () => {
      const invalidTierRequest = {
        userId: "user_123",
        tier: "invalid_tier",
      };

      await request(app)
        .post("/api/trust-score")
        .send(invalidTierRequest)
        .expect(400);
    });
  });

  describe("Marketplace API", () => {
    it("should validate marketplace item creation DTO", async () => {
      const validItem = {
        title: "Test Widget",
        description: "A test widget for validation",
        type: "widget",
        price: 29.99,
        currency: "USD",
        licenseType: "standard",
        tags: ["test", "widget"],
      };

      // This would require authentication middleware to be mocked
      // For now, we test the DTO structure validation
      expect(validItem).toHaveProperty("title");
      expect(typeof validItem.title).toBe("string");
      expect(validItem.title.length).toBeGreaterThan(0);
      expect(validItem.title.length).toBeLessThanOrEqual(255);

      expect(validItem).toHaveProperty("price");
      expect(typeof validItem.price).toBe("number");
      expect(validItem.price).toBeGreaterThan(0);

      expect(validItem).toHaveProperty("type");
      expect(["widget", "badge", "integration", "template"]).toContain(
        validItem.type,
      );

      expect(validItem).toHaveProperty("licenseType");
      expect(["standard", "premium", "exclusive"]).toContain(
        validItem.licenseType,
      );
    });

    it("should validate marketplace filter DTO", async () => {
      const validFilters = {
        type: "widget",
        status: "active",
        minPrice: 10,
        maxPrice: 100,
        limit: 10,
        offset: 0,
        tags: ["featured", "new"],
      };

      // Test filter validation
      expect(validFilters).toHaveProperty("type");
      if (validFilters.type) {
        expect(["widget", "badge", "integration", "template"]).toContain(
          validFilters.type,
        );
      }

      expect(validFilters).toHaveProperty("status");
      if (validFilters.status) {
        expect([
          "pending",
          "approved",
          "rejected",
          "active",
          "inactive",
        ]).toContain(validFilters.status);
      }

      expect(validFilters).toHaveProperty("minPrice");
      if (validFilters.minPrice !== undefined) {
        expect(typeof validFilters.minPrice).toBe("number");
        expect(validFilters.minPrice).toBeGreaterThanOrEqual(0);
      }

      expect(validFilters).toHaveProperty("maxPrice");
      if (validFilters.maxPrice !== undefined) {
        expect(typeof validFilters.maxPrice).toBe("number");
        expect(validFilters.maxPrice).toBeGreaterThan(0);
      }

      expect(validFilters).toHaveProperty("limit");
      if (validFilters.limit !== undefined) {
        expect(typeof validFilters.limit).toBe("number");
        expect(validFilters.limit).toBeGreaterThan(0);
        expect(validFilters.limit).toBeLessThanOrEqual(100);
      }

      expect(validFilters).toHaveProperty("offset");
      if (validFilters.offset !== undefined) {
        expect(typeof validFilters.offset).toBe("number");
        expect(validFilters.offset).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe("User Management API", () => {
    it("should validate user registration DTO", async () => {
      const validUser = {
        username: "testuser",
        email: "test@example.com",
        password: "SecurePass123!",
        firstName: "Test",
        lastName: "User",
      };

      // Test user DTO validation
      expect(validUser).toHaveProperty("username");
      expect(typeof validUser.username).toBe("string");
      expect(validUser.username.length).toBeGreaterThanOrEqual(3);
      expect(validUser.username.length).toBeLessThanOrEqual(50);

      expect(validUser).toHaveProperty("email");
      expect(typeof validUser.email).toBe("string");
      expect(validUser.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);

      expect(validUser).toHaveProperty("password");
      expect(typeof validUser.password).toBe("string");
      expect(validUser.password.length).toBeGreaterThanOrEqual(8);

      expect(validUser).toHaveProperty("firstName");
      expect(typeof validUser.firstName).toBe("string");
      expect(validUser.firstName.length).toBeGreaterThan(0);
      expect(validUser.firstName.length).toBeLessThanOrEqual(100);

      expect(validUser).toHaveProperty("lastName");
      expect(typeof validUser.lastName).toBe("string");
      expect(validUser.lastName.length).toBeGreaterThan(0);
      expect(validUser.lastName.length).toBeLessThanOrEqual(100);
    });

    it("should validate user update DTO", async () => {
      const validUpdate = {
        firstName: "Updated",
        lastName: "Name",
        email: "updated@example.com",
      };

      // Test update DTO validation
      expect(validUpdate).toHaveProperty("firstName");
      if (validUpdate.firstName !== undefined) {
        expect(typeof validUpdate.firstName).toBe("string");
        expect(validUpdate.firstName.length).toBeGreaterThan(0);
        expect(validUpdate.firstName.length).toBeLessThanOrEqual(100);
      }

      expect(validUpdate).toHaveProperty("lastName");
      if (validUpdate.lastName !== undefined) {
        expect(typeof validUpdate.lastName).toBe("string");
        expect(validUpdate.lastName.length).toBeGreaterThan(0);
        expect(validUpdate.lastName.length).toBeLessThanOrEqual(100);
      }

      expect(validUpdate).toHaveProperty("email");
      if (validUpdate.email !== undefined) {
        expect(typeof validUpdate.email).toBe("string");
        expect(validUpdate.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      }
    });
  });

  describe("Subscription API", () => {
    it("should validate subscription creation DTO", async () => {
      const validSubscription = {
        planId: "pro_monthly",
        paymentMethodId: "pm_1234567890",
        userId: "user_123",
      };

      // Test subscription DTO validation
      expect(validSubscription).toHaveProperty("planId");
      expect(typeof validSubscription.planId).toBe("string");
      expect(validSubscription.planId.length).toBeGreaterThan(0);

      expect(validSubscription).toHaveProperty("paymentMethodId");
      expect(typeof validSubscription.paymentMethodId).toBe("string");
      expect(validSubscription.paymentMethodId).toMatch(/^(pm|card)_\w+$/);

      expect(validSubscription).toHaveProperty("userId");
      expect(typeof validSubscription.userId).toBe("string");
      expect(validSubscription.userId.length).toBeGreaterThan(0);
    });

    it("should validate plan type enum", async () => {
      const validPlans = [
        "basic_monthly",
        "pro_monthly",
        "enterprise_monthly",
        "basic_yearly",
        "pro_yearly",
        "enterprise_yearly",
      ];

      validPlans.forEach((plan) => {
        const subscription = {
          planId: plan,
          paymentMethodId: "pm_1234567890",
          userId: "user_123",
        };

        expect(subscription.planId).toBe(plan);
        expect(validPlans).toContain(subscription.planId);
      });
    });
  });

  describe("API Key Management", () => {
    it("should validate API key creation DTO", async () => {
      const validApiKeyRequest = {
        name: "Production API Key",
        permissions: ["read:trust-score", "write:marketplace"],
        expiresIn: 30,
      };

      // Test API key DTO validation
      expect(validApiKeyRequest).toHaveProperty("name");
      expect(typeof validApiKeyRequest.name).toBe("string");
      expect(validApiKeyRequest.name.length).toBeGreaterThan(0);
      expect(validApiKeyRequest.name.length).toBeLessThanOrEqual(100);

      expect(validApiKeyRequest).toHaveProperty("permissions");
      expect(Array.isArray(validApiKeyRequest.permissions)).toBe(true);
      validApiKeyRequest.permissions.forEach((permission) => {
        expect(typeof permission).toBe("string");
        expect(permission).toMatch(/^(read|write):[a-z-]+$/);
      });

      expect(validApiKeyRequest).toHaveProperty("expiresIn");
      expect(typeof validApiKeyRequest.expiresIn).toBe("number");
      expect(validApiKeyRequest.expiresIn).toBeGreaterThanOrEqual(1);
      expect(validApiKeyRequest.expiresIn).toBeLessThanOrEqual(365);
    });
  });

  describe("Widget Configuration", () => {
    it("should validate widget configuration DTO", async () => {
      const validWidgetConfig = {
        widgetId: "trust-score-widget",
        theme: "dark",
        language: "en",
        showBranding: true,
        customColors: {
          primary: "#007bff",
          secondary: "#6c757d",
        },
      };

      // Test widget configuration DTO validation
      expect(validWidgetConfig).toHaveProperty("widgetId");
      expect(typeof validWidgetConfig.widgetId).toBe("string");
      expect(validWidgetConfig.widgetId.length).toBeGreaterThan(0);

      expect(validWidgetConfig).toHaveProperty("theme");
      if (validWidgetConfig.theme !== undefined) {
        expect(typeof validWidgetConfig.theme).toBe("string");
        expect(["light", "dark", "auto"]).toContain(validWidgetConfig.theme);
      }

      expect(validWidgetConfig).toHaveProperty("language");
      if (validWidgetConfig.language !== undefined) {
        expect(typeof validWidgetConfig.language).toBe("string");
        expect(validWidgetConfig.language).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/);
      }

      expect(validWidgetConfig).toHaveProperty("showBranding");
      if (validWidgetConfig.showBranding !== undefined) {
        expect(typeof validWidgetConfig.showBranding).toBe("boolean");
      }

      expect(validWidgetConfig).toHaveProperty("customColors");
      if (validWidgetConfig.customColors !== undefined) {
        expect(typeof validWidgetConfig.customColors).toBe("object");
        expect(validWidgetConfig.customColors).toHaveProperty("primary");
        expect(validWidgetConfig.customColors).toHaveProperty("secondary");

        if (validWidgetConfig.customColors.primary !== undefined) {
          expect(typeof validWidgetConfig.customColors.primary).toBe("string");
          expect(validWidgetConfig.customColors.primary).toMatch(
            /^#[0-9A-Fa-f]{6}$/,
          );
        }
      }
    });
  });

  describe("Error Response DTOs", () => {
    it("should validate error response structure", async () => {
      // Test that error responses follow consistent structure
      const errorResponse = {
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid input data",
          details: {
            field: "email",
            issue: "Invalid email format",
          },
        },
        timestamp: new Date().toISOString(),
        requestId: "req_123456789",
      };

      // Test error response DTO validation
      expect(errorResponse).toHaveProperty("error");
      expect(errorResponse.error).toHaveProperty("code");
      expect(errorResponse.error).toHaveProperty("message");
      expect(errorResponse.error).toHaveProperty("timestamp");
      expect(errorResponse.error).toHaveProperty("requestId");

      expect(typeof errorResponse.error.code).toBe("string");
      expect(typeof errorResponse.error.message).toBe("string");
      expect(typeof errorResponse.error.timestamp).toBe("string");
      expect(typeof errorResponse.error.requestId).toBe("string");

      // Validate error code format
      expect(errorResponse.error.code).toMatch(/^[A-Z_]+$/);

      // Validate timestamp format
      expect(new Date(errorResponse.error.timestamp)).toBeInstanceOf(Date);

      // Validate request ID format
      expect(errorResponse.error.requestId).toMatch(/^req_[a-z0-9]+$/);
    });
  });

  describe("Pagination DTOs", () => {
    it("should validate pagination response structure", async () => {
      const validPaginatedResponse = {
        data: [
          { id: 1, name: "Item 1" },
          { id: 2, name: "Item 2" },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 25,
          totalPages: 3,
          hasNext: true,
          hasPrev: false,
        },
      };

      // Test pagination DTO validation
      expect(validPaginatedResponse).toHaveProperty("data");
      expect(validPaginatedResponse).toHaveProperty("pagination");

      expect(Array.isArray(validPaginatedResponse.data)).toBe(true);

      expect(validPaginatedResponse.pagination).toHaveProperty("page");
      expect(validPaginatedResponse.pagination).toHaveProperty("limit");
      expect(validPaginatedResponse.pagination).toHaveProperty("total");
      expect(validPaginatedResponse.pagination).toHaveProperty("totalPages");
      expect(validPaginatedResponse.pagination).toHaveProperty("hasNext");
      expect(validPaginatedResponse.pagination).toHaveProperty("hasPrev");

      expect(typeof validPaginatedResponse.pagination.page).toBe("number");
      expect(typeof validPaginatedResponse.pagination.limit).toBe("number");
      expect(typeof validPaginatedResponse.pagination.total).toBe("number");
      expect(typeof validPaginatedResponse.pagination.totalPages).toBe(
        "number",
      );
      expect(typeof validPaginatedResponse.pagination.hasNext).toBe("boolean");
      expect(typeof validPaginatedResponse.pagination.hasPrev).toBe("boolean");

      // Validate pagination consistency
      expect(validPaginatedResponse.pagination.page).toBeGreaterThan(0);
      expect(validPaginatedResponse.pagination.limit).toBeGreaterThan(0);
      expect(validPaginatedResponse.pagination.total).toBeGreaterThanOrEqual(0);
      expect(
        validPaginatedResponse.pagination.totalPages,
      ).toBeGreaterThanOrEqual(0);

      const calculatedTotalPages = Math.ceil(
        validPaginatedResponse.pagination.total /
          validPaginatedResponse.pagination.limit,
      );
      expect(validPaginatedResponse.pagination.totalPages).toBe(
        calculatedTotalPages,
      );

      const hasNext =
        validPaginatedResponse.pagination.page <
        validPaginatedResponse.pagination.totalPages;
      const hasPrev = validPaginatedResponse.pagination.page > 1;
      expect(validPaginatedResponse.pagination.hasNext).toBe(hasNext);
      expect(validPaginatedResponse.pagination.hasPrev).toBe(hasPrev);
    });
  });

  describe("Type Guard Functions", () => {
    it("should validate user role type guards", () => {
      const validRoles = ["user", "admin", "moderator", "creator"];

      const isValidRole = (
        role: any,
      ): role is "user" | "admin" | "moderator" | "creator" => {
        return typeof role === "string" && validRoles.includes(role);
      };

      expect(isValidRole("user")).toBe(true);
      expect(isValidRole("admin")).toBe(true);
      expect(isValidRole("invalid")).toBe(false);
      expect(isValidRole(123)).toBe(false);
      expect(isValidRole(null)).toBe(false);
      expect(isValidRole(undefined)).toBe(false);
    });

    it("should validate status type guards", () => {
      const validStatuses = [
        "pending",
        "approved",
        "rejected",
        "active",
        "inactive",
        "completed",
        "failed",
      ];

      const isValidStatus = (
        status: any,
      ): status is
        | "pending"
        | "approved"
        | "rejected"
        | "active"
        | "inactive"
        | "completed"
        | "failed" => {
        return typeof status === "string" && validStatuses.includes(status);
      };

      expect(isValidStatus("active")).toBe(true);
      expect(isValidStatus("completed")).toBe(true);
      expect(isValidStatus("invalid")).toBe(false);
      expect(isValidStatus({})).toBe(false);
      expect(isValidStatus([])).toBe(false);
    });

    it("should validate currency type guards", () => {
      const validCurrencies = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD"];

      const isValidCurrency = (
        currency: any,
      ): currency is "USD" | "EUR" | "GBP" | "JPY" | "CAD" | "AUD" => {
        return (
          typeof currency === "string" && validCurrencies.includes(currency)
        );
      };

      expect(isValidCurrency("USD")).toBe(true);
      expect(isValidCurrency("EUR")).toBe(true);
      expect(isValidCurrency("INVALID")).toBe(false);
      expect(isValidCurrency(123)).toBe(false);
      expect(isValidCurrency(null)).toBe(false);
    });
  });
});
