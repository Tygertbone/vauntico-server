const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const secret = process.env.WEBHOOK_SECRET;
const auditLogPath = path.join(__dirname, "../logs/webhook-audit.json");

/**
 * Express middleware to validate incoming webhooks.
 *
 * 1. Checks timestamp freshness (rejects if older than 5 minutes).
 * 2. Verifies HMAC signature using process.env.WEBHOOK_SECRET.
 * 3. Logs event type, timestamp, and validation result for auditing.
 * 4. Rejects invalid requests with 401, allows valid ones to continue.
 */
const webhookValidator = (req, res, next) => {
  if (!secret) {
    console.error("WEBHOOK_SECRET is not set in environment variables.");
    return res.status(500).send("Server configuration error.");
  }

  const signature = req.headers["x-webhook-signature"];
  const timestamp = req.headers["x-webhook-timestamp"];

  if (!signature || !timestamp) {
    console.warn(
      "Missing required headers: x-webhook-signature or x-webhook-timestamp."
    );
    return res.status(401).send("Unauthorized");
  }

  // Check timestamp freshness (5 minutes)
  const currentTime = Math.floor(Date.now() / 1000);
  if (Math.abs(currentTime - parseInt(timestamp, 10)) > 300) {
    console.warn(
      `Stale webhook: timestamp ${timestamp} is older than 5 minutes.`
    );
    return res.status(401).send("Unauthorized");
  }

  // Verify HMAC signature
  const body = JSON.stringify(req.body);
  const hmac = crypto
    .createHmac("sha256", secret)
    .update(timestamp + body)
    .digest("hex");

  if (hmac !== signature) {
    console.warn(
      `Invalid webhook signature. Event type: ${req.body.event}, Timestamp: ${timestamp}`
    );
    return res.status(401).send("Unauthorized");
  }

  // Log event type, timestamp, and validation result
  logger.info(
    `Webhook validated successfully. Event type: ${req.body.event}, Timestamp: ${timestamp}`
  );

  // Log to audit file
  const eventType = req.headers["x-event-type"];
  const validationStatus = "passed";
  appendToAuditLog({ eventType, timestamp, validationStatus });

  next();
};

function appendToAuditLog(event) {
  try {
    const currentLogs = JSON.parse(fs.readFileSync(auditLogPath, "utf8"));
    currentLogs.push(event);
    fs.writeFileSync(auditLogPath, JSON.stringify(currentLogs, null, 2));
  } catch (error) {
    console.error("Failed to write to audit log:", error);
  }
}

module.exports = webhookValidator;
