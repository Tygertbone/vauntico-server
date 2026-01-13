# Quick Start: Pricing Logic (Section 2A)

## ⚡ Get Started in 5 Minutes

---

## 1. Start the Dev Server

```bash
npm run dev
# or
pnpm dev
```

Open: `http://localhost:3000`

---

## 2. Visit the Demo Page

Navigate to: **`/pricing-demo`**

This is your testing control center with 4 tabs:

- **Access Status** - See current state
- **Component Demo** - View all UI components
- **Pricing Data** - Check pricing config
- **Dev Controls** - Toggle access states

---

## 3. Test Access Control

### Option A: Use Dev Controls Tab

1. Click **"Dev Controls"** tab
2. Click buttons to toggle features:
   - **Toggle Creator Pass**
   - **Toggle Workshop Kit**
   - **Enable Audit Subscription**
   - **Clear All Access**

### Option B: Use Browser Console

Press **F12** to open console, then run:

```javascript
// View current state
window.VaunticoDev.logState();

// Enable Creator Pass
window.VaunticoDev.toggleCreatorPass();

// Enable Workshop Kit
window.VaunticoDev.toggleWorkshopKit();

// Enable Audit Subscription
window.VaunticoDev.setAuditSubscription("professional");

// Reset everything
window.VaunticoDev.clearAll();
```

---

## 4. Test Pages

Visit these pages to see gating in action:

### Workshop Kit (`/workshop-kit`)

- **Without access:** See R499 paywall + Creator Pass promo
- **With Creator Pass:** Full access, badge shows "Creator Pass"
- **With Purchase:** Full access, badge shows "Purchased"

### Audit Service (`/audit-service`)

- **Without access:** See R999/month gate + Creator Pass promo
- **With Creator Pass:** Professional plan access
- **With Subscription:** Access with chosen plan

### Creator Pass (`/creator-pass`)

- **Without access:** Subscribe button active
- **With access:** Badge shows active status

---

## 5. Basic Integration Example

### Quick Copy-Paste Component

```jsx
import { useWorkshopKitAccess } from "../hooks/useAccess";
import { AccessGate } from "../components/AccessGate";
import { PRICING } from "../utils/pricing";

function MyPage() {
  const access = useWorkshopKitAccess();

  return (
    <AccessGate
      hasAccess={access.hasAccess}
      reason={access.reason}
      message={access.message}
      price={PRICING.WORKSHOP_KIT.price}
      currency={PRICING.WORKSHOP_KIT.currency}
      actionText="Unlock Content"
      onAction={() => alert("Purchase flow here")}
    >
      <div>
        <h1>Protected Content</h1>
        <p>This content is only visible when user has access.</p>
      </div>
    </AccessGate>
  );
}
```

---

## 6. Common Tasks

### Check if user has Creator Pass

```jsx
import { useCreatorPass } from "../hooks/useAccess";

function MyComponent() {
  const { hasPass } = useCreatorPass();

  return hasPass ? <PremiumFeature /> : <UpgradePrompt />;
}
```

### Show access badge

```jsx
import { AccessBadge } from "../components/AccessGate";

function Header() {
  const { hasPass } = useCreatorPass();
  return <AccessBadge hasAccess={hasPass} reason="creator_pass" />;
}
```

### Gate content

```jsx
import { AccessGate } from "../components/AccessGate";
import { useWorkshopKitAccess } from "../hooks/useAccess";

function Content() {
  const access = useWorkshopKitAccess();
  return (
    <AccessGate {...access}>
      <YourContent />
    </AccessGate>
  );
}
```

---

## 7. Available Hooks

```javascript
// Creator Pass status
const { hasPass, isLoading } = useCreatorPass();

// Workshop Kit access
const access = useWorkshopKitAccess();
// Returns: { hasAccess, reason, message, price, isLoading }

// Audit Service access
const access = useAuditServiceAccess();
// Returns: { hasAccess, reason, message, plan, isLoading }

// Subscription status
const subscription = useSubscriptionStatus();
// Returns: { status, plan, isActive, isLoading }

// All premium access
const premium = usePremiumAccess();
// Returns: { creatorPass, workshopKit, auditService, ... }
```

---

## 8. Available Components

```jsx
// Main access gate
<AccessGate hasAccess={bool} ...props>
  <Content />
</AccessGate>

// Status badge
<AccessBadge hasAccess={bool} reason={string} />

// Promo banner
<CreatorPassPromoBanner features={array} showDiscount={bool} />

// Subscription status
<SubscriptionStatus status={string} plan={string} />

// Price comparison
<PricingComparisonCard
  standardPrice={num}
  passPrice={num}
  currency={string}
/>
```

