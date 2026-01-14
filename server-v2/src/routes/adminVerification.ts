import { Router, type Router as ExpressRouter } from "express";
import { requireAdmin } from "../middleware/authenticate";
import { pool } from "../db/pool";

const router: ExpressRouter = Router();

// Get all verification requests
router.get("/requests", requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        vr.id,
        vr.user_id,
        vr.status,
        vr.verification_type,
        vr.documents_provided,
        vr.admin_notes,
        vr.created_at,
        u.email,
        u.first_name,
        u.last_name
      FROM verification_requests vr
      LEFT JOIN users u ON vr.user_id = u.id
      ORDER BY vr.created_at DESC
    `);

    res.json({
      success: true,
      data: result.rows.map((row) => ({
        id: row.id,
        userId: row.user_id,
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        verificationType: row.verification_type,
        status: row.status,
        documentsProvided: row.documents_provided,
        adminNotes: row.admin_notes,
        createdAt: row.created_at,
      })),
    });
  } catch (error) {
    console.error("Error fetching verification requests:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch verification requests",
    });
  }
});

// Process a verification request (approve/reject/request additional info)
router.post("/requests/:requestId/process", requireAdmin, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action, documents, adminNotes } = req.body;

    if (!["approve", "reject", "request_info"].includes(action)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid action. Must be "approve", "reject", or "request_info"',
      });
    }

    // Update request status
    const result = await pool.query(
      `
      UPDATE verification_requests 
      SET status = $1, 
          documents_provided = COALESCE($2, documents_provided),
          admin_notes = COALESCE($2, admin_notes),
          processed_at = NOW(),
          processed_by_admin_id = $3
      WHERE id = $1
    `,
      [action, requestId],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: "Verification request not found",
      });
    }

    res.json({
      success: true,
      message: `Verification request ${action}ed successfully`,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error processing verification request:", error);
    res.status(500).json({
      success: false,
      error: "Failed to process verification request",
    });
  }
});

// Get pending verifications
router.get("/pending", requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        vr.id,
        vr.user_id,
        vr.status,
        vr.verification_type,
        vr.documents_provided,
        vr.admin_notes,
        vr.created_at,
        u.email,
        u.first_name,
        u.last_name
      FROM verification_requests vr
      LEFT JOIN users u ON vr.user_id = u.id
      WHERE vr.status = 'pending'
      ORDER BY vr.created_at DESC
    `);

    res.json({
      success: true,
      data: result.rows.map((row) => ({
        id: row.id,
        userId: row.user_id,
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        verificationType: row.verification_type,
        status: row.status,
        documentsProvided: row.documents_provided,
        adminNotes: row.admin_notes,
        createdAt: row.created_at,
      })),
    });
  } catch (error) {
    console.error("Error fetching pending verifications:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch pending verifications",
    });
  }
});

export default router;
