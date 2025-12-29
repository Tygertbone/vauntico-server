# 🎯 Mixpanel Integration - Setup Complete

## ✅ What's Been Done

### 1. **Mixpanel SDK Installed**
```json
"mixpanel-browser": "^2.71.0"
```
✅ Already in `package.json`

### 2. **Analytics.js Updated**
✅ `src/utils/analytics.js` has full Mixpanel integration including:
- Automatic initialization
- Event tracking wrapper
- User identification
- Property tracking
- Debug utilities

### 3. **Environment Configuration**
✅ `.env.example` created with template
⚠️ **YOU NEED TO MANUALLY UPDATE `.env`** (security restriction)

---

## 🔧 Required Action: Update `.env` File

**Open your `.env` file and add this line:**

```bash
VITE_MIXPANEL_TOKEN=f8d19eae67c8d6bef4f547d72d4b4b57
```

### Steps:
1. Open `.env` in your editor
2. Add the line above (or update if it exists)
3. Save the file
4. Restart your dev server: `pnpm dev`

---

## 🧪 Test Your Integration

### 1. **Check Console on Startup**
After restarting your dev server, open browser console. You should see:
```
🎯 Mixpanel initialized with token: f8d19ea...
📊 Vauntico Analytics initialized
```

### 2. **Test Event Tracking**
Open browser console and run:

```javascript
// Test basic event
window.VaunticoAnalytics.trackEvent('test_event', {
  test_property: 'hello_mixpanel'
})

// Test user identification
window.VaunticoAnalytics.identifyUser('test_user_123', {
  name: 'Test User',
  email: 'test@vauntico.com'
})

// Test property increment
window.VaunticoAnalytics.incrementUserProperty('test_count', 1)

// Check Mixpanel directly
mixpanel.track('manual_test', { source: 'console' })
```

### 3. **Verify in Mixpanel Dashboard**
1. Go to https://mixpanel.com
2. Open your Vauntico project
3. Navigate to "Events" tab
4. You should see events coming in within ~60 seconds

---

## 📊 Available Tracking Functions

All tracking is already integrated in `src/utils/analytics.js`:

### Scroll Tracking
- `trackScrollView(scrollId, scrollTitle, scrollTier)`
- `trackScrollLockClick(scrollId, scrollTitle, requiredTier, userTier)`
- `trackScrollUnlock(scrollId, scrollTitle, tier)`
- `trackScrollComplete(scrollId, scrollTitle)`

### Conversion Tracking
- `trackUpgradeModalOpen(trigger, currentTier, scrollId)`
- `trackTierSelected(selectedTier, billingCycle, currentTier)`
- `trackUpgradeClick(tier, billingCycle, price, currency)`
- `trackSubscriptionSuccess(tier, billingCycle, price, currency)`

### CLI Onboarding
- `trackCLIOnboardingStart(roleId, roleName)`
- `trackCLICommand(command, roleId)`
- `trackCLIStepComplete(stepIndex, stepTitle, roleId)`
- `trackCLIOnboardingComplete(roleId, roleName, time)`

### Custom Events (via console or code)
```javascript
window.VaunticoAnalytics.trackEvent('event_name', { prop: 'value' })
window.VaunticoAnalytics.identifyUser(userId, userProps)
window.VaunticoAnalytics.setUserProperties({ key: 'value' })
window.VaunticoAnalytics.incrementUserProperty('count', 1)
```

---

## 🚀 Production Deployment

### Add to Vercel Environment Variables
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add new variable:
   - **Name**: `VITE_MIXPANEL_TOKEN`
   - **Value**: `f8d19eae67c8d6bef4f547d72d4b4b57`
   - **Environment**: Production, Preview, Development
3. Redeploy your app

### Add to Netlify (if using)
1. Site Settings → Build & Deploy → Environment
2. Add: `VITE_MIXPANEL_TOKEN=f8d19eae67c8d6bef4f547d72d4b4b57`
3. Trigger new deploy

---

## 🐛 Troubleshooting

### ❌ "Mixpanel not initialized"
**Cause**: Environment variable not set or dev server not restarted

**Fix**:
```bash
# 1. Verify .env has the token
cat .env | grep MIXPANEL

# 2. Restart dev server
pnpm dev

# 3. Hard refresh browser (Ctrl+Shift+R)
```

### ❌ Events not showing in dashboard
**Cause**: Events are batched and sent every 5 seconds

**Fix**: Wait ~60 seconds or force flush:
```javascript
window.VaunticoAnalytics.flush()
```

### ❌ "Access denied" error
**Cause**: Token might be incorrect or project deleted

**Fix**: Get new token from https://mixpanel.com/project/YOUR_PROJECT/settings/project

---

## 📝 Key Files

| File | Purpose |
|------|---------|
| `.env` | **Add VITE_MIXPANEL_TOKEN here** |
| `.env.example` | Template for environment variables |
| `src/utils/analytics.js` | Mixpanel integration + tracking functions |
| `package.json` | Mixpanel SDK dependency |

---

## ✅ Checklist

- [x] Mixpanel SDK installed (`mixpanel-browser@2.71.0`)
- [x] `analytics.js` updated with full integration
- [x] `.env.example` created
- [ ] **→ YOU: Add `VITE_MIXPANEL_TOKEN` to `.env`**
- [ ] **→ YOU: Restart dev server**
- [ ] **→ YOU: Test events in console**
- [ ] **→ YOU: Verify in Mixpanel dashboard**
- [ ] **→ YOU: Add to production environment (Vercel/Netlify)**

---

## 🎉 Next Steps

1. **Update `.env`** with the Mixpanel token (see above)
2. **Restart dev server**: `pnpm dev`
3. **Open browser console** and look for initialization messages
4. **Test tracking** using the console commands above
5. **Verify in Mixpanel** that events appear within 60 seconds
6. **Deploy to production** with environment variable set

---

## 📚 Documentation

For more details, see:
- [Mixpanel Quick Start](./MIXPANEL_QUICK_START.md)
- [Mixpanel Architecture](./MIXPANEL_ARCHITECTURE.md)
- [Mixpanel Integration Complete](./MIXPANEL_INTEGRATION_COMPLETE.md)

---

**Status**: ✅ **READY FOR TESTING**  
**Your Token**: `f8d19eae67c8d6bef4f547d72d4b4b57`  
**Next Action**: Add token to `.env` and restart dev server

---

*Setup completed: 2025-01-26*  
*Commit: Mixpanel integration complete + env template*
