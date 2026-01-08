# 📊 GA4 Tracking Quick Reference

## 🎯 Common Tracking Scenarios

### Scroll Views
```javascript
import { trackScrollView } from '@/utils/analytics'

trackScrollView('scroll-001', 'Building Your First Vault', 'free')
```

### Upgrade Flow
```javascript
import { 
  trackUpgradeModalOpen,
  trackTierSelected,
  trackUpgradeClick,
  trackSubscriptionSuccess
} from '@/utils/analytics'

// User clicks locked scroll
trackUpgradeModalOpen('scroll_lock', 'free', 'scroll-001')

// User selects tier
trackTierSelected('vault-keeper', 'monthly', 'free')

// User clicks upgrade button
trackUpgradeClick('vault-keeper', 'monthly', 12, 'USD')

// Payment succeeds
trackSubscriptionSuccess('vault-keeper', 'monthly', 12, 'USD')
```

### CLI Onboarding
```javascript
import { 
  trackCLIOnboardingStart,
  trackCLICommand,
  trackCLIStepComplete,
  trackCLIOnboardingComplete
} from '@/utils/analytics'

// Start onboarding
trackCLIOnboardingStart('workshop-wielder', 'Workshop Wielder')

// Execute command
trackCLICommand('create-scroll', 'workshop-wielder')

// Complete step
trackCLIStepComplete(0, 'Create Your First Scroll', 'workshop-wielder')

// Finish onboarding
trackCLIOnboardingComplete('workshop-wielder', 'Workshop Wielder', 120)
```

### Referrals
```javascript
import { 
  trackReferralGenerated,
  trackReferralClick,
  trackScrollShare
} from '@/utils/analytics'

// Generate referral link
trackReferralGenerated('REF-ABC123', 'scroll_share')

// User clicks referral link (auto-tracked from URL)
trackReferralClick('REF-ABC123', 'twitter')

// Share scroll
trackScrollShare('scroll-001', 'Building Your First Vault', 'twitter')
```

---

## 🔥 Most Important Events to Track

| Event | When to Use | Priority |
|-------|-------------|----------|
| `subscription_completed` | After successful payment | 🔴 Critical |
| `upgrade_clicked` | User clicks upgrade button | 🔴 Critical |
| `scroll_lock_clicked` | User tries locked content | 🟠 High |
| `cli_onboarding_completed` | User finishes CLI setup | 🟠 High |
| `referral_clicked` | Referral link used | 🟡 Medium |
| `scroll_viewed` | Any scroll view | 🟡 Medium |

---

## 🎯 Testing Checklist

### Before Deployment
- [ ] Console shows "📊 Vauntico Analytics initialized"
- [ ] Events appear in console (dev mode)
- [ ] `window.gtag` is defined
- [ ] Network tab shows `collect` requests

### After Deployment
- [ ] GA4 Real-time shows active users
- [ ] Events appear in Real-time reports
- [ ] User properties are populated
- [ ] Conversions are tracked

---

## 🚀 Quick Deploy Commands

```bash
# Test locally
npm run dev

# Build for production
npm run build

# Deploy to Vercel
vercel --prod

# Set environment variable (Vercel)
vercel env add VITE_GA4_ID production
# Enter: G-30N4CHF6JR
```

---

## 🐛 Quick Debug

```javascript
// Check if GA4 is loaded
console.log(typeof gtag) // should be "function"

// View analytics state
window.VaunticoAnalytics.logState()

// View queued events
window.VaunticoAnalytics.getQueue()

// Force send events
window.VaunticoAnalytics.flush()

// Test event
import { trackPageView } from '@/utils/analytics'
trackPageView('/test', 'Test Page')
```

---

## 📈 GA4 Must-Configure

1. **Mark as Conversions**:
   - `subscription_completed`
   - `upgrade_clicked`
   - `cli_onboarding_completed`

2. **Custom Dimensions**:
   - `scroll_id`
   - `scroll_tier`
   - `referral_code`
   - `billing_cycle`

3. **Create Funnel**:
   - upgrade_modal_opened
   - tier_selected
   - upgrade_clicked
   - subscription_completed

---

**That's it! Start tracking! 🎉**
