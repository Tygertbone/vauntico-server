# 🧪 Soul Stack Test Commands - Quick Reference

## 🚀 Getting Started

1. **Start Dev Server:**

   ```bash
   npm run dev
   ```

2. **Open Browser:**

   ```
   http://localhost:3000
   ```

3. **Open Console:** `F12` or `Ctrl+Shift+I`

---

## 🔧 DEV TOOLS CHEAT SHEET

### View Current State

```javascript
// See all access permissions
window.VaunticoDev.logState();

// See analytics state
window.VaunticoAnalytics.logState();

// See syndication stats
window.VaunticoSyndication.viewStats();
```

### Tier Management

```javascript
// Set specific tier
window.VaunticoDev.setCreatorPassTier("free");
window.VaunticoDev.setCreatorPassTier("starter");
window.VaunticoDev.setCreatorPassTier("pro");
window.VaunticoDev.setCreatorPassTier("legacy");

// Toggle Creator Pass on/off
window.VaunticoDev.toggleCreatorPass();

// Clear everything
window.VaunticoDev.clearAll();
```

### Referral System

```javascript
// Get your referral code
window.VaunticoSyndication.getMyCode();

// Generate test share link
window.VaunticoSyndication.generateTestLink("test-scroll");

// Reset referral code
window.VaunticoSyndication.resetCode();
```

### Analytics Testing

```javascript
// View event queue
window.VaunticoAnalytics.getQueue();

// Force flush events
window.VaunticoAnalytics.flush();

// Clear session
window.VaunticoAnalytics.clearSession();
```

---

## 🧭 TEST ROUTES

| Route            | Description      | Test Focus                      |
| ---------------- | ---------------- | ------------------------------- |
| `/`              | Dashboard        | Navigation, CTAs                |
| `/creator-pass`  | Pricing tiers    | Tier comparison, purchase flow  |
| `/lore`          | Scroll library   | Gating, access control, scrolls |
| `/ascend`        | Soul Stack map   | Progression, unlock logic       |
| `/workshop-kit`  | Workshop product | Access gates, upsells           |
| `/audit-service` | Audit product    | Subscription tiers              |

---

## ✅ TEST SCENARIOS

### 1. Tier Gating Test

```javascript
// Start fresh
window.VaunticoDev.clearAll();

// Test FREE tier
window.VaunticoDev.setCreatorPassTier("free");
// Navigate to /lore → Should only access Foundation scrolls

// Test STARTER tier
window.VaunticoDev.setCreatorPassTier("starter");
// Navigate to /ascend → Should see 2/4 layers unlocked

// Test PRO tier
window.VaunticoDev.setCreatorPassTier("pro");
// Navigate to /ascend → Should see 3/4 layers unlocked

// Test LEGACY tier
window.VaunticoDev.setCreatorPassTier("legacy");
// Navigate to /ascend → Should see 4/4 layers unlocked
```

### 2. CLI Onboarding Test

```javascript
// Navigate to /lore
// Find a CLI-related scroll (e.g., "Dream Mover CLI")
// Click scroll card
// Look for "Start CLI Onboarding" button
// Complete the flow
// Check progress:
localStorage.getItem("vauntico_cli_onboarding_solo-creator");
```

### 3. Referral Code Test

```javascript
// Get your code
const myCode = window.VaunticoSyndication.getMyCode();
console.log("My referral code:", myCode);

// Navigate to /lore
// Open any scroll
// Click share button
// Copy link → Should include ?ref=YOUR_CODE
// Paste in new tab → Referral should be tracked
```

### 4. Analytics Events Test

```javascript
// Clear session to start fresh
window.VaunticoAnalytics.clearSession();

// Navigate around site
// Open /lore
// Click locked scroll
// View queue:
window.VaunticoAnalytics.getQueue();

// Should see events like:
// - page_view
// - scroll_viewed
// - scroll_lock_clicked
// - upgrade_modal_opened
```

### 5. Share Modal Test

