# Pricing Logic Binding - Implementation Guide

## Section 2A: Pricing Logic Binding (Part 1 of 2)

This document outlines the implementation of pricing and access control logic for Vauntico's premium features.

---

## 🎯 Overview

The pricing logic system provides a modular, testable way to gate access to premium features including:
- **Workshop Kit** (R499 once-off)
- **Audit-as-a-Service** (R999/month subscription)
- **Creator Pass** (Unlocks everything)
- **Add-ons** (Various pricing)

---

## 📁 File Structure

```
src/
├── utils/
│   └── pricing.js           # Core pricing logic and utilities
├── hooks/
│   └── useAccess.js         # React hooks for access control
├── components/
│   └── AccessGate.jsx       # Reusable UI components
└── pages/
    ├── WorkshopKit.jsx      # Gated Workshop Kit page
    ├── AuditService.jsx     # Gated Audit Service page
    ├── CreatorPass.jsx      # Creator Pass subscription
    └── PricingDemo.jsx      # Testing & demo interface
```

---

## 🔑 Core Features

### 1. Access Control Functions

Located in `src/utils/pricing.js`:

```javascript
// Check Creator Pass status
hasCreatorPass() → boolean

// Check Workshop Kit access
canAccessWorkshopKit() → { hasAccess, reason, message, price }

// Check Audit Service access
canAccessAuditService() → { hasAccess, reason, message, plan }

// Get subscription status
getUserSubscriptionStatus() → { status, plan, isActive }
```

### 2. React Hooks

Located in `src/hooks/useAccess.js`:

```javascript
// Hook examples
const { hasPass } = useCreatorPass()
const accessStatus = useWorkshopKitAccess()
const auditAccess = useAuditServiceAccess()
const subscription = useSubscriptionStatus()
```

### 3. UI Components

Located in `src/components/AccessGate.jsx`:

- **`<AccessGate>`** - Main gating component
- **`<AccessBadge>`** - Status indicator badges
- **`<CreatorPassPromoBanner>`** - Promotional banner
- **`<SubscriptionStatus>`** - Subscription status indicator
- **`<PricingComparisonCard>`** - Price comparison display

---

## 💰 Pricing Configuration

All pricing is centralized in `PRICING` constant:

```javascript
export const PRICING = {
  CREATOR_PASS: {
    price: 29,
    currency: 'USD',
    period: 'month'
  },
  WORKSHOP_KIT: {
    price: 499,
    currency: 'ZAR',
    period: 'once-off'
  },
  AUDIT_SERVICE: {
    price: 999,
    currency: 'ZAR',
    period: 'month'
  }
}
```

---

## 🧩 Implementation Pattern

### Basic Access Gating

```jsx
import { useWorkshopKitAccess } from '../hooks/useAccess'
import { AccessGate } from '../components/AccessGate'
import { PRICING } from '../utils/pricing'

function MyComponent() {
  const accessStatus = useWorkshopKitAccess()
  
  return (
    <AccessGate
      hasAccess={accessStatus.hasAccess}
      reason={accessStatus.reason}
      message={accessStatus.message}
      price={PRICING.WORKSHOP_KIT.price}
      currency={PRICING.WORKSHOP_KIT.currency}
      actionText="Unlock Workshop Kit"
      onAction={handlePurchase}
    >
      {/* Protected content here */}
    </AccessGate>
  )
}
```

---

## 🔐 Access Rules

### Workshop Kit
- ✅ **Granted if:** User has Creator Pass OR made once-off payment
- 💰 **Price:** R499 (once-off)
- 🔗 **Alternative:** Included with Creator Pass

### Audit Service
- ✅ **Granted if:** User has Creator Pass OR active subscription
- 💰 **Price:** R999/month (Professional plan)
- 🔗 **Alternative:** Included with Creator Pass

### Creator Pass Benefits
When user has Creator Pass, they get:
- ✅ Workshop Kit (unlocked)
- ✅ Audit Service (Professional plan)
- ✅ All Add-ons (unlocked)
- ✅ Automation Starter Pack
- ✅ Brand Builder Toolkit
- ✅ Unlimited AI Generation
- ✅ Priority Support

---

## 🧪 Testing & Development

### Access the Demo Page

