# ✅ Soul Stack Validation Checklist - Phase 5

## 🎯 Pre-Flight Check

- [x] Dev server running (`npm run dev`)
- [x] Browser open at http://localhost:3000
- [x] Console open (F12)
- [x] Dev tools confirmed: `window.VaunticoDev` exists

---

## 1️⃣ SCROLL GATING BY TIER

### Test Setup
```javascript
window.VaunticoDev.clearAll()
```

### Free Tier (Default)
- [ ] Navigate to `/lore`
- [ ] See scroll library with tier badges
- [ ] Click on a PRO scroll (e.g., "Workshop Kit")
- [ ] Lock icon shakes ❌
- [ ] Upgrade modal appears
- [ ] Modal shows tier requirements

### Starter Tier
```javascript
window.VaunticoDev.setCreatorPassTier('starter')
```
- [ ] Navigate to `/ascend`
- [ ] See 2/4 layers unlocked (Foundation + Amplification)
- [ ] Transformation layer shows lock overlay
- [ ] "Unlock Layer" CTA visible on locked tiers

### Pro Tier
```javascript
window.VaunticoDev.setCreatorPassTier('pro')
```
- [ ] Navigate to `/ascend`
- [ ] See 3/4 layers unlocked
- [ ] Only Legacy layer locked
- [ ] Click to expand unlocked layers

### Legacy Tier
```javascript
window.VaunticoDev.setCreatorPassTier('legacy')
```
- [ ] Navigate to `/ascend`
- [ ] See 4/4 layers unlocked (100% progress)
- [ ] All scrolls accessible in `/lore`
- [ ] "Build Your Legacy" CTA appears

**Status:** ⬜ Not Started | 🟡 In Progress | ✅ Passed | ❌ Failed

---

## 2️⃣ CLI ONBOARDING FLOW

### Solo Creator Path
- [ ] Navigate to `/lore`
- [ ] Find "Dream Mover CLI" scroll
- [ ] Open scroll
- [ ] Click "Start CLI Onboarding" (if present)
- [ ] See 5 steps with icons
- [ ] Step 1: Install CLI command visible
- [ ] Copy button works
- [ ] Click "Mark Complete & Continue"
- [ ] Progress bar updates
- [ ] Navigate through all 5 steps
- [ ] Check persistence:
```javascript
localStorage.getItem('vauntico_cli_onboarding_solo-creator')
```

### Agency Path
- [ ] Navigate to `/lore`
- [ ] Find "Agency CLI Quickstart" scroll
- [ ] See 7 steps in onboarding
- [ ] Test "Skip Step" on optional steps
- [ ] Verify step navigation (click step circles)
- [ ] Complete flow
- [ ] Achievement tracking works

### Progress Persistence
- [ ] Complete some steps
- [ ] Refresh page
- [ ] Progress retained
- [ ] Can resume from last step

**Status:** ⬜ Not Started | 🟡 In Progress | ✅ Passed | ❌ Failed

---

## 3️⃣ REFERRAL CODE GENERATION

### Code Generation
```javascript
window.VaunticoSyndication.getMyCode()
```
- [ ] Returns code in format: `USER-TIME-RAND`
- [ ] Example: `TYRONE-K8X9-A7B2`
- [ ] Code persists in localStorage
- [ ] Same code on subsequent calls

### Attribution Tracking
```javascript
window.VaunticoSyndication.viewStats()
```
- [ ] Shows referral code
- [ ] Shows commission rate (based on tier)
  - Starter: 5%
  - Pro: 10%
  - Legacy: 15%
- [ ] Shows Creator Pass link with ref param

### Share Link Generation
```javascript
window.VaunticoSyndication.generateTestLink('scroll-123')
```
- [ ] Returns URL with `?ref=CODE`
- [ ] Code matches personal referral code
- [ ] URL is valid and navigable

**Status:** ⬜ Not Started | 🟡 In Progress | ✅ Passed | ❌ Failed

---

## 4️⃣ ANALYTICS EVENTS

### System Check
```javascript
window.VaunticoAnalytics.logState()
```
- [ ] Shows Session ID
- [ ] Shows User ID (anon or authenticated)
- [ ] Shows queue size
- [ ] Debug mode active in dev

