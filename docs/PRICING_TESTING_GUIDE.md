# Pricing Logic Testing Guide

## 🧪 Testing Section 2A Implementation

This guide provides step-by-step testing procedures for the pricing logic binding.

---

## Quick Start Testing

### 1. Access the Demo Page

```
http://localhost:5173/pricing-demo
```

The demo page provides 4 tabs:
- **Access Status**: View current access state
- **Component Demo**: See all UI components
- **Pricing Data**: Review pricing configuration
- **Dev Controls**: Toggle access for testing

---

## Manual Test Cases

### Test Case 1: Workshop Kit Access (No Access)

**Scenario:** User without Creator Pass or purchase

1. Navigate to `/pricing-demo`
2. Click "Dev Controls" tab
3. Click "Clear All Access"
4. Navigate to `/workshop-kit`
5. **Expected:** See access gate with price (R499)
6. **Expected:** Content is hidden/gated

✅ **Pass Criteria:**
- Lock icon displayed
- R499 price shown
- "Unlock Access" button visible
- Content not accessible

---

### Test Case 2: Workshop Kit via Creator Pass

**Scenario:** User with Creator Pass gets free access

1. Navigate to `/pricing-demo`
2. Click "Dev Controls" tab
3. Click "Toggle Creator Pass"
4. Page will refresh
5. Navigate to `/workshop-kit`
6. **Expected:** Full access, no paywall
7. **Expected:** Badge shows "Creator Pass"

✅ **Pass Criteria:**
- Content fully visible
- Creator Pass badge displayed
- No payment prompts
- All features accessible

---

### Test Case 3: Workshop Kit via Purchase

**Scenario:** User purchases Workshop Kit directly

1. Navigate to `/pricing-demo`
2. Clear all access
3. Click "Toggle Workshop Kit"
4. Page will refresh
5. Navigate to `/workshop-kit`
6. **Expected:** Full access granted
7. **Expected:** Badge shows "Purchased"

✅ **Pass Criteria:**
- Content accessible
- Purchased badge shown
- No additional payment required

---

### Test Case 4: Audit Service (No Access)

**Scenario:** User without subscription

1. Clear all access via `/pricing-demo`
2. Navigate to `/audit-service`
3. **Expected:** Access gate for subscription
4. **Expected:** R999/month price displayed

✅ **Pass Criteria:**
- Subscription required message
- Price clearly shown
- Sample audit visible but full access gated

---

### Test Case 5: Audit Service via Subscription

**Scenario:** User with active subscription

1. Navigate to `/pricing-demo`
2. Click "Enable Audit Subscription"
3. Page will refresh
4. Navigate to `/audit-service`
5. **Expected:** Full access to audit features
6. **Expected:** Subscription status badge

✅ **Pass Criteria:**
- Full feature access
- Subscription badge active
- Plan level shown (Professional)

---

### Test Case 6: Creator Pass Benefits

**Scenario:** Verify all Creator Pass unlocks

1. Toggle Creator Pass ON
2. Check access to:
   - Workshop Kit ✓
   - Audit Service ✓
   - Add-ons (discount shown) ✓
3. Navigate to `/pricing-demo` > Access Status
4. **Expected:** All features show "Unlocked"

✅ **Pass Criteria:**
- All premium features accessible
- Creator Pass badge everywhere
- Discounts applied to add-ons

---

## Component Testing

### AccessGate Component

```jsx
// Test locked state
<AccessGate hasAccess={false}>
  Content should be hidden
</AccessGate>

// Test unlocked state
<AccessGate hasAccess={true}>
  Content should be visible
</AccessGate>
```

**Test on:** `/pricing-demo` > Component Demo tab

✅ **Verify:**
- Locked: Shows paywall UI
- Unlocked: Shows content
- Loading state works correctly

---

### AccessBadge Component

**Test on:** `/pricing-demo` > Component Demo tab

✅ **Verify all variants:**
- 🔒 Locked (gray)
- 💎 Creator Pass (purple gradient)
- ✓ Purchased (green)
- ✓ Active (blue)
- Compact mode works

---

### CreatorPassPromoBanner

**Test locations:**
- `/workshop-kit` (when no access)
- `/audit-service` (when no access)
- `/pricing-demo` > Component Demo

