const crypto = require('crypto');

// Resend webhook signature verification middleware
const verifyResendWebhook = (req, res, next) => {
  try {
    const signature = req.headers['svix-signature'];
    const timestamp = req.headers['svix-timestamp'];
    const webhookId = req.headers['svix-id'];

    if (!signature) {
      console.log('❌ Missing Svix signature header');
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing webhook signature'
      });
    }

    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('🚨 RESEND_WEBHOOK_SECRET not configured');
      return res.status(500).json({
        error: 'Server Configuration Error',
        message: 'Webhook verification not configured'
      });
    }

    // Convert request body to string for verification
    const bodyString = JSON.stringify(req.body);

    // Create the signed content (timestamp + "." + body)
    const signedContent = `${timestamp}.${bodyString}`;

    // Create expected signature using HMAC-SHA256
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(signedContent, 'utf8')
      .digest('base64');

    // Compare signatures (constant time comparison for security)
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );

    if (!isValid) {
      console.log('❌ Invalid webhook signature');
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid webhook signature'
      });
    }

    console.log('✅ Webhook signature verified successfully');
    next();

  } catch (error) {
    console.error('❌ Webhook verification error:', error.message);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Webhook verification failed'
    });
  }
};

module.exports = { verifyResendWebhook };
