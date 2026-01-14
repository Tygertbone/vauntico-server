# 🚀 Audit Validator Quick Start Guide

Get up and running with Vauntico's audit logging system in minutes.

---

## 📦 Installation

The audit validator is already included! Just import it:

```javascript
import {
  auditManager,
  webhookValidator,
  logAudit,
  AUDIT_TYPES,
  AUDIT_SEVERITY,
} from "./utils/auditValidator";
```

---

## 🎯 Basic Usage

### 1. Log Your First Audit

```javascript
import { logAudit, AUDIT_TYPES, AUDIT_SEVERITY } from "./utils/auditValidator";

// Log a simple audit
const scroll = logAudit({
  auditType: AUDIT_TYPES.GIT_ARCHEOLOGY,
  result: {
    score: 92,
    notes: "Clean commit trail",
    filesAnalyzed: 145,
  },
  severity: AUDIT_SEVERITY.INFO,
});

console.log("Audit logged:", scroll.scrollId);
```

### 2. Validate a Webhook

```javascript
import { webhookValidator } from "./utils/auditValidator";

// In your webhook endpoint
const validation = webhookValidator.validateWebhook({
  payload: req.body,
  signature: req.headers["x-signature"],
  timestamp: req.headers["x-timestamp"],
  secret: process.env.WEBHOOK_SECRET,
});

if (validation.valid) {
  // Process webhook
  console.log("Webhook valid!");
} else {
  // Reject webhook
  console.error("Invalid webhook:", validation.results);
}
```

### 3. Retrieve Audit History

```javascript
import { auditManager } from "./utils/auditValidator";

// Get all audits
const allScrolls = auditManager.getAllScrolls();

// Get audits by type
const gitAudits = auditManager.getScrollsByType("git-archeology");

// Get recent critical audits
const criticalScrolls = auditManager.getScrollsBySeverity("critical");

// Get statistics
const stats = auditManager.getStats();
console.log(`Total audits: ${stats.total}`);
```

---

## 🎨 Common Patterns

### Pattern 1: Audit on User Action

```javascript
// In a component
const handleSubmit = async (formData) => {
  try {
    const result = await submitForm(formData);

    // Log successful submission
    logAudit({
      auditType: AUDIT_TYPES.ACCESS_GRANT,
      result: {
        action: "form_submission",
        success: true,
        formId: formData.id,
      },
      severity: AUDIT_SEVERITY.INFO,
      userId: currentUser.id,
    });

    return result;
  } catch (error) {
    // Log failure
    logAudit({
      auditType: AUDIT_TYPES.ACCESS_GRANT,
      result: {
        action: "form_submission",
        success: false,
        error: error.message,
      },
      severity: AUDIT_SEVERITY.HIGH,
      userId: currentUser.id,
    });

    throw error;
  }
};
```

### Pattern 2: Periodic Audit Reports

```javascript
// Generate weekly audit report
function generateWeeklyReport() {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const weeklyScrolls = auditManager.getScrollsByDateRange(
    oneWeekAgo,
    new Date(),
  );

  const report = {
    period: "Last 7 days",
    total: weeklyScrolls.length,
    byType: {},
    bySeverity: {},
  };

  weeklyScrolls.forEach((scroll) => {
    report.byType[scroll.auditType] =
      (report.byType[scroll.auditType] || 0) + 1;
    report.bySeverity[scroll.severity] =
      (report.bySeverity[scroll.severity] || 0) + 1;
  });

  return report;
}
```

### Pattern 3: Real-time Monitoring

```javascript
// Monitor for critical issues
function monitorCriticalIssues() {
  const criticals = auditManager.getScrollsBySeverity("critical");

  if (criticals.length > 0) {
    const latest = criticals[criticals.length - 1];

    // Send alert
    sendAlert({
      title: "Critical Audit Logged",
      message: `${latest.auditType}: ${JSON.stringify(latest.result)}`,
      timestamp: latest.timestamp,
    });
  }
}

// Run every 5 minutes
setInterval(monitorCriticalIssues, 5 * 60 * 1000);
```

---

## 🔒 Security Best Practices

### 1. Use Environment Variables for Secrets

