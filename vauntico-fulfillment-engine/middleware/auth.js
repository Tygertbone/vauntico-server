const crypto = require('crypto');

// Simple API key authentication middleware for fulfillment engine
const authenticateApiKey = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Missing or invalid Authorization header');
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing or invalid API key'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      console.log('❌ Empty API token');
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid API key format'
      });
    }

    // Compare with expected API key (environment variable)
    const expectedKey = process.env.SERVICE_API_KEY;

    if (!expectedKey) {
      console.error('🚨 SERVICE_API_KEY not configured in environment');
      return res.status(500).json({
        error: 'Server Configuration Error',
        message: 'Service authentication not configured'
      });
    }

    // Use constant-time comparison for security
    if (!crypto.timingSafeEqual(Buffer.from(token, 'utf8'), Buffer.from(expectedKey, 'utf8'))) {
      console.log('❌ Invalid API key provided');
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid API key'
      });
    }

    console.log('✅ API key authentication successful');
    next();

  } catch (error) {
    console.error('❌ Authentication middleware error:', error.message);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication failed'
    });
  }
};

module.exports = { authenticateApiKey };
