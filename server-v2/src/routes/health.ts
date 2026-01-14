import { Router, type Router as ExpressRouter } from "express";
import { pool } from "../db/pool";

const router: ExpressRouter = Router();

router.get("/health", async (req, res) => {
  try {
    // Get counts for emergency services
    const [paymentRequestsResult, verificationsResult, recoveryCasesResult] =
      await Promise.all([
        pool.query(
          "SELECT COUNT(*) as count FROM creator_payment_requests WHERE status = 'pending'",
        ),
        pool.query(
          "SELECT COUNT(*) as count FROM creator_verifications WHERE status = 'pending'",
        ),
        pool.query(
          "SELECT COUNT(*) as count FROM content_recovery_cases WHERE status IN ('investigating', 'recovering', 'settled')",
        ),
      ]);

    const pendingPayments = parseInt(paymentRequestsResult.rows[0].count);
    const pendingVerifications = parseInt(verificationsResult.rows[0].count);
    const activeCases = parseInt(recoveryCasesResult.rows[0].count);

    return res.status(200).json({
      status: "ok",
      service: "backend-api",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "production",
      emergencyServices: {
        pendingPayments,
        pendingVerifications,
        activeCases,
      },
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return res.status(503).json({
      status: "error",
      service: "backend-api",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "production",
      error: "Database health check failed",
    });
  }
});

export default router;