```javascript
// ❌ Bad - hardcoded secret
const signature = generateAuditSignature(payload, "my-secret-key");

// ✅ Good - use environment variable
const signature = generateAuditSignature(payload, process.env.AUDIT_SECRET_KEY);
```

### 2. Verify All Webhooks

```javascript
// Always validate before processing
app.post("/webhooks/github", (req, res) => {
  const validation = webhookValidator.validateWebhook({
    payload: req.body,
    signature: req.headers["x-hub-signature"],
    timestamp: req.headers["x-github-delivery"],
    secret: process.env.GITHUB_WEBHOOK_SECRET,
  });

  if (!validation.valid) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  // Safe to process
  processGitHubWebhook(req.body);
  res.json({ status: "ok" });
});
```

### 3. Sanitize Sensitive Data

```javascript
// Remove sensitive data before logging
logAudit({
  auditType: AUDIT_TYPES.SECURITY_SCAN,
  result: {
    userId: user.id,
    // ❌ Don't log passwords
    // password: user.password,

    // ✅ Log sanitized version
    passwordStrength: calculateStrength(user.password),
    ipAddress: req.ip.replace(/\d+$/, "XXX"), // Mask IP
  },
  severity: AUDIT_SEVERITY.INFO,
});
```

---

## 📊 Dashboard Integration

### Create an Audit Dashboard

```jsx
import { useState, useEffect } from "react";
import { auditManager } from "./utils/auditValidator";

function AuditDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const stats = auditManager.getStats();
    setStats(stats);
  }, []);

  if (!stats) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="card">
        <h3 className="text-xl font-bold">Total Audits</h3>
        <p className="text-4xl font-bold text-vault-purple">{stats.total}</p>
      </div>

      <div className="card">
        <h3 className="text-xl font-bold">By Severity</h3>
        {Object.entries(stats.bySeverity).map(([severity, count]) => (
          <div key={severity} className="flex justify-between">
            <span>{severity}:</span>
            <span className="font-bold">{count}</span>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="text-xl font-bold">Recent Scrolls</h3>
        {stats.recentScrolls.slice(0, 5).map((scroll) => (
          <div key={scroll.scrollId} className="text-sm mb-2">
            <div className="font-bold">{scroll.auditType}</div>
            <div className="text-gray-600">
              {new Date(scroll.timestamp).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🧪 Testing

### Unit Test Example

```javascript
import {
  createAuditScroll,
  verifyAuditScroll,
  AUDIT_TYPES,
  AUDIT_SEVERITY,
} from "./utils/auditValidator";

describe("Audit Validator", () => {
  test("creates sealed audit scroll", () => {
    const scroll = createAuditScroll({
      auditType: AUDIT_TYPES.GIT_ARCHEOLOGY,
      result: { score: 90 },
      severity: AUDIT_SEVERITY.INFO,
    });

    expect(scroll.sealed).toBe(true);
    expect(scroll.signature).toBeDefined();
    expect(scroll.scrollId).toMatch(/^scroll-/);
  });

  test("verifies valid scroll", () => {
    const scroll = createAuditScroll({
      auditType: AUDIT_TYPES.SECURITY_SCAN,
      result: { vulnerabilities: 0 },
    });

    const verification = verifyAuditScroll(scroll);
    expect(verification.valid).toBe(true);
  });

  test("rejects tampered scroll", () => {
    const scroll = createAuditScroll({
      auditType: AUDIT_TYPES.PERFORMANCE_AUDIT,
      result: { score: 50 },
    });

    // Tamper with result
    scroll.result.score = 100;

    const verification = verifyAuditScroll(scroll);
    expect(verification.valid).toBe(false);
  });
});
```

---

## 🔧 Advanced Features

### Custom Audit Types

```javascript
// Extend audit types for your app
export const CUSTOM_AUDIT_TYPES = {
  ...AUDIT_TYPES,
  USER_LOGIN: "user-login",
  PAYMENT_PROCESSED: "payment-processed",
  API_CALL: "api-call",
};

// Use custom type
logAudit({
  auditType: CUSTOM_AUDIT_TYPES.USER_LOGIN,
  result: {
    userId: 123,
    method: "2fa",
    ipAddress: "192.168.1.1",
  },
});
```

### Export and Backup

```javascript
// Export all audits
const backupData = auditManager.exportScrolls();