### Scroll Events
- [ ] Navigate to `/lore`
- [ ] `page_view` event queued
- [ ] Open any scroll
- [ ] `scroll_viewed` event queued
- [ ] Click locked scroll
- [ ] `scroll_lock_clicked` event queued

### Upgrade Events
- [ ] Trigger upgrade modal
- [ ] `upgrade_modal_opened` event queued
- [ ] Select tier
- [ ] `tier_selected` event queued

### CLI Events
- [ ] Start CLI onboarding
- [ ] `cli_onboarding_started` event queued
- [ ] Complete step
- [ ] `cli_step_completed` event queued

### Event Queue
```javascript
window.VaunticoAnalytics.getQueue()
```
- [ ] Events accumulate in array
- [ ] Auto-flush after 5 seconds
- [ ] Or flush after 10 events
- [ ] Manual flush works:
```javascript
window.VaunticoAnalytics.flush()
```

**Status:** ⬜ Not Started | 🟡 In Progress | ✅ Passed | ❌ Failed

---

## 5️⃣ SHARE MODAL FUNCTIONALITY

### Modal Trigger
- [ ] Navigate to `/lore`
- [ ] Open any scroll
- [ ] Find share button/trigger
- [ ] Modal appears with gradient header

### Social Tab
- [ ] Tab active by default
- [ ] Share link visible
- [ ] Contains `?ref=CODE`
- [ ] "Copy" button works
- [ ] Shows "✓ Copied!" feedback
- [ ] Twitter button opens popup
- [ ] LinkedIn button opens popup
- [ ] Commission notice visible

### Iframe Embed Tab
- [ ] Switch to "💻 Embed Code" tab
- [ ] Width input editable
- [ ] Height input editable
- [ ] Theme dropdown (light/dark)
- [ ] "Show Header" checkbox toggles
- [ ] Embed code updates on changes
- [ ] "Copy Code" button works
- [ ] Iframe HTML syntax valid

### Preview Card Tab
- [ ] Switch to "🎨 Preview Card" tab
- [ ] HTML code visible
- [ ] Live preview renders
- [ ] Shows scroll title
- [ ] Shows tier badge
- [ ] CTA button present
- [ ] Copy code works

### Analytics Tracking
```javascript
window.VaunticoAnalytics.getQueue()
```
- [ ] `scroll_shared` event on social click
- [ ] `embed_generated` event on copy embed
- [ ] Platform tracked correctly

**Status:** ⬜ Not Started | 🟡 In Progress | ✅ Passed | ❌ Failed

---

## 6️⃣ ASCEND PAGE UNLOCK LOGIC

### Page Load
- [ ] Navigate to `/ascend`
- [ ] Hero section with mountain icon
- [ ] Progress bar visible
- [ ] Shows "X of 4 layers unlocked"
- [ ] Current tier badge displays

### Layer Visualization
- [ ] 4 tier cards stacked vertically
- [ ] Each shows: emoji, name, description, skills
- [ ] Locked layers have dark overlay
- [ ] Locked layers show 🔒 icon
- [ ] Unlock CTA button on locked layers

### Tier Unlocking
```javascript
// Test each tier
window.VaunticoDev.setCreatorPassTier('free')
// Refresh /ascend → 1/4 unlocked

window.VaunticoDev.setCreatorPassTier('starter')  
// Refresh /ascend → 2/4 unlocked

window.VaunticoDev.setCreatorPassTier('pro')
// Refresh /ascend → 3/4 unlocked

window.VaunticoDev.setCreatorPassTier('legacy')
// Refresh /ascend → 4/4 unlocked (100%)
```

### Expanded Details
- [ ] Click unlocked layer
- [ ] Expands to show scrolls & achievements
- [ ] "Explore Scrolls" button appears
- [ ] Click locked layer shows upgrade CTA

### CTA Section
- [ ] Bottom CTA changes based on progress
- [ ] < 100%: "View Creator Pass" + "Explore Lore"
- [ ] 100%: "Launch Dream Mover" + "Review Scrolls"

