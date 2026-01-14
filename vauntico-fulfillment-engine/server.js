/* vauntico-fulfillment-engine/server.js - robust error handler and safe Sentry usage */

"use strict";
const express = require("express");
const app = express();

// NOTE: other initialization (env checks, imports) are expected earlier in the file in the original repo.
// 2. Initialize Sentry for error reporting
let Sentry;
if (process.env.SENTRY_DSN && process.env.SENTRY_DSN.startsWith("https://")) {
  try {
    Sentry = require("@sentry/node");
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || "production",
      tracesSampleRate: 1.0,
      beforeSend: (event) => {
        console.log(
          "📊 Error captured by Sentry:",
          event.exception?.values?.[0]?.value,
        );
        return event;
      },
    });
    console.log("✅ Sentry initialized");
  } catch (e) {
    console.warn("⚠️ Sentry initialization failed:", e.message);
  }
} else {
  console.log(
    "⚠️ Sentry DSN not valid or not provided, skipping initialization",
  );
}

// Basic health route
app.get("/health", (req, res) => {
  return res.status(200).json({ status: "ok" });
});

// 404 handler (must be after other routes)
app.use((req, res) => {
  try {
    console.log(`❓ 404 - Route not found: ${req.originalUrl}`);

    return res.status(404).json({
      error: "Not Found",
      message: `Route ${req.originalUrl} not implemented`,
      availableRoutes: ["GET /", "GET /health"],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ 404 handler error:", error);
    try {
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    } catch (finalErr) {
      console.error("❌ Failed to send 500 response in 404 handler:", finalErr);
    }
  }
});

// Global error handler (Express recognizes error handlers by 4 args)
app.use((error, req, res, next) => {
  console.error("💥 Global error handler:", error);

  // If headers already sent, delegate to default Express error handler
  if (res.headersSent) {
    console.warn(
      "⚠️ Headers already sent in error handler, delegating to default handler",
    );
    return next(error);
  }

  // Try to send error to Sentry if initialized
  try {
    if (Sentry && typeof Sentry.captureException === "function") {
      Sentry.captureException(error);
    }
  } catch (sentryErr) {
    console.error("⚠️ Failed to send error to Sentry:", sentryErr);
  }

  // Build and send a safe JSON error response
  try {
    const statusCode =
      error && (error.status || error.statusCode)
        ? error.status || error.statusCode
        : 500;
    const message =
      error && error.message ? error.message : "Internal server error";

    return res.status(statusCode).json({
      status: statusCode === 500 ? "error" : "fail",
      message,
      timestamp: new Date().toISOString(),
    });
  } catch (sendErr) {
    // If sending JSON fails, fallback to minimal text response
    console.error("❌ Error sending error response:", sendErr);
    try {
      res.status(500).send("Internal server error");
    } catch (finalErr) {
      console.error(
        "❌ Final fallback failed in global error handler:",
        finalErr,
      );
    }
  }
});

// Export for Vercel serverless function compatibility
module.exports = app;
