// Health endpoint for Vauntico Fulfillment Engine
// This provides the new OCI-compliant health check

const express = require('express');
const router = express.Router();

// Main health endpoint matching OCI standards
router.get('/health', (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "fulfillment-engine",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "production"
  });
});

// Alternative endpoint for nginx routing
router.get('/fulfillment/health', (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "fulfillment-engine",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "production"
  });
});

module.exports = router;