✅ **Verify:**
- Shows features list
- Discount percentage visible
- CTA button works
- Links to `/creator-pass`

---

## Hook Testing

### useCreatorPass()

```javascript
const { hasPass, isLoading } = useCreatorPass()
```

**Test:**
1. Console: `window.VaunticoDev.toggleCreatorPass()`
2. Verify hook updates automatically
3. Check loading state briefly appears

---

### useWorkshopKitAccess()

```javascript
const accessStatus = useWorkshopKitAccess()
// Returns: { hasAccess, reason, message, price, isLoading }
```

**Test:**
1. No access: reason = 'no_access'
2. With pass: reason = 'creator_pass'
3. Purchased: reason = 'purchased'

---

### useAuditServiceAccess()

```javascript
const accessStatus = useAuditServiceAccess()
// Returns: { hasAccess, reason, message, plan, isLoading }
```

**Test:**
1. No subscription: hasAccess = false
2. With subscription: hasAccess = true, plan = 'professional'
3. With Creator Pass: hasAccess = true, reason = 'creator_pass'

---

## Browser Console Testing

### Available Commands

```javascript
// Open browser console (F12) and run:

// View current state
window.VaunticoDev.logState()

// Toggle Creator Pass
window.VaunticoDev.toggleCreatorPass()

// Toggle Workshop Kit
window.VaunticoDev.toggleWorkshopKit()

// Enable Audit Subscription
window.VaunticoDev.setAuditSubscription('professional')

// Reset everything
window.VaunticoDev.clearAll()
```

### Expected Console Output

```
🔧 Vauntico Dev Utilities available via window.VaunticoDev
Commands: toggleCreatorPass(), toggleWorkshopKit(), setAuditSubscription(), clearAll(), logState()

=== Current Access State ===
Creator Pass: true
Workshop Kit: false
Audit Subscription: { status: 'active', plan: 'professional', isActive: true }
Workshop Kit Access: { hasAccess: true, reason: 'creator_pass', message: '...' }
Audit Service Access: { hasAccess: true, reason: 'creator_pass', message: '...' }
===========================
```

---

## Integration Test Scenarios

### Scenario A: New User Journey

1. **Start:** No access to anything
2. **Action:** Subscribe to Creator Pass
3. **Result:** All features unlocked
4. **Verify:** 
   - Workshop Kit accessible
   - Audit Service accessible
   - Add-ons show discounts

---

### Scenario B: Workshop Kit Only

1. **Start:** No access
2. **Action:** Purchase Workshop Kit (R499)
3. **Result:** Workshop Kit unlocked
4. **Verify:**
   - Workshop Kit accessible
   - Audit Service still gated
   - Creator Pass promo shown on Audit page

---

### Scenario C: Audit Service Only

1. **Start:** No access
2. **Action:** Subscribe to Audit Service
3. **Result:** Audit Service unlocked
4. **Verify:**
   - Audit features accessible
   - Workshop Kit still gated
   - Subscription status displayed

---

### Scenario D: Upgrade Path

1. **Start:** Has Workshop Kit
2. **Action:** Subscribe to Creator Pass
3. **Result:** Everything unlocked
4. **Verify:**
   - Workshop Kit still accessible
   - Audit Service now accessible
   - Creator Pass benefits visible

---

## Visual Testing Checklist

### Workshop Kit Page

- [ ] Hero section displays correctly
- [ ] Access badge shown in header
- [ ] Creator Pass promo (if no access)
- [ ] Gated content section
- [ ] Purchase button state correct
- [ ] Testimonials visible
- [ ] FAQs displayed
- [ ] Footer CTA works

### Audit Service Page

- [ ] Hero with subscription info
- [ ] Access status badges
- [ ] Subscription status indicator
- [ ] Creator Pass promo (if no access)
- [ ] Gated audit reports
- [ ] Pricing cards
- [ ] Plan selection works
- [ ] Add-ons section

### Creator Pass Page

- [ ] Benefits grid
- [ ] Pricing card
- [ ] Access badge shown
- [ ] Subscribe button states
- [ ] FAQ section

### Pricing Demo Page

- [ ] All tabs functional
- [ ] Access status accurate
- [ ] Components render correctly
- [ ] Pricing data complete
- [ ] Dev controls work
- [ ] Page refreshes on toggle

