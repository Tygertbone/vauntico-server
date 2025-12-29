# 🚀 Phase 4: Quick Start Guide

## 5-Minute Setup

### Step 1: Import Components

```jsx
// In your LoreVault.jsx or similar
import UnlockAnimation from './components/UnlockAnimation'
import UpgradeModal from './components/UpgradeModal'
import CreditTracker from './components/CreditTracker'
import TierComparison from './components/TierComparison'
import PersonalizedRecommendations from './components/PersonalizedRecommendations'
```

### Step 2: Add State Management

```jsx
const [showUpgradeModal, setShowUpgradeModal] = useState(false)
const [showUnlockAnim, setShowUnlockAnim] = useState(false)
const [selectedScroll, setSelectedScroll] = useState(null)
```

### Step 3: Handle Locked Scroll Clicks

```jsx
const handleScrollClick = (scroll, canAccess) => {
  if (!canAccess) {
    setSelectedScroll(scroll)
    setShowUpgradeModal(true)
  } else {
    openScroll(scroll)
  }
}
```

### Step 4: Render Components

```jsx
return (
  <div>
    {/* Your existing scroll grid */}
    <ScrollGrid onScrollClick={handleScrollClick} />
    
    {/* Sidebar */}
    <aside>
      <CreditTracker />
      <PersonalizedRecommendations 
        role={role}
        progress={progress}
      />
    </aside>
    
    {/* Modals */}
    {showUpgradeModal && (
      <UpgradeModal
        scroll={selectedScroll}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={(tier) => handleUpgrade(tier)}
      />
    )}
    
    {showUnlockAnim && (
      <UnlockAnimation
        scroll={selectedScroll}
        onComplete={() => setShowUnlockAnim(false)}
      />
    )}
  </div>
)
```

---

## Component Showcase

### 🎬 Unlock Animation

**When to use:** After successful upgrade, when user unlocks new content

```jsx
<UnlockAnimation 
  scroll={{
    id: 'agency-scroll',
    icon: '🏢',
    title: 'Agency Scroll',
    subtitle: 'Partnership Framework'
  }}
  onComplete={() => {
    // Navigate to scroll or close modal
  }}
  autoPlay={true}
/>
```

---

### 💎 Upgrade Modal

**When to use:** When user clicks locked scroll, from upgrade CTAs

```jsx
<UpgradeModal
  scroll={lockedScroll}
  currentTier="free" // or "starter", "pro", "legacy"
  onClose={() => setShowModal(false)}
  onUpgrade={(tierKey) => {
    // tierKey will be "starter", "pro", or "legacy"
    subscribeToCreatorPassTier(tierKey, 'monthly')
  }}
/>
```

**Features:**
- Auto-filters tiers (only shows tiers that unlock the scroll)
- Highlights "Most Popular"
- Shows monthly/yearly pricing
- Feature comparison

---

### ⚡ Credit Tracker

**When to use:** Sidebar, dashboard, header

```jsx
// Full version (sidebar)
<CreditTracker 
  compact={false}
  showDetails={true}
/>

// Compact version (header)
<CreditTracker compact={true} />

// Badge only (minimal)
import { CreditBadge } from './components/CreditTracker'
<CreditBadge showLabel={true} />
```

**Manages:**
- Credit balance
- Usage percentage
- Rollover credits
- Reset date
- Activity history

---

### 📊 Tier Comparison

**When to use:** Dedicated pricing page, upgrade flows

```jsx
<TierComparison
  currentTier={userTier || 'free'}
  onSelectTier={(tierKey, billingCycle) => {
    // tierKey: "starter" | "pro" | "legacy"
    // billingCycle: "monthly" | "yearly"
    subscribeToCreatorPassTier(tierKey, billingCycle)
  }}
/>
```

**Features:**
- Monthly vs Yearly toggle
- 3 comparison modes (Features, Savings, Value Score)
- Detailed feature table
- FAQ section
- Savings calculator

---

### 🎯 Personalized Recommendations

**When to use:** Below hero section, dashboard

```jsx
<PersonalizedRecommendations
  role={{
    id: 'agency',
    icon: '🏢',
    title: 'Agency Partner'
  }}
  progress={{
    completed: ['step1', 'step2'],
    skipped: []
  }}
  achievements={[
    'first-install',
    'first-auth',
    'onboarding-complete'
  ]}
/>
```

**Generates recommendations based on:**
- Role type (agency, solo-creator, team-lead)
- Onboarding progress
- Achievements earned
- Current tier
- Usage patterns

---

## Complete Integration Example

