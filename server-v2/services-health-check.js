import dotenv from "dotenv";

dotenv.config();

// Grafana configuration
const GRAFANA_URL = process.env.GRAFANA_URL || "http://localhost:3001";
const GRAFANA_API_KEY = process.env.GRAFANA_API_KEY;

async function postToGrafana(metricName, value, tags = {}) {
  if (!GRAFANA_URL || !GRAFANA_API_KEY) {
    console.log("⚠️ Grafana integration not configured");
    return;
  }

  const timestamp = new Date().toISOString();

  try {
    const response = await fetch(`${GRAFANA_URL}/api/v1/metrics`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GRAFANA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        metric: `vauntico_${metricName}`,
        value: value,
        timestamp: timestamp,
        tags: {
          environment: process.env.NODE_ENV || "development",
          service: "vauntico-health-check",
          ...tags,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`❌ Grafana API error: ${response.status} - ${error}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`❌ Grafana push failed: ${error.message}`);
    return false;
  }
}

async function checkService(serviceName, checkFunction) {
  try {
    const result = await checkFunction();
    const success = await postToGrafana(
      `service_${serviceName.toLowerCase()}_status`,
      result.status === "ok" ? 1 : 0,
      {
        service: serviceName,
      }
    );

    return {
      service: serviceName,
      status: result.status || "unknown",
      message: result.message || "Service check completed",
      grafanaPushed: success,
    };
  } catch (error) {
    const success = await postToGrafana(
      `service_${serviceName.toLowerCase()}_status`,
      0,
      {
        service: serviceName,
        error: error.message,
      }
    );

    return {
      service: serviceName,
      status: "error",
      message: error.message || "Unknown error occurred",
      grafanaPushed: success,
    };
  }
}

async function checkResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY not configured");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "test@resend.dev",
      to: "test@example.com",
      subject: "Health Check",
      html: "<p>This is a health check email.</p>",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API error: ${response.status} - ${error}`);
  }

  return { message: "Email service operational" };
}

async function checkAnthropic() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY not configured");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-3-haiku-20240307",
      max_tokens: 10,
      messages: [
        {
          role: "user",
          content: "Hello",
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${response.status} - ${error}`);
  }

  return { message: "AI service operational" };
}

async function checkPaystack() {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    throw new Error("PAYSTACK_SECRET_KEY not configured");
  }

  const response = await fetch(
    "https://api.paystack.co/transaction/verify/test",
    {
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (response.status === 404) {
    return {
      message:
        "Paystack service accessible (test transaction not found as expected)",
    };
  }

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Paystack API error: ${response.status} - ${error}`);
  }

  return { message: "Payment processor operational" };
}

async function checkSentry() {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    throw new Error("SENTRY_DSN not configured");
  }

  // Parse DSN to validate format
  const dsnMatch = dsn.match(/https:\/\/([^@]+)@([^/]+)\/(\d+)/);
  if (!dsnMatch) {
    throw new Error("Invalid SENTRY_DSN format");
  }

  const [, key, host, projectId] = dsnMatch;

  // Try to send a test event (this might not actually create an event in Sentry)
  const response = await fetch(`https://${host}/api/${projectId}/envelope/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-sentry-envelope",
    },
    body: `${key}\n{"type":"session"}\n{"init":true,"started":"2023-01-01T00:00:00.000Z"}`,
  });

  // Sentry typically returns 200 even for invalid data
  if (response.status >= 400) {
    throw new Error(`Sentry endpoint error: ${response.status}`);
  }

  return { message: "Error tracking service configured" };
}

async function checkSlack() {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    throw new Error("SLACK_WEBHOOK_URL not configured");
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: "🔍 Vauntico Health Check - Slack integration working",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*Vauntico Health Check*\nService: Slack Integration\nStatus: ✅ Operational",
          },
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Slack webhook error: ${response.status} - ${error}`);
  }

  return { message: "Alerting service operational" };
}

async function runHealthChecks() {
  console.log("🏥 Running Vauntico Service Health Checks...");
  console.log(`📊 Grafana URL: ${GRAFANA_URL || "Not configured"}`);

  const services = ["Resend", "Anthropic", "Paystack", "Sentry", "Slack"];
  const results = [];

  // Check each service
  for (const service of services) {
    let checkFunction;
    switch (service) {
      case "Resend":
        checkFunction = checkResend;
        break;
      case "Anthropic":
        checkFunction = checkAnthropic;
        break;
      case "Paystack":
        checkFunction = checkPaystack;
        break;
      case "Sentry":
        checkFunction = checkSentry;
        break;
      case "Slack":
        checkFunction = checkSlack;
        break;
    }

    const result = await checkService(service, checkFunction);
    results.push(result);

    if (result.status === "ok") {
      console.log(
        `✅ ${result.service}: ${result.message} (pushed to Grafana)`
      );
    } else {
      console.log(
        `❌ ${result.service}: ${result.message} (pushed to Grafana)`
      );
    }
  }

  // Determine overall status
  const hasErrors = results.some((result) => result.status === "error");
  const overallStatus = hasErrors ? "partial" : "ok";

  const output = {
    status: overallStatus,
    services: results,
    grafanaEnabled: !!(GRAFANA_URL && GRAFANA_API_KEY),
  };

  return output;
}

// Run as script only when called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runHealthChecks().catch((error) => {
    // eslint-disable-next-line no-console
    console.error("❌ Health check runner failed:", error);
    process.exit(1);
  });
}

export { runHealthChecks };