// Save to file (Node.js)
import fs from "fs";
fs.writeFileSync(`audit-backup-${Date.now()}.json`, backupData);

// Or send to backend
fetch("/api/audit/backup", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: backupData,
});
```

### Import from Backup

```javascript
// Load backup file
import backupData from "./audit-backup.json";

// Import scrolls
auditManager.importScrolls(JSON.stringify(backupData));

// Verify integrity after import
const verification = auditManager.verifyAllScrolls();
console.log(`Integrity: ${verification.integrityScore}%`);
```

---

## 🎓 Audit Types Reference

| Type                 | Use Case                 | Example                               |
| -------------------- | ------------------------ | ------------------------------------- |
| `GIT_ARCHEOLOGY`     | Code repository analysis | Commit patterns, contributor activity |
| `DEPLOYMENT_HEALTH`  | Deployment monitoring    | Build success, env config             |
| `MODULE_MAPPING`     | Architecture analysis    | Dependency graphs                     |
| `SECURITY_SCAN`      | Security audits          | Vulnerability detection               |
| `PERFORMANCE_AUDIT`  | Performance checks       | Load times, bundle size               |
| `CODE_QUALITY`       | Code quality metrics     | Linting, complexity                   |
| `WEBHOOK_VALIDATION` | Webhook verification     | Signature validation                  |
| `ACCESS_GRANT`       | Access control           | Permission changes                    |
| `SUBSCRIPTION_EVENT` | Billing events           | Subscription changes                  |

---

## 🐛 Troubleshooting

### Issue: Scrolls not persisting

**Solution:** Check localStorage quota

```javascript
// Check available storage
const usage = JSON.stringify(localStorage).length;
const limit = 5 * 1024 * 1024; // 5MB typical limit
console.log(`Storage: ${usage}/${limit} bytes`);

// Clear old scrolls if needed
if (usage > limit * 0.9) {
  const stats = auditManager.getStats();
  console.warn("Storage nearly full!");
  // Implement cleanup strategy
}
```

### Issue: Invalid signature verification

**Solution:** Ensure consistent secret key

```javascript
// Use same secret for signing and verification
const SECRET = process.env.AUDIT_SECRET_KEY || "vauntico-audit-seal";

const scroll = createAuditScroll(
  {
    /* ... */
  },
  SECRET,
);

const verification = verifyAuditScroll(scroll, SECRET);
```

### Issue: Performance with many scrolls

**Solution:** Implement pagination

```javascript
// Get paginated scrolls
function getPaginatedScrolls(page = 1, pageSize = 50) {
  const allScrolls = auditManager.getAllScrolls();
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    scrolls: allScrolls.slice(start, end),
    total: allScrolls.length,
    page,
    pageSize,
    totalPages: Math.ceil(allScrolls.length / pageSize),
  };
}
```

---

## 📚 Next Steps

1. ✅ **Integrate into existing pages** - Add audit logging to critical actions
2. ✅ **Build audit dashboard** - Create UI to view audit logs
3. ✅ **Set up monitoring** - Alert on critical audits
4. ✅ **Implement backup** - Regular export to backend
5. ✅ **Migrate to backend** - Prepare for Audit-as-a-Service integration

---

## 🔗 Related Documentation

- [SECTION_2B_COMPLETE.md](./SECTION_2B_COMPLETE.md) - Full implementation summary
- [src/utils/auditValidator.js](./src/utils/auditValidator.js) - Source code with inline docs
- [scrolls/README.md](./scrolls/README.md) - Syndication scrolls guide

---

## 💡 Pro Tips

1. **Log early, log often** - Audit logs are invaluable for debugging
2. **Use appropriate severity** - Reserve CRITICAL for actual emergencies
3. **Include context** - Add metadata for better debugging later
4. **Regular backups** - Export scrolls weekly
5. **Monitor storage** - Keep an eye on localStorage usage
6. **Verify integrity** - Run periodic verification checks

---

**Happy Auditing! 🔐**

_"Every audit is a scroll. Every scroll tells a story. Every story builds trust."_