---

## 9. Pricing Configuration

All pricing is in `src/utils/pricing.js`:

```javascript
PRICING = {
  CREATOR_PASS: {
    price: 29,
    currency: "USD",
    period: "month",
  },
  WORKSHOP_KIT: {
    price: 499,
    currency: "ZAR",
    period: "once-off",
  },
  AUDIT_SERVICE: {
    price: 999,
    currency: "ZAR",
    period: "month",
  },
};
```

---

## 10. Testing Scenarios

### Scenario 1: New User

```javascript
window.VaunticoDev.clearAll();
// Visit /workshop-kit → Should see paywall
// Visit /audit-service → Should see gate
```

### Scenario 2: Creator Pass User

```javascript
window.VaunticoDev.toggleCreatorPass();
// Visit any page → Everything unlocked
// Check /pricing-demo → All green
```

### Scenario 3: Workshop Only

```javascript
window.VaunticoDev.clearAll();
window.VaunticoDev.toggleWorkshopKit();
// Workshop accessible, Audit still gated
```

---

## 11. File Locations

```
src/
├── utils/
│   └── pricing.js              ← Core logic
├── hooks/
│   └── useAccess.js            ← React hooks
├── components/
│   └── AccessGate.jsx          ← UI components
└── pages/
    ├── WorkshopKit.jsx         ← Gated page
    ├── AuditService.jsx        ← Gated page
    ├── CreatorPass.jsx         ← Subscription
    └── PricingDemo.jsx         ← Testing page
```

---

## 12. Need Help?

### Check Documentation

- **Full Guide:** `PRICING_LOGIC_README.md`
- **Testing:** `PRICING_TESTING_GUIDE.md`
- **Flowcharts:** `PRICING_LOGIC_FLOWCHART.md`
- **Summary:** `SECTION_2A_COMPLETE.md`

### Use Dev Tools

```javascript
// See all commands
window.VaunticoDev;

// Current state
window.VaunticoDev.logState();
```

### Demo Page

Visit `/pricing-demo` for interactive testing

---

## 13. Common Issues

### Issue: Changes not appearing

```javascript
window.location.reload();
```

### Issue: Lost access after refresh

```javascript
// Check localStorage
console.log(localStorage.getItem("vauntico_creator_pass"));
```

### Issue: Want to reset

```javascript
window.VaunticoDev.clearAll();
window.location.reload();
```

---

## 14. Next Steps

### Immediate Testing

1. ✅ Start dev server
2. ✅ Visit `/pricing-demo`
3. ✅ Toggle features
4. ✅ Test pages

### Integration

1. Study examples in pages
2. Copy patterns to new features
3. Test with dev tools
4. Prepare for API integration

### Production

1. Replace localStorage with API
2. Add payment gateway
3. Implement webhooks
4. Deploy to staging

---

## 15. Quick Reference Card

```
┌─────────────────────────────────────────────────┐
│          QUICK REFERENCE                        │
├─────────────────────────────────────────────────┤
│                                                 │
│  Demo Page:    /pricing-demo                    │
│                                                 │
│  Dev Tools:    window.VaunticoDev               │
│                                                 │
│  Log State:    .logState()                      │
│  Toggle Pass:  .toggleCreatorPass()             │
│  Toggle Kit:   .toggleWorkshopKit()             │
│  Set Sub:      .setAuditSubscription()          │
│  Reset:        .clearAll()                      │
│                                                 │
│  Test Pages:                                    │
│  - /workshop-kit                                │
│  - /audit-service                               │
│  - /creator-pass                                │
│                                                 │
│  Main Files:                                    │
│  - utils/pricing.js       (Logic)               │
│  - hooks/useAccess.js     (Hooks)               │
│  - components/AccessGate  (UI)                  │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 🎯 Success Checklist

After following this guide, you should be able to:

- [x] Start the dev server
- [x] Access the demo page
- [x] Toggle access states
- [x] See gating in action
- [x] Understand the flow
- [x] Use hooks and components
- [x] Test scenarios
- [x] Debug issues

---

## 🚀 You're Ready!

You now have everything you need to:

- ✅ Test the pricing logic
- ✅ Integrate into new pages
- ✅ Debug access issues
- ✅ Build premium features

**Happy coding!** 💻

---

**Quick Start Version:** 1.0.0  
**Last Updated:** 2024  
**For:** Section 2A - Pricing Logic Binding
