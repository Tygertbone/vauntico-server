import { Router, type Router as ExpressRouter } from "express";
import { requireAdmin } from "../middleware/authenticate";
import { pool } from "../db/pool";

const router: ExpressRouter = Router();

// Get all content recovery cases
router.get("/cases", requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        cr.id,
        cr.user_id,
        cr.status,
        cr.stolen_content_type,
        cr.platform,
        cr.stolen_amount,
        cr.recovered_amount,
        cr.case_notes,
        cr.admin_notes,
        cr.created_at,
        cr.resolved_at,
        u.email,
        u.first_name,
        u.last_name
      FROM content_recovery_cases cr
      LEFT JOIN users u ON cr.user_id = u.id
      ORDER BY cr.created_at DESC
    `);

    res.json({
      success: true,
      data: result.rows.map((row) => ({
        id: row.id,
        userId: row.user_id,
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        stolenContentType: row.stolen_content_type,
        platform: row.platform,
        stolenAmount: row.stolen_amount,
        recoveredAmount: row.recovered_amount,
        status: row.status,
        caseNotes: row.case_notes,
        adminNotes: row.admin_notes,
        createdAt: row.created_at,
        resolvedAt: row.resolved_at,
      })),
    });
  } catch (error) {
    console.error("Error fetching content recovery cases:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch content recovery cases",
    });
  }
});

// Get active cases
router.get("/active", requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        cr.id,
        cr.user_id,
        cr.status,
        cr.stolen_content_type,
        cr.platform,
        cr.stolen_amount,
        cr.recovered_amount,
        cr.case_notes,
        cr.admin_notes,
        cr.created_at,
        cr.resolved_at,
        u.email,
        u.first_name,
        u.last_name
      FROM content_recovery_cases cr
      LEFT JOIN users u ON cr.user_id = u.id
      WHERE cr.status IN ('investigating', 'recovering', 'settled')
      ORDER BY cr.created_at DESC
    `);

    res.json({
      success: true,
      data: result.rows.map((row) => ({
        id: row.id,
        userId: row.user_id,
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        stolenContentType: row.stolen_content_type,
        platform: row.platform,
        stolenAmount: row.stolen_amount,
        recoveredAmount: row.recovered_amount,
        status: row.status,
        caseNotes: row.case_notes,
        adminNotes: row.admin_notes,
        createdAt: row.created_at,
        resolvedAt: row.resolved_at,
      })),
    });
  } catch (error) {
    console.error("Error fetching active cases:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch active cases",
    });
  }
});

// Create a new case
router.post("/cases", requireAdmin, async (req, res) => {
  try {
    const { userId, stolenContentType, platform, stolenAmount, caseNotes } =
      req.body;

    // Validate required fields
    if (
      !userId ||
      !stolenContentType ||
      !platform ||
      !stolenAmount ||
      stolenAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        error:
          "Missing required fields: userId, stolenContentType, platform, stolenAmount (> 0)",
      });
    }

    // Check if user has an active case
    const existingCase = await pool.query(
      `
      SELECT COUNT(*) as active_count
      FROM content_recovery_cases 
      WHERE user_id = $1 AND status IN ('investigating', 'recovering', 'settled')
    `,
      [userId],
    );

    if (parseInt(existingCase.rows[0].active_count) > 0) {
      return res.status(400).json({
        success: false,
        error: "User already has an active recovery case",
      });
    }

    // Create new case
    const result = await pool.query(`
      INSERT INTO content_recovery_cases (
        user_id, stolen_content_type, platform, stolen_amount, case_notes, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, 'investigating', NOW())
      RETURNING id, created_at
    `);

    res.json({
      success: true,
      message: "Content recovery case created successfully",
      data: {
        id: result.rows[0].id,
        userId,
        stolenContentType,
        platform,
        stolenAmount,
        status: "investigating",
        caseNotes,
        createdAt: result.rows[0].created_at,
      },
    });
  } catch (error) {
    console.error("Error creating content recovery case:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create content recovery case",
    });
  }
});

// Update case status
router.post("/cases/:caseId/update", requireAdmin, async (req, res) => {
  try {
    const { caseId } = req.params;
    const { status, recoveredAmount, adminNotes } = req.body;

    if (!["investigating", "recovering", "settled"].includes(status)) {
      return res.status(400).json({
        success: false,
        error:
          'Invalid status. Must be "investigating", "recovering", or "settled"',
      });
    }

    // Update case
    const updateValues: string[] = ["status = $1", "updated_at = NOW()"];
    const queryParams: any[] = [status];

    if (status === "settled" && recoveredAmount) {
      updateValues.push(`recovered_amount = $${queryParams.length + 1}`);
      queryParams.push(recoveredAmount);
    }

    if (adminNotes) {
      updateValues.push(`admin_notes = $${queryParams.length + 1}`);
      queryParams.push(adminNotes);
    }

    queryParams.push(caseId);

    const result = await pool.query(
      `
      UPDATE content_recovery_cases 
      SET ${updateValues.join(", ")}
      WHERE id = $${queryParams.length}
      RETURNING id, status, recovered_amount, admin_notes, updated_at
    `,
      queryParams,
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: "Content recovery case not found",
      });
    }

    res.json({
      success: true,
      message: "Content recovery case updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating content recovery case:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update content recovery case",
    });
  }
});

export default router;
