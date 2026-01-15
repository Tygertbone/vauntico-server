import type {
  Request,
  Response} from "express";
import {
  Router,
  type Router as ExpressRouter
} from "express";
import { body, validationResult } from "express-validator";
import { authenticate, requireAdmin } from "../middleware/authenticate";
import { query, transaction } from "../db/pool";
import { logger } from "../utils/logger";
import { sendSlackAlert } from "../utils/slack-alerts";
import { paystackService } from "../services/paystackService";
import { securityMonitor, SecurityEventType } from "../middleware/security";

const router: ExpressRouter = Router();

// Input validation for payment requests
const paymentRequestValidation = [
  body("amount")
    .isInt({ min: 1000 })
    .withMessage("Amount must be at least 1000 cents ($10)"),
  body("currency")
    .isIn(["NGN", "USD", "EUR"])
    .withMessage("Currency must be NGN, USD, or EUR"),
  body("requestType")
    .isIn(["payout", "bridge", "refund"])
    .withMessage("Request type must be payout, bridge, or refund"),
  body("bankAccount")
    .isObject()
    .withMessage("Bank account details must be an object"),
  body("notes")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Notes cannot exceed 500 characters"),
];

// Pagination validation for requests list
const paginationValidation = [
  body("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  body("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  body("status")
    .optional()
    .isIn(["pending", "processing", "paid", "failed", "cancelled"])
    .withMessage("Status must be a valid payment request status"),
];

// POST /api/v1/payment-bridge/request - Create payment request
router.post(
  "/request",
  authenticate,
  paymentRequestValidation,
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation Error",
          message: "Please check your input",
          details: errors.array(),
        });
      }

      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          error: "Unauthorized",
          message: "Authentication required",
        });
      }

      // Non-null assertion is safe here since we've checked userId above
      const typedUserId: string = userId!;

      const { amount, currency, requestType, bankAccount, notes } = req.body;

      // Calculate 10% processing fee
      const processingFeeCents = Math.round(amount * 0.1);
      const totalAmountCents = amount + processingFeeCents;

      // Generate unique reference
      const reference = `PAYREQ_${Date.now()}_${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

      // Log security event for payment request
      await securityMonitor.logSecurityEvent({
        type: SecurityEventType.PAYMENT_REQUEST,
        severity: "medium",
        ip: req.ip,
        userAgent: req.get("User-Agent") || "",
        userId: userId,
        endpoint: req.path,
        method: req.method,
        details: {
          amount,
          currency,
          requestType,
          reference,
          processingFee: processingFeeCents,
        },
      });

      // Insert payment request into database
      const result = await query(
        `
      INSERT INTO creator_payment_requests (
        creator_id, request_type, amount_cents, currency, 
        status, external_transaction_id, bank_account_details, 
        processing_fee_cents, notes, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      RETURNING id, reference, created_at, status
    `,
        [
          typedUserId,
          requestType,
          amount,
          currency,
          "pending",
          reference,
          JSON.stringify(bankAccount),
          processingFeeCents,
          notes || null,
        ],
      );

      const paymentRequest = result.rows[0];

      // Send Slack notification
      await sendSlackAlert(
        `💰 Payment Request Created: ${requestType.toUpperCase()}`,
        {
          type: "payment_request_created",
          userId,
          reference: paymentRequest.reference,
          amount: amount / 100,
          currency,
          processingFee: processingFeeCents / 100,
          status: paymentRequest.status,
          notes: notes || null,
        },
      );

      logger.info("Payment request created", {
        userId,
        reference: paymentRequest.reference,
        amount,
        currency,
        requestType,
        processingFee: processingFeeCents,
      });

      res.status(201).json({
        message: "Payment request created successfully",
        request: {
          id: paymentRequest.id,
          reference: paymentRequest.reference,
          amount,
          processingFee: processingFeeCents,
          totalAmount: totalAmountCents,
          currency,
          status: paymentRequest.status,
          createdAt: paymentRequest.created_at,
        },
      });
    } catch (error) {
      logger.error("Failed to create payment request", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: req.user?.userId,
      });

      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to create payment request",
      });
    }
  },
);

// GET /api/v1/payment-bridge/requests - Get user's payment requests
router.get(
  "/requests",
  authenticate,
  paginationValidation,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          error: "Unauthorized",
          message: "Authentication required",
        });
      }

      const page: number = req.body.page || 1;
      const limit: number = req.body.limit || 20;
      const status: string | undefined = req.body.status;

      // Build query with optional status filter
      let whereClause = "WHERE creator_id = $1";
      const queryParams = [userId];

      if (status) {
        whereClause += " AND status = $2";
        queryParams.push(status);
      }

      // Get total count for pagination
      const countResult = await query(
        `
      SELECT COUNT(*) as total 
      FROM creator_payment_requests 
      ${whereClause}
    `,
        queryParams,
      );

      const total = parseInt(countResult.rows[0].total);
      const offset = (page - 1) * limit;

      // Get paginated results
      const requestsResult = await query(
        `
      SELECT id, reference, request_type, amount_cents, currency, 
             status, processing_fee_cents, created_at, updated_at, 
             processed_at, notes, rejection_reason
      FROM creator_payment_requests 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `,
        [...queryParams, limit, offset],
      );

      const requests = requestsResult.rows;

      // Log security event for requests access
      await securityMonitor.logSecurityEvent({
        type: SecurityEventType.DATA_ACCESS,
        severity: "low",
        ip: req.ip,
        userAgent: req.get("User-Agent") || "",
        userId,
        endpoint: req.path,
        method: req.method,
        details: { page, limit, status, requestCount: requests.length },
      });

      res.json({
        message: "Payment requests retrieved successfully",
        requests: {
          data: requests,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: offset + limit < total,
          },
        },
      });
    } catch (error) {
      logger.error("Failed to retrieve payment requests", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: req.user?.userId,
      });

      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to retrieve payment requests",
      });
    }
  },
);

// POST /api/v1/payment-bridge/payout/:id - Admin: Trigger Paystack payout
router.post(
  "/payout/:id",
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const requestId = req.params.id;
      const adminUserId = req.user?.userId;

      // Validate request ID
      if (
        !requestId ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(requestId)
      ) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Invalid request ID format",
        });
      }

      // Get payment request details
      const result = await query(
        `
      SELECT pr.*, u.email as creator_email
      FROM creator_payment_requests pr
      JOIN users u ON pr.creator_id = u.id
      WHERE pr.id = $1 AND pr.status = 'pending'
    `,
        [requestId],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "Not Found",
          message: "Payment request not found or already processed",
        });
      }

      const paymentRequest = result.rows[0];

      // Update status to processing
      await query(
        `
      UPDATE creator_payment_requests 
      SET status = 'processing', updated_at = NOW() 
      WHERE id = $1
    `,
        [requestId],
      );

      try {
        // Initiate Paystack payout
        const payout = await paystackService.initiatePayout({
          recipient: paymentRequest.bank_account_details,
          amount: paymentRequest.amount_cents,
          currency: paymentRequest.currency,
          reference: paymentRequest.reference,
          reason: `Vauntico payout - ${paymentRequest.notes || "Creator payment request"}`,
        });

        // Update with Paystack reference
        await query(
          `
        UPDATE creator_payment_requests 
        SET paystack_reference = $1, external_transaction_id = $2, updated_at = NOW()
        WHERE id = $3
      `,
          [payout.reference, payout.transfer_code, requestId],
        );

        // Send Slack alert for payout initiation
        await sendSlackAlert(
          `🏦 Paystack Payout Initiated: ${paymentRequest.reference}`,
          {
            type: "payout_initiated",
            requestId,
            reference: paymentRequest.reference,
            paystackReference: payout.reference,
            amount: paymentRequest.amount_cents / 100,
            currency: paymentRequest.currency,
            creatorEmail: paymentRequest.creator_email,
            adminUserId,
          },
        );

        logger.info("Paystack payout initiated", {
          requestId,
          reference: paymentRequest.reference,
          paystackReference: payout.reference,
          amount: paymentRequest.amount_cents,
        });

        res.json({
          message: "Payout initiated successfully",
          payout: {
            requestId,
            reference: paymentRequest.reference,
            paystackReference: payout.reference,
            status: "processing",
          },
        });
      } catch (payoutError) {
        // Update status back to pending on failure
        await query(
          `
        UPDATE creator_payment_requests 
        SET status = 'pending', rejection_reason = $1, updated_at = NOW()
        WHERE id = $2
      `,
          [
            payoutError instanceof Error
              ? payoutError.message
              : "Unknown payout error",
            requestId,
          ],
        );

        // Send Slack alert for payout failure
        await sendSlackAlert(`❌ Payout Failed: ${paymentRequest.reference}`, {
          type: "payout_failed",
          requestId,
          reference: paymentRequest.reference,
          error:
            payoutError instanceof Error
              ? payoutError.message
              : "Unknown error",
          creatorEmail: paymentRequest.creator_email,
          adminUserId,
        });

        logger.error("Payout initiation failed", {
          requestId,
          reference: paymentRequest.reference,
          error:
            payoutError instanceof Error
              ? payoutError.message
              : "Unknown error",
        });

        res.status(500).json({
          error: "Payout Failed",
          message: "Failed to initiate Paystack payout",
        });
      }
    } catch (error) {
      logger.error("Failed to process payout", {
        error: error instanceof Error ? error.message : "Unknown error",
        requestId: req.params.id,
        adminUserId: req.user?.userId,
      });

      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to process payout",
      });
    }
  },
);

// GET /api/v1/payment-bridge/status/:id - Check payment request status
router.get("/status/:id", authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const requestId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required",
      });
    }

    // Validate request ID
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(requestId)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid request ID format",
      });
    }

    // Get payment request with ownership check
    const result = await query(
      `
      SELECT pr.*, u.email as creator_email
      FROM creator_payment_requests pr
      JOIN users u ON pr.creator_id = u.id
      WHERE pr.id = $1 AND pr.creator_id = $2
    `,
      [requestId, userId as string],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Not Found",
        message: "Payment request not found",
      });
    }

    const paymentRequest = result.rows[0];

    // Log security event for status check
    await securityMonitor.logSecurityEvent({
      type: SecurityEventType.DATA_ACCESS,
      severity: "low",
      ip: req.ip || "",
      userAgent: req.get("User-Agent") || "",
      userId,
      endpoint: req.path,
      method: req.method,
      details: { requestId, status: paymentRequest.status },
    });

    res.json({
      message: "Payment request status retrieved successfully",
      request: {
        id: paymentRequest.id,
        reference: paymentRequest.reference,
        requestType: paymentRequest.request_type,
        amount: paymentRequest.amount_cents,
        processingFee: paymentRequest.processing_fee_cents,
        currency: paymentRequest.currency,
        status: paymentRequest.status,
        paystackReference: paymentRequest.paystack_reference,
        createdAt: paymentRequest.created_at,
        updatedAt: paymentRequest.updated_at,
        processedAt: paymentRequest.processed_at,
        notes: paymentRequest.notes,
        rejectionReason: paymentRequest.rejection_reason,
      },
    });
  } catch (error) {
    logger.error("Failed to get payment request status", {
      error: error instanceof Error ? error.message : "Unknown error",
      requestId: req.params.id,
      userId: req.user?.userId,
    });

    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to retrieve payment request status",
    });
  }
});

export default router;
