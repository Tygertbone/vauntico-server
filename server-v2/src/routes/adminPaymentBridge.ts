import { Router } from 'express';
import { requireAdmin } from '../middleware/authenticate';
import { pool } from '../db/pool';

const router = Router();

// Get all payment bridge requests
router.get('/requests', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        pbr.id,
        pbr.user_id,
        pbr.amount_cents,
        pbr.currency,
        pbr.request_type,
        pbr.status,
        pbr.notes,
        pbr.created_at,
        u.email,
        u.first_name,
        u.last_name,
        pbr.bank_account
      FROM payment_bridge_requests pbr
      LEFT JOIN users u ON pbr.user_id = u.id
      ORDER BY pbr.created_at DESC
    `);

    res.json({
      success: true,
      data: result.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        amountCents: row.amount_cents,
        currency: row.currency,
        requestType: row.request_type,
        status: row.status,
        notes: row.notes,
        bankAccount: row.bank_account ? {
          accountName: row.bank_account?.account_name || '',
          accountNumber: row.bank_account?.account_number || '',
          bankName: row.bank_account?.bank_name || '',
          bankCode: row.bank_account?.bank_code || ''
        } : null,
        createdAt: row.created_at
      }))
    });
  } catch (error) {
    console.error('Error fetching payment bridge requests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment bridge requests'
    });
  }
});

// Process a payment request (approve/reject)
router.post('/requests/:requestId/process', requireAdmin, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action, notes } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid action. Must be "approve" or "reject"'
      });
    }

    // Update request status
    const result = await pool.query(`
      UPDATE payment_bridge_requests 
      SET status = $1, 
          notes = COALESCE($2, notes),
          processed_at = NOW(),
          processed_by_admin_id = $3
      WHERE id = $1
    `, [action, requestId]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Payment request not found'
      });
    }

    res.json({
      success: true,
      message: `Payment request ${action}d successfully`,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error processing payment request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process payment request'
    });
  }
});

// Get pending payout actions
router.get('/payouts', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        pbr.id,
        pbr.user_id,
        pbr.amount_cents,
        pbr.currency,
        pbr.request_type,
        pbr.status,
        pbr.processed_at,
        u.email,
        u.first_name,
        u.last_name,
        pbr.bank_account
      FROM payment_bridge_requests pbr
      LEFT JOIN users u ON pbr.user_id = u.id
      WHERE pbr.status = 'approved'
      ORDER BY pbr.processed_at DESC NULLS LAST
      LIMIT 10
    `);

    res.json({
      success: true,
      data: result.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        amountCents: row.amount_cents,
        currency: row.currency,
        requestType: row.request_type,
        status: row.status,
        processedAt: row.processed_at,
        bankAccount: row.bank_account ? {
          accountName: row.bank_account?.account_name || '',
          accountNumber: row.bank_account?.account_number || '',
          bankName: row.bank_account?.bank_name || '',
          bankCode: row.bank_account?.bank_code || ''
        } : null,
        canPayout: row.status === 'approved' && !row.processed_at
      }))
    });
  } catch (error) {
    console.error('Error fetching payouts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payouts'
    });
  }
});

// Process payout (mark as paid)
router.post('/payouts/:requestId/pay', requireAdmin, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { transactionReference, notes } = req.body;

    if (!transactionReference?.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Transaction reference is required'
      });
    }

    // Update as paid
    const result = await pool.query(`
      UPDATE payment_bridge_requests 
      SET status = 'paid',
          processed_at = NOW(),
          notes = COALESCE(notes, notes),
          transaction_reference = $1,
          processed_by_admin_id = $2
      WHERE id = $1 AND status = 'approved'
    `, [transactionReference, requestId]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Payment request not found or not approved'
      });
    }

    res.json({
      success: true,
      message: 'Payout processed successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error processing payout:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process payout'
    });
  }
});

export default router;