---

## Automated Test Script

Save as `test-pricing.js` and run in console:

```javascript
// Automated Pricing Logic Test Suite
async function runPricingTests() {
  console.log('🧪 Starting Pricing Logic Tests...\n')
  
  const tests = []
  
  // Test 1: Initial State
  window.VaunticoDev.clearAll()
  tests.push({
    name: 'No Access State',
    pass: !hasCreatorPass() && !hasWorkshopKit(),
    message: 'Initial state cleared'
  })
  
  // Test 2: Creator Pass Toggle
  window.VaunticoDev.toggleCreatorPass()
  tests.push({
    name: 'Creator Pass Toggle',
    pass: hasCreatorPass(),
    message: 'Creator Pass enabled'
  })
  
  // Test 3: Workshop Kit Access via Pass
  const workshopAccess = canAccessWorkshopKit()
  tests.push({
    name: 'Workshop Access via Pass',
    pass: workshopAccess.hasAccess && workshopAccess.reason === 'creator_pass',
    message: 'Workshop unlocked by Creator Pass'
  })
  
  // Test 4: Audit Access via Pass
  const auditAccess = canAccessAuditService()
  tests.push({
    name: 'Audit Access via Pass',
    pass: auditAccess.hasAccess && auditAccess.reason === 'creator_pass',
    message: 'Audit unlocked by Creator Pass'
  })
  
  // Results
  console.log('\n📊 Test Results:\n')
  tests.forEach(test => {
    const icon = test.pass ? '✅' : '❌'
    console.log(`${icon} ${test.name}: ${test.message}`)
  })
  
  const passed = tests.filter(t => t.pass).length
  const total = tests.length
  console.log(`\n🎯 Score: ${passed}/${total} tests passed\n`)
  
  return { tests, passed, total }
}

// Run tests
runPricingTests()
```

---

## Performance Testing

### Load Time Checks

- [ ] Hook initialization < 100ms
- [ ] Component render < 50ms
- [ ] Access checks < 10ms
- [ ] State updates immediate

### Memory Checks

- [ ] No memory leaks on toggle
- [ ] localStorage size reasonable
- [ ] Event listeners cleaned up

---

## Accessibility Testing

- [ ] Focus management in AccessGate
- [ ] Keyboard navigation works
- [ ] Screen reader announcements
- [ ] Color contrast ratios pass
- [ ] ARIA labels present

---

## Responsive Testing

Test on:
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)
- [ ] Mobile landscape

---

## Browser Compatibility

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers

---

## Common Issues & Solutions

### Issue: Access not updating

**Solution:** 
```javascript
window.VaunticoDev.clearAll()
window.location.reload()
```

### Issue: Hooks not working

**Solution:** Check component is functional, not class-based

### Issue: Components not found

**Solution:** Verify imports and file paths

### Issue: localStorage full

**Solution:**
```javascript
localStorage.clear()
window.location.reload()
```

---

## Test Reporting Template

```markdown
## Test Report

**Date:** [Date]
**Tester:** [Name]
**Environment:** [Dev/Staging/Prod]

### Results

- ✅ Workshop Kit Gating: PASS
- ✅ Audit Service Gating: PASS
- ✅ Creator Pass Benefits: PASS
- ✅ Component Rendering: PASS
- ✅ Hook Functionality: PASS
- ✅ Dev Tools: PASS

### Issues Found

1. [Issue description]
2. [Issue description]

### Notes

[Additional observations]
```

---

## CI/CD Integration

### Jest Test Template

```javascript
// pricing.test.js
import { hasCreatorPass, canAccessWorkshopKit } from './utils/pricing'

describe('Pricing Logic', () => {
  beforeEach(() => {
    localStorage.clear()
  })
  
  test('Creator Pass grants Workshop access', () => {
    localStorage.setItem('vauntico_creator_pass', 'true')
    const access = canAccessWorkshopKit()
    expect(access.hasAccess).toBe(true)
    expect(access.reason).toBe('creator_pass')
  })
  
  // Add more tests...
})
```

---

**Testing Status:** ✅ Complete
**Last Updated:** 2024
**Version:** 1.0.0
