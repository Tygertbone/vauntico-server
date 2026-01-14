import request from "supertest";
import app from "../src/app";
import crypto from "crypto";

describe("Paystack Webhook Signature Verification", () => {
  const PAYSTACK_SECRET_KEY =
    process.env.PAYSTACK_SECRET_KEY || "test_secret_key";

  const generateSignature = (body: any): string => {
    const hmac = crypto.createHmac("sha512", PAYSTACK_SECRET_KEY);
    return hmac.update(JSON.stringify(body)).digest("hex");
  };

  const mockWebhookEvent = {
    event: "charge.success",
    data: {
      id: 12345,
      reference: "test_ref_123",
      status: "success",
      amount: 10000,
      currency: "NGN",
      customer: {
        email: "test@example.com",
      },
    },
  };

  describe("POST /paystack/webhook", () => {
    it("should reject requests without x-paystack-signature header", async () => {
      const response = await request(app)
        .post("/api/paystack/webhook")
        .send(mockWebhookEvent);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Unauthorized");
      expect(response.body.message).toBe("Missing webhook signature");
    });

    it("should reject requests with invalid signature", async () => {
      const invalidSignature = "invalid_signature_12345";

      const response = await request(app)
        .post("/api/paystack/webhook")
        .set("x-paystack-signature", invalidSignature)
        .send(mockWebhookEvent);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Unauthorized");
      expect(response.body.message).toBe("Invalid webhook signature");
    });

    it("should accept requests with valid signature", async () => {
      const validSignature = generateSignature(mockWebhookEvent);

      const response = await request(app)
        .post("/api/paystack/webhook")
        .set("x-paystack-signature", validSignature)
        .send(mockWebhookEvent);

      expect(response.status).toBe(200);
      expect(response.body.received).toBe(true);
    });

    it("should handle different event types with valid signatures", async () => {
      const failedPaymentEvent = {
        event: "charge.failed",
        data: {
          id: 67890,
          reference: "test_ref_failed",
          status: "failed",
          amount: 5000,
          currency: "NGN",
          customer: {
            email: "failed@example.com",
          },
        },
      };

      const validSignature = generateSignature(failedPaymentEvent);

      const response = await request(app)
        .post("/api/paystack/webhook")
        .set("x-paystack-signature", validSignature)
        .send(failedPaymentEvent);

      expect(response.status).toBe(200);
      expect(response.body.received).toBe(true);
    });
  });
});