```javascript
// Navigate to /lore
// Open any scroll (bottom of page has share buttons)
// Click "Share" or try share modal trigger
// Test all 3 tabs:
//   - Social (Twitter, LinkedIn, Copy)
//   - Iframe (embed code)
//   - Preview Card (newsletter HTML)
```

---

## 🎯 EXPECTED OUTPUTS

### Referral Code Format

```
TYRONE-K8X9-A7B2
USER-TIMESTAMP-RANDOM
```

### Analytics Event Structure

```javascript
{
  name: 'scroll_viewed',
  category: 'engagement',
  label: 'Scroll Title',
  properties: {
    scroll_id: 'dream-mover-cli',
    scroll_tier: 'pro',
    user_id: 'anon_1234_abc123',
    sessionId: 'session_1234_xyz789',
    timestamp: '2024-12-20T...'
  }
}
```

### Tier Access State

```javascript
{
  creatorPass: true,
  workshopKit: false,
  auditService: true,
  automation: true,
  brandBuilder: true
}
```

---

## 🔍 DEBUGGING TIPS

### Check LocalStorage

```javascript
// View all Vauntico data
Object.keys(localStorage)
  .filter((key) => key.startsWith("vauntico_"))
  .forEach((key) => {
    console.log(key, localStorage.getItem(key));
  });
```

### Clear Specific Data

```javascript
// Clear tier
localStorage.removeItem("vauntico_creator_pass_tier");

// Clear referral code
localStorage.removeItem("vauntico_my_referral_code");

// Clear CLI progress
localStorage.removeItem("vauntico_cli_onboarding_agency");
```

### Force Event Flush

```javascript
// If events aren't appearing
window.VaunticoAnalytics.flush();
window.VaunticoAnalytics.getQueue();
```

---

## 🚨 COMMON ISSUES

### "Dev tools not found"

- Make sure you're running `npm run dev`
- Dev tools only available in development mode
- Check console for: "🔧 Vauntico Dev Utilities available"

### "Scroll content not loading"

- Some .md files may not exist yet
- Check `/public/docs/lore/scrolls/` folder
- Fallback content will show if missing

### "Analytics events not tracking"

- Events are batched (5s or 10 events)
- Use `window.VaunticoAnalytics.flush()` to force
- Check debug mode: `ANALYTICS_CONFIG.debug = true`

### "Referral code not persisting"

- Check localStorage: `localStorage.getItem('vauntico_my_referral_code')`
- Clear and regenerate: `window.VaunticoSyndication.resetCode()`

---

## 📝 QUICK VALIDATION CHECKLIST

Run this complete test in console:

```javascript
// === SOUL STACK VALIDATION SCRIPT ===

console.log("🔥 Starting Soul Stack Validation...\n");

// 1. Clear state
window.VaunticoDev.clearAll();
console.log("✅ State cleared");

// 2. Set tier to Legacy
window.VaunticoDev.setCreatorPassTier("legacy");
console.log("✅ Tier set to Legacy");

// 3. Check access
window.VaunticoDev.logState();

// 4. Get referral code
const code = window.VaunticoSyndication.getMyCode();
console.log(`✅ Referral Code: ${code}`);

// 5. Check analytics
window.VaunticoAnalytics.logState();

// 6. Generate share link
const link = window.VaunticoSyndication.generateTestLink("test");
console.log(`✅ Share Link: ${link.url}`);

console.log("\n🎉 Validation Complete!");
console.log("Navigate to /ascend to verify 4/4 layers unlocked");
```

---

## 🎓 TESTING WORKFLOW

### For Each Feature:

1. **Set Tier:** `window.VaunticoDev.setCreatorPassTier('pro')`
2. **Navigate:** Go to relevant page
3. **Interact:** Click buttons, open modals
4. **Verify:** Check console for events
5. **Validate:** Confirm expected behavior
6. **Reset:** `window.VaunticoDev.clearAll()` before next test

### Report Issues:

- Note tier used
- Steps to reproduce
- Expected vs actual behavior
- Console errors (if any)

---

_Quick Reference Guide - Phase 5_  
_Local Dev: http://localhost:3000_
