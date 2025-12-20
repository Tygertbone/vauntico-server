import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';
import { sendSlackAlert } from '../utils/slack-alerts';
import { Resend } from 'resend';

const router = Router();

// Initialize Resend for failure alerts
const resend = new Resend(process.env.RESEND_API_KEY);

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Paystack webhook endpoint
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const event = req.body;

    // Log the full event to payments.log
    const logEntry = {
      timestamp: new Date().toISOString(),
      event_type: event.event,
      event_id: event.data?.id || 'unknown',
      reference: event.data?.reference || 'unknown',
      status: event.data?.status || 'unknown',
      amount: event.data?.amount || 0,
      currency: event.data?.currency || 'NGN',
      customer: event.data?.customer?.email || 'unknown',
      full_event: event
    };

    const logFile = path.join(logsDir, 'payments.log');
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');

    logger.info('Paystack webhook received', {
      eventType: event.event,
      eventId: event.data?.id,
      reference: event.data?.reference,
      status: event.data?.status
    });

    // Always send Slack alert for any webhook event
    await sendSlackAlert(
      `💳 Paystack Webhook: ${event.event}`,
      {
        event_type: event.event,
        reference: event.data?.reference,
        status: event.data?.status,
        amount: event.data?.amount,
        customer: event.data?.customer?.email,
        event_id: event.data?.id
      }
    );

    // Send Resend email alert if payment failed
    if (event.data?.status === 'failed') {
      await sendFailureEmailAlert(event);
    }

    // Always return 200 to Paystack
    res.status(200).json({ received: true });

  } catch (error) {
    logger.error('Paystack webhook processing error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      body: req.body
    });

    // Still return 200 to prevent Paystack retries
    res.status(200).json({ received: true, error: 'Processing error' });
  }
});

// Send email alert for failed payments
async function sendFailureEmailAlert(event: any): Promise<void> {
  try {
    if (!process.env.RESEND_API_KEY) {
      logger.warn('RESEND_API_KEY not configured, skipping failure email alert');
      return;
    }

    const customerEmail = event.data?.customer?.email;
    const amount = event.data?.amount ? (event.data.amount / 100).toFixed(2) : '0.00';
    const currency = event.data?.currency || 'NGN';
    const reference = event.data?.reference || 'unknown';

    // Send email to admin/support team
    const emailData = {
      from: 'Vauntico Alerts <alerts@vauntico.com>',
      to: process.env.ALERT_EMAIL || 'admin@vauntico.com',
      subject: `🚫 Payment Failed - ${reference}`,
      text: `
Payment Failure Alert

A payment has failed on Paystack.

Details:
- Reference: ${reference}
- Amount: ${currency} ${amount}
- Customer: ${customerEmail || 'Unknown'}
- Status: ${event.data?.status}
- Event Type: ${event.event}
- Timestamp: ${new Date().toISOString()}

Please investigate this payment failure.

Vauntico Payment System
      `.trim(),
      tags: [
        { name: 'alert_type', value: 'payment_failure' },
        { name: 'payment_reference', value: reference }
      ]
    };

    const result = await resend.emails.send(emailData);

    logger.info('Payment failure email sent', {
      reference,
      customerEmail,
      emailId: result.data?.id
    });

  } catch (error) {
    logger.error('Failed to send payment failure email', {
      error: error instanceof Error ? error.message : 'Unknown error',
      reference: event.data?.reference
    });
  }
}

export default router;
