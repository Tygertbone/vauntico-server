# 🎯 Mixpanel Quick Start Guide

## 🚀 Setup (3 Steps)

### 1️⃣ Add to `.env`

```bash
VITE_MIXPANEL_TOKEN=f8d19eae67c8d6bef4f547d72d4b4b57
```

### 2️⃣ Start Dev Server

```bash
pnpm dev
```

### 3️⃣ Open Console & Test

```bash
# Open http://localhost:5173
# Press F12 for DevTools Console
```

---

## ⚡ Quick Test Commands

### Basic Event

```javascript
window.VaunticoAnalytics.trackEvent("cli_command_executed", {
  command: "dream-mover init",
  user_id: "creator_001",
  scroll_id: "scroll_legacy_ascend",
});
```

### Identify User

```javascript
window.VaunticoAnalytics.identifyUser("creator_001", {
  name: "Alex",
  tier: "founder",
});
```

### Check Status

```javascript
window.VaunticoAnalytics.logState();
```

---

## 📊 View Results

**Mixpanel Dashboard**: https://mixpanel.com
**Token**: `f8d19eae67c8d6bef4f547d72d4b4b57`

Navigate to: **Events** → **Live View** to see events in real-time

---

## ✅ Success Indicators

Look for these console messages:

```
🎯 Mixpanel initialized with token: f8d19ea...
📊 Vauntico Analytics initialized
```

---

## 🔍 Key Events to Test

| Event           | Command                                                                    |
| --------------- | -------------------------------------------------------------------------- |
| **CLI Command** | `trackEvent('cli_command_executed', {command: 'dream-mover init'})`        |
| **Scroll View** | `trackEvent('scroll_viewed', {scroll_id: 'test', scroll_tier: 'founder'})` |
| **Upgrade**     | `trackEvent('upgrade_clicked', {tier: 'founder', price: 497})`             |
| **Referral**    | `trackEvent('referral_generated', {referral_code: 'TEST123'})`             |

---

## 🚨 Quick Troubleshooting

**Not working?**

1. ✅ Added token to `.env`?
2. ✅ Restarted dev server?
3. ✅ Hard refreshed browser (Ctrl+Shift+R)?

---

📖 **Full Guide**: See `MIXPANEL_INTEGRATION_COMPLETE.md`
