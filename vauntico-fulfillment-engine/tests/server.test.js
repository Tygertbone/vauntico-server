const request = require("supertest");
const app = require("../server");

// Mock environment variables for testing
process.env.NODE_ENV = "test";
process.env.ANTHROPIC_API_KEY = "test-key";
process.env.PAYSTACK_SECRET_KEY = "test-key";
process.env.SENTRY_DSN = "test-dsn";
process.env.SLACK_WEBHOOK_URL = "test-url";
process.env.SERVICE_API_KEY = "test-key";
process.env.SENDER_EMAIL = "test@example.com";

describe("Fulfillment Engine Tests", () => {
  test("should respond to health check", async () => {
    const response = await request(app).get("/health").expect(200);

    expect(response.body).toHaveProperty("status", "ok");
  });

  test("should return 404 for unknown routes", async () => {
    const response = await request(app).get("/unknown-route").expect(404);
  });
});