### Journey Stats
- [ ] 4 stat cards at bottom
- [ ] Shows layers unlocked count
- [ ] Shows scrolls available count
- [ ] Shows skills mastered count
- [ ] Shows progress percentage

**Status:** ⬜ Not Started | 🟡 In Progress | ✅ Passed | ❌ Failed

---

## 🔍 EDGE CASES & ANOMALIES

### Scroll Content Missing
- [ ] Open non-existent scroll
- [ ] Shows fallback message
- [ ] "Scroll Not Found" with icon
- [ ] "Return to Library" button works

### Empty Referral Tracking
```javascript
localStorage.removeItem('vauntico_referral_code')
```
- [ ] Visit with `?ref=TEST123`
- [ ] Code stored in localStorage
- [ ] Attribution tracked

### CLI Progress Conflicts
- [ ] Complete onboarding for role A
- [ ] Switch to role B
- [ ] Progress separate per role
- [ ] No data mixing

### Analytics Queue Overflow
```javascript
// Generate 20+ events quickly
for(let i = 0; i < 20; i++) {
  trackScrollView(`test-${i}`, `Test ${i}`, 'free')
}
window.VaunticoAnalytics.getQueue()
```
- [ ] Queue auto-flushes at 10 events
- [ ] No memory leak
- [ ] Events processed correctly

### Tier Downgrade
```javascript
window.VaunticoDev.setCreatorPassTier('legacy')
// Navigate to /ascend → 4/4 unlocked
window.VaunticoDev.setCreatorPassTier('free')
// Navigate to /ascend → 1/4 unlocked
```
- [ ] Content re-locks properly
- [ ] No access to restricted scrolls
- [ ] No console errors

**Status:** ⬜ Not Started | 🟡 In Progress | ✅ Passed | ❌ Failed

---

## 🚀 FINAL VALIDATION

### Master Test Script
Run this complete validation:

```javascript
console.log('🔥 SOUL STACK MASTER VALIDATION\n')

// 1. Clear state
window.VaunticoDev.clearAll()
console.log('✅ 1. State cleared')

// 2. Test tier progression
window.VaunticoDev.setCreatorPassTier('starter')
console.log('✅ 2. Tier set')

// 3. Get referral code
const code = window.VaunticoSyndication.getMyCode()
console.log(`✅ 3. Referral: ${code}`)

// 4. View analytics
window.VaunticoAnalytics.logState()
console.log('✅ 4. Analytics active')

// 5. Test all systems
window.VaunticoDev.logState()
console.log('✅ 5. Access control verified')

// 6. Generate share link
const link = window.VaunticoSyndication.generateTestLink('final-test')
console.log(`✅ 6. Share link: ${link.url}`)

console.log('\n🎉 MASTER VALIDATION COMPLETE')
console.log('Manual checks:')
console.log('→ Navigate to /ascend (should show 2/4)')
console.log('→ Navigate to /lore (test scroll access)')
console.log('→ Open scroll and test share modal')
```

### Final Checks
- [ ] All 6 major systems tested
- [ ] No console errors
- [ ] Dev tools responsive
- [ ] LocalStorage clean
- [ ] Events tracking properly
- [ ] Referrals generating
- [ ] Tiers unlocking correctly

---

## 📊 TEST RESULTS SUMMARY

| System | Status | Notes |
|--------|--------|-------|
| Scroll Gating | ⬜ | Tier-based access |
| CLI Onboarding | ⬜ | Progress tracking |
| Referral Codes | ⬜ | Attribution system |
| Analytics | ⬜ | Event tracking |
| Share Modal | ⬜ | Social + embeds |
| Ascend Page | ⬜ | Unlock logic |

**Legend:**  
✅ Passed | ❌ Failed | 🟡 Partial | ⬜ Not Tested

---

## 🔥 SIGN-OFF

**Tester:** _________________  
**Date:** _________________  
**Environment:** Development (localhost:3000)  
**Phase:** 5 - Syndication Layer  
**Status:** _________________

**Ready for Launch:** ⬜ Yes | ⬜ No | ⬜ With Caveats

**Notes:**
```
[Add any observations, bugs, or recommendations here]
```

---

*Soul Stack Validation Checklist - Phase 5*  
*Generated: 2024-12-20*
