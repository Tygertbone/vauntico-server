# 🎬 Phase 4: Visual Demo Guide

## See It In Action

### Demo Flow

#### 1. **Landing State**

```
User arrives at /lore
├─> RoleSelector appears
└─> Choose role (agency/solo-creator/team-lead)
```

#### 2. **Library View**

```
ScrollGallery displays:
├─> Personalized Recommendations (top)
├─> Recommended Scrolls (for your role)
├─> Full Library (all scrolls)
└─> Sidebar
    ├─> Credit Tracker
    ├─> Next Steps Card
    └─> Upgrade Prompt
```

#### 3. **Locked Scroll Click**

```
Animation Sequence:
1. 🔒 Shake animation (600ms)
2. 💎 Upgrade Modal opens
3. User selects tier
4. 📜 Unlock animation (2.5s)
5. ✅ Scroll opens
```

---

## Component Showcase

### UnlockAnimation

```
Visual Flow:
🔓 Stage 1: Lock breaks (800ms)
📜 Stage 2: Scroll unfurls (1.2s)
✨ Stage 3: Sparkles fade (500ms)
```

### UpgradeModal

```
Layout:
┌────────────────────────────┐
│ Scroll Preview (header)    │
├──────┬──────┬──────────────┤
│Tier 1│Tier 2│Tier 3        │
│ ⚔️  │ 🏰  │ 👑           │
│Start │ Pro  │Legacy        │
└──────┴──────┴──────────────┘
```

### CreditTracker

```
Display:
⚡ Credit Balance
━━━━━━━━━━━━━━━━ 50%
500 / 1000 remaining
Reset: Feb 1, 2024
```

---

## Interactive States

### Scroll Card States

```
1. Unlocked + Recommended
   ⭐ For You badge
   Click → Opens immediately

2. Unlocked + Normal
   No badge
   Click → Opens immediately

3. Locked + Available
   🔒 Lock icon
   Click → Shake + Modal

4. Unlocking
   ⏳ Loading overlay
   Animation in progress
```

---

## Testing Scenarios

### Scenario 1: Free User

```javascript
// Set state
window.VaunticoDev.clearAll()

// Expected behavior:
- Most scrolls show 🔒
- Click locked → Upgrade Modal
- Sidebar shows "Free" tier
- Credit tracker shows 0 credits
```

### Scenario 2: Pro User

```javascript
// Set state
window.VaunticoDev.setCreatorPassTier('pro')

// Expected behavior:
- Agency scrolls unlocked
- Legacy scrolls still locked
- Sidebar shows "Pro" tier
- Credit tracker shows 2,500 credits
```

### Scenario 3: Legacy User

```javascript
// Set state
window.VaunticoDev.setCreatorPassTier('legacy')

// Expected behavior:
- All scrolls unlocked
- No upgrade prompts
- Sidebar shows "Legacy" tier
- Credit tracker shows 10,000 credits
```

---

## Mobile Experience

### Responsive Breakpoints

```
Mobile (< 768px):
- Single column scroll grid
- Stacked sidebar (below content)
- Full-width modals
- Touch-optimized animations

Tablet (768px - 1024px):
- 2-column scroll grid
- Sidebar alongside content
- Optimized modal layout

Desktop (> 1024px):
- 3-column scroll grid
- Full sidebar experience
- Spacious modal layout
```

---

## Animation Performance

### Target: 60 FPS

**Optimizations:**

- Hardware acceleration (transform, opacity)
- Will-change hints
- Minimal repaints
- Efficient state updates

---

## Quick Demo Script

```bash
# 1. Start dev server
npm run dev

# 2. Open browser console
window.VaunticoDev.clearAll()

# 3. Navigate to /lore
# 4. Select "Agency Partner" role
# 5. Click locked "Agency Scroll"
# 6. Watch animations!
# 7. Select Pro tier
# 8. Watch unlock sequence
# 9. Scroll opens!
```

---

**Ready to ship!** 🚀