Navigate to `/pricing-demo` to access the testing interface with:
- Live access status monitoring
- Component showcase
- Pricing configuration viewer
- Dev controls for toggling access

### Browser Console Commands

```javascript
// Toggle Creator Pass
window.VaunticoDev.toggleCreatorPass()

// Toggle Workshop Kit
window.VaunticoDev.toggleWorkshopKit()

// Set Audit Subscription
window.VaunticoDev.setAuditSubscription('professional')

// Clear all access
window.VaunticoDev.clearAll()

// Log current state
window.VaunticoDev.logState()
```

### Manual Testing

1. Visit `/pricing-demo`
2. Use "Dev Controls" tab to toggle access
3. Navigate to gated pages to test behavior
4. Check console for debugging info

---

## 📊 Data Flow

```
User State (localStorage)
    ↓
Utility Functions (pricing.js)
    ↓
React Hooks (useAccess.js)
    ↓
UI Components (AccessGate.jsx)
    ↓
Page Components (Rendered UI)
```

---

## ✅ Acceptance Criteria

- [x] Workshop Kit gated by Creator Pass or R499 payment
- [x] Audit Service gated by subscription or Creator Pass
- [x] Creator Pass unlocks all premium modules
- [x] Pricing logic is testable and modular
- [x] Reusable UI components for access control
- [x] React hooks for easy integration
- [x] Development tools for testing
- [x] Centralized pricing configuration

---

## 🚀 Next Steps

### Integration Checklist

1. **Replace Mock Storage**
   - [ ] Replace localStorage with backend API
   - [ ] Implement proper authentication
   - [ ] Add user session management

2. **Payment Integration**
   - [ ] Integrate payment gateway (Stripe, PayFast, etc.)
   - [ ] Implement webhook handlers
   - [ ] Add subscription management

3. **Enhanced Features**
   - [ ] Add trial periods
   - [ ] Implement promo codes
   - [ ] Add refund handling
   - [ ] Implement usage tracking

---

## 📝 Code Examples

### Example 1: Simple Access Check

```jsx
import { useCreatorPass } from '../hooks/useAccess'
import { AccessBadge } from '../components/AccessGate'

function MyFeature() {
  const { hasPass } = useCreatorPass()
  
  return (
    <div>
      <h2>Premium Feature</h2>
      <AccessBadge hasAccess={hasPass} reason={hasPass ? 'creator_pass' : 'no_access'} />
      
      {hasPass ? (
        <PremiumContent />
      ) : (
        <UpgradePrompt />
      )}
    </div>
  )
}
```

### Example 2: Complete Page Gating

```jsx
import { useWorkshopKitAccess } from '../hooks/useAccess'
import { AccessGate } from '../components/AccessGate'
import { purchaseWorkshopKit, PRICING } from '../utils/pricing'

function WorkshopPage() {
  const accessStatus = useWorkshopKitAccess()
  
  const handlePurchase = async () => {
    await purchaseWorkshopKit(
      () => alert('Success!'),
      (err) => alert('Error: ' + err)
    )
  }
  
  return (
    <AccessGate
      hasAccess={accessStatus.hasAccess}
      reason={accessStatus.reason}
      message={accessStatus.message}
      price={PRICING.WORKSHOP_KIT.price}
      currency={PRICING.WORKSHOP_KIT.currency}
      onAction={handlePurchase}
    >
      <WorkshopContent />
    </AccessGate>
  )
}
```

---

## 🐛 Troubleshooting

### Access not updating
- Check browser console for errors
- Verify localStorage values
- Try clearing all access: `window.VaunticoDev.clearAll()`
- Refresh the page after state changes

### Components not rendering
- Ensure all imports are correct
- Check for missing dependencies
- Verify hook usage is inside functional components

### Pricing not displaying correctly
- Check PRICING constant in `utils/pricing.js`
- Verify currency formatting logic
- Check for prop passing errors

---

## 📚 Additional Resources

- [React Hooks Documentation](https://react.dev/reference/react)
- [localStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## 👥 Support

For questions or issues:
1. Check the `/pricing-demo` page
2. Review browser console logs
3. Use `window.VaunticoDev.logState()` for debugging
4. Refer to inline code documentation

---

**Last Updated:** 2024
**Version:** 1.0.0
**Status:** ✅ Implementation Complete
