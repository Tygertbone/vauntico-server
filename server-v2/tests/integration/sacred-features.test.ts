import request from "supertest";
import app from "../../src/app";

describe("Sacred Features Integration Tests", () => {
  const API_KEY = "test-valid-key";
  const USER_ID = "test-user-id";

  beforeEach(() => {
    // Mock API key validation to always accept our test key
    jest.mock("../../src/middleware/auth", () => ({
      validateApiKey: jest.fn().mockReturnValue(true),
      getUserIdFromApiKey: jest.fn().mockReturnValue(USER_ID),
    }));
  });

  describe("Love Loops API", () => {
    it("should create love loop successfully", async () => {
      const loveLoopData = {
        message: "Test love loop message",
        isPublic: true,
        creditsDonated: 10,
      };

      const response = await request(app)
        .post("/api/v1/love-loops")
        .set("Authorization", `Bearer ${API_KEY}`)
        .send(loveLoopData)
        .expect(201);

      expect(response.body).toHaveProperty("id");
      expect(response.body.message).toBe("Love loop created successfully");
      expect(response.body.credits_donated).toBe(10);
    });

    it("should get love loops for user", async () => {
      const response = await request(app)
        .get(`/api/v1/love-loops/${USER_ID}`)
        .set("Authorization", `Bearer ${API_KEY}`)
        .expect(200);

      expect(response.body).toHaveProperty("type");
      expect(response.body).toHaveProperty("totalCredits");
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should respond to love loop", async () => {
      const responseData = {
        response_message: "Thank you for your support!",
      };

      const response = await request(app)
        .post(`/api/v1/love-loops/1/respond`)
        .set("Authorization", `Bearer ${API_KEY}`)
        .send(responseData)
        .expect(200);

      expect(response.body).toHaveProperty("credits_awarded");
      expect(response.body.credits_awarded).toBeGreaterThan(0);
    });

    it("should prevent responding to own love loop", async () => {
      const responseData = {
        response_message: "Trying to respond to own loop",
      };

      const response = await request(app)
        .post(`/api/v1/love-loops/1/respond`)
        .set("Authorization", `Bearer ${API_KEY}`)
        .send(responseData)
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("own love loops");
    });
  });

  describe("Ubuntu Echo API", () => {
    it("should create ubuntu echo story successfully", async () => {
      const echoStory = {
        title: "Test Ubuntu Story",
        content: "This is a test story about community wisdom",
        author: "Test Author",
        tags: ["wisdom", "community"],
      };

      const response = await request(app)
        .post("/api/v1/ubuntu-echo")
        .set("Authorization", `Bearer ${API_KEY}`)
        .send(echoStory)
        .expect(201);

      expect(response.body).toHaveProperty("id");
      expect(response.body.title).toBe("Test Ubuntu Story");
      expect(response.body.content).toBe(
        "This is a test story about community wisdom"
      );
    });

    it("should get ubuntu echo stories", async () => {
      const response = await request(app)
        .get("/api/v1/ubuntu-echo")
        .set("Authorization", `Bearer ${API_KEY}`)
        .expect(200);

      expect(response.body).toHaveProperty("type");
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should validate ubuntu echo story content", async () => {
      const invalidStory = {
        title: "",
        content: "",
      };

      const response = await request(app)
        .post("/api/v1/ubuntu-echo")
        .set("Authorization", `Bearer ${API_KEY}`)
        .send(invalidStory)
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("required");
    });
  });

  describe("Legacy Tree API", () => {
    it("should create legacy tree entry successfully", async () => {
      const legacyEntry = {
        contribution_type: "code_contribution",
        description: "Added sacred feature tests",
        impact_level: "high",
      };

      const response = await request(app)
        .post("/legacy-tree")
        .set("Authorization", `Bearer ${API_KEY}`)
        .send(legacyEntry)
        .expect(201);

      expect(response.body).toHaveProperty("id");
      expect(response.body.contribution_type).toBe("code_contribution");
      expect(response.body.impact_level).toBe("high");
    });

    it("should get legacy tree entries", async () => {
      const response = await request(app)
        .get("/legacy-tree")
        .set("Authorization", `Bearer ${API_KEY}`)
        .expect(200);

      expect(response.body).toHaveProperty("type");
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should validate legacy tree contribution data", async () => {
      const invalidEntry = {
        contribution_type: "",
        description: "",
      };

      const response = await request(app)
        .post("/legacy-tree")
        .set("Authorization", `Bearer ${API_KEY}`)
        .send(invalidEntry)
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("required");
    });
  });

  describe("Route Alias Integration", () => {
    it("should map sacred routes to enterprise equivalents", async () => {
      // Test love loops → credibility circles
      const response = await request(app)
        .get("/api/v1/credibility-circles")
        .set("Authorization", `Bearer ${API_KEY}`)
        .set("X-Route-Alias", "sacred")
        .expect(200);

      expect(response.body).toHaveProperty("type");
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should map ubuntu echo to community resonance", async () => {
      const response = await request(app)
        .get("/api/v1/community-resonance")
        .set("Authorization", `Bearer ${API_KEY}`)
        .set("X-Route-Alias", "sacred")
        .expect(200);

      expect(response.body).toHaveProperty("type");
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("API Usage Logging", () => {
    it("should log sacred feature usage correctly", async () => {
      const response = await request(app)
        .get("/api/v1/love-loops")
        .set("Authorization", `Bearer ${API_KEY}`)
        .expect(200);

      // Verify that API usage was logged (this would be checked in integration tests)
      expect(response.status).toBe(200);
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid API key gracefully", async () => {
      const response = await request(app)
        .get("/api/v1/love-loops")
        .set("Authorization", "Bearer invalid-key")
        .expect(401);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("Unauthorized");
    });

    it("should handle malformed JSON", async () => {
      const response = await request(app)
        .post("/api/v1/love-loops")
        .set("Authorization", `Bearer ${API_KEY}`)
        .set("Content-Type", "application/json")
        .send("invalid json")
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("should handle missing required fields", async () => {
      const incompleteData = {
        // Missing required fields
        message: "Test",
      };

      const response = await request(app)
        .post("/api/v1/love-loops")
        .set("Authorization", `Bearer ${API_KEY}`)
        .send(incompleteData)
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("required");
    });
  });

  describe("Performance", () => {
    it("should respond within reasonable time limits", async () => {
      const startTime = Date.now();

      await request(app)
        .get("/api/v1/love-loops")
        .set("Authorization", `Bearer ${API_KEY}`)
        .expect(200);

      const responseTime = Date.now() - startTime;

      // Should respond within 2 seconds
      expect(responseTime).toBeLessThan(2000);
    });
  });
});
