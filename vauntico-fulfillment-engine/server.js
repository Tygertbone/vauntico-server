// server.js – Vauntico Fulfillment Engine with Robust Error Handling

// 1. Environment Validation - Check required variables upfront
const requiredEnvVars = [
  'ANTHROPIC_API_KEY',
  'RESEND_API_KEY',
  'PAYSTACK_SECRET_KEY',
  'SENTRY_DSN',
  'SLACK_WEBHOOK_URL',
  'SERVICE_API_KEY',
  'SENDER_EMAIL'
];

console.log('🔍 Checking environment variables...');
const missing = requiredEnvVars.filter(env => !process.env[env]);
if (missing.length > 0) {
  console.error('❌ Missing required environment variables:', missing);
  process.exit(1); // Fail early
} else {
  console.log('✅ All required environment variables present');
}

// 2. Initialize Sentry for error reporting
let Sentry;
try {
  Sentry = require('@sentry/node');
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'production',
    tracesSampleRate: 1.0,
    beforeSend: (event) => {
      console.log('📊 Error captured by Sentry:', event.exception?.values?.[0]?.value);
      return event;
    }
  });
  console.log('✅ Sentry initialized');
} catch (e) {
  console.warn('⚠️ Sentry not available:', e.message);
}

// 3. Initialize Express
const express = require('express');
const app = express();

// Enable JSON parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// 4. Root path route with error handling
app.get('/', (req, res) => {
  try {
    console.log('🏠 GET / - Root path accessed');

    return res.json({
      status: 'ok',
      service: 'vauntico-fulfillment-engine',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime()
    });
  } catch (error) {
    console.error('❌ Root route error:', error);
    if (Sentry) Sentry.captureException(error);

    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

// 5. Health endpoint with monitoring
app.get('/health', (req, res) => {
  return res.status(200).json({ status: "ok" });
});

// 6. Global error handler
app.use((error, req, res) => {
  console.error('💥 Global error handler:', error);

  // Send error to Sentry
  if (Sentry) {
    Sentry.captureException(error, {
      tags: {
        url: req.url,
        method: req.method,
        userAgent: req.get('User-Agent')
      },
      extra: {
        body: req.body,
        query: req.query,
        params: req.params
      }
    });
  }

  // Try to send Slack notification
  try {
    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (slackWebhookUrl) {
      const https = require('https');
      const url = new URL(slackWebhookUrl);
      const slackMessage = {
        text: `🚨 *Fulfillment Engine Error*\n\`${error.message}\`\nURL: ${req.url}`,
        attachments: [{
          color: 'danger',
          fields: [
            { title: 'Error', value: error.message, short: false },
            { title: 'URL', value: req.url, short: true },
            { title: 'Method', value: req.method, short: true }
          ]
        }]
      };

      const options = {
        hostname: url.hostname,
        path: url.pathname,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      };

      const slackReq = https.request(options);
      slackReq.write(JSON.stringify(slackMessage));
      slackReq.end();
    }
  } catch (slackError) {
    console.error('❌ Slack notification failed:', slackError.message);
  }

  // Don't leak sensitive information
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 7. 404 handler (must be after other routes)
app.use('*', (req, res) => {
  try {
    console.log(`❓ 404 - Route not found: ${req.originalUrl}`);

    return res.status(404).json({
      error: 'Not Found',
      message: `Route ${req.originalUrl} not implemented`,
      availableRoutes: [
        'GET /',
        'GET /health'
      ],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ 404 handler error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Export for Vercel serverless function compatibility
module.exports = app;

// Graceful shutdown for local development
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🟢 Fulfillment Engine running on port ${PORT}`);
  });
}