```jsx
import { useState, useEffect } from 'react'
import { useCreatorPass } from '../hooks/useAccess'
import { getCreatorPassTier } from '../utils/pricing'
import UnlockAnimation from '../components/UnlockAnimation'
import UpgradeModal from '../components/UpgradeModal'
import CreditTracker from '../components/CreditTracker'
import PersonalizedRecommendations from '../components/PersonalizedRecommendations'

function EnhancedLoreVault() {
  // State
  const [selectedRole, setSelectedRole] = useState(null)
  const [selectedScroll, setSelectedScroll] = useState(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showUnlockAnim, setShowUnlockAnim] = useState(false)
  
  // Access control
  const { hasPass } = useCreatorPass()
  const tier = getCreatorPassTier()
  
  // Progress tracking
  const [progress, setProgress] = useState({})
  const [achievements, setAchievements] = useState([])
  
  useEffect(() => {
    if (selectedRole) {
      loadProgress()
      loadAchievements()
    }
  }, [selectedRole])
  
  const loadProgress = () => {
    const saved = localStorage.getItem(`vauntico_cli_onboarding_${selectedRole.id}`)
    if (saved) setProgress(JSON.parse(saved))
  }
  
  const loadAchievements = () => {
    const saved = localStorage.getItem('vauntico_achievements')
    if (saved) setAchievements(JSON.parse(saved))
  }
  
  const canAccessScroll = (scroll) => {
    if (scroll.tier === 'free') return true
    if (!tier) return false
    
    const tierHierarchy = { 'starter': 1, 'pro': 2, 'legacy': 3 }
    return tierHierarchy[tier.tier] >= tierHierarchy[scroll.tier]
  }
  
  const handleScrollClick = (scroll) => {
    if (canAccessScroll(scroll)) {
      setSelectedScroll(scroll)
      // Open scroll viewer
    } else {
      // Show upgrade modal
      setSelectedScroll(scroll)
      setShowUpgradeModal(true)
    }
  }
  
  const handleUpgrade = async (tierKey) => {
    // Close modal
    setShowUpgradeModal(false)
    
    // Trigger unlock animation
    setShowUnlockAnim(true)
    
    // After animation, complete upgrade
    setTimeout(() => {
      setShowUnlockAnim(false)
      // Process actual subscription
      subscribeToCreatorPassTier(tierKey, 'monthly')
    }, 2500)
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">
          The <span className="text-gradient">Lore Vault</span>
        </h1>
        <p className="text-xl text-gray-600">
          Sacred Knowledge Repository of Vauntico
        </p>
      </div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Area */}
        <div className="lg:col-span-3 space-y-8">
          {/* Personalized Recommendations */}
          <PersonalizedRecommendations
            role={selectedRole}
            progress={progress}
            achievements={achievements}
          />
          
          {/* Scroll Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {scrolls.map(scroll => (
              <ScrollCard
                key={scroll.id}
                scroll={scroll}
                canAccess={canAccessScroll(scroll)}
                onClick={() => handleScrollClick(scroll)}
              />
            ))}
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <CreditTracker compact={false} showDetails={true} />
          
          {(!hasPass || tier?.tier === 'starter') && (
            <QuickUpgradePrompt
              onUpgrade={() => setShowUpgradeModal(true)}
            />
          )}
        </div>
      </div>
      
      {/* Modals */}
      {showUpgradeModal && selectedScroll && (
        <UpgradeModal
          scroll={selectedScroll}
          currentTier={tier?.tier || 'free'}
          onClose={() => setShowUpgradeModal(false)}
          onUpgrade={handleUpgrade}
        />
      )}
      
      {showUnlockAnim && selectedScroll && (
        <UnlockAnimation
          scroll={selectedScroll}
          onComplete={() => setShowUnlockAnim(false)}
          autoPlay={true}
        />
      )}
    </div>
  )
}

export default EnhancedLoreVault
```

---

## Testing Your Integration

### 1. Test Locked Scroll Click
```javascript
// Set to free tier
window.VaunticoDev.clearAll()

// Click a locked scroll (pro/legacy tier)
// Should see: shake animation → upgrade modal
```

### 2. Test Unlock Animation
```javascript
// Simulate upgrade
window.VaunticoDev.setCreatorPassTier('pro')

// Should see: unlock animation → scroll opens
```

### 3. Test Credit Tracking
```javascript
// Set custom credit balance
localStorage.setItem('vauntico_credits', JSON.stringify({
  used: 450,
  total: 500,
  remaining: 50,
  rollover: 0,
  resetDate: '2024-02-01'
}))

// Refresh page - should show low credit warning
```

### 4. Test Recommendations
```javascript
// Set role and progress
const progress = {
  completed: ['step1'],
  skipped: []
}
localStorage.setItem('vauntico_cli_onboarding_agency', JSON.stringify(progress))

// Should show personalized recommendations
```

---

## Customization Tips

### Change Animation Speed
In `UnlockAnimation.jsx`:
```javascript
// Make it faster
setTimeout(() => setStage('opened'), 400) // was 800
setTimeout(() => setStage('complete'), 1000) // was 2000
```

### Change Credit Thresholds
In `CreditTracker.jsx`:
```javascript
const getStatusColor = () => {
  const percentage = getUsagePercentage()
  if (percentage >= 95) return 'text-red-600' // was 90
  if (percentage >= 80) return 'text-yellow-600' // was 70
  return 'text-green-600'
}
```

### Add Custom Recommendation
In `PersonalizedRecommendations.jsx`:
```javascript
recs.push({
  id: 'custom-action',
  type: 'action',
  priority: 'high',
  icon: '🎯',
  title: 'Custom Action',
  description: 'Do something awesome',
  action: 'Take Action',
  category: 'custom'
})
```

---

## Troubleshooting

### Animation not playing
- Check that `autoPlay={true}` is set
- Verify CSS animations are loaded in `index.css`
- Check browser console for errors

### Modal not opening
- Ensure `showUpgradeModal` state is managed correctly
- Check that `selectedScroll` is not null
- Verify onClick handlers are bound

### Credits not updating
- Check localStorage key: `vauntico_credits`
- Verify JSON structure matches expected format
- Clear cache and reload

### Recommendations not showing
- Ensure `role` prop is passed
- Check `progress` and `achievements` data
- Verify role ID matches expected values

---

## Next Steps

✅ All Phase 4 components are production-ready!

**Suggested workflow:**
1. Start with `CreditTracker` in sidebar
2. Add `PersonalizedRecommendations` to main area
3. Integrate `UpgradeModal` on locked scroll clicks
4. Add `UnlockAnimation` after upgrade
5. Create dedicated pricing page with `TierComparison`

**Need help?** Check the full documentation in `PHASE_4_ENHANCED_SCROLL_ACCESS.md`
