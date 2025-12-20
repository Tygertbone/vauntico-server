import { useState } from 'react'
import UnlockAnimation, { LockShakeAnimation, UnlockIndicator } from './UnlockAnimation'
import UpgradeModal, { QuickUpgradePrompt } from './UpgradeModal'
import CreditTracker, { CreditBadge, CreditCost } from './CreditTracker'
import TierComparison from './TierComparison'
import PersonalizedRecommendations, { RecommendationWidget, NextStepsCard } from './PersonalizedRecommendations'

/**
 * Enhanced Scroll Access System
 * Orchestrates unlock animations, upgrade prompts, and personalization
 */
function EnhancedScrollAccess({ 
  role, 
  scrolls, 
  currentTier = 'free',
  progress = {},
  achievements = [],
  onScrollClick,
  onUpgrade,
  showSidebar = true
}) {
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [selectedScroll, setSelectedScroll] = useState(null)
  const [shakingScrollId, setShakingScrollId] = useState(null)
  const [unlockingScrollId, setUnlockingScrollId] = useState(null)

  const handleScrollClick = (scroll, canAccess) => {
    if (canAccess) {
      // Scroll is unlocked - proceed normally
      onScrollClick && onScrollClick(scroll)
    } else {
      // Scroll is locked - trigger shake then upgrade modal
      setShakingScrollId(scroll.id)
      setTimeout(() => {
        setShakingScrollId(null)
        setSelectedScroll(scroll)
        setShowUpgradeModal(true)
      }, 600)
    }
  }

  const handleUpgradeConfirm = (tierKey) => {
    setShowUpgradeModal(false)
    
    // Simulate unlock animation
    setUnlockingScrollId(selectedScroll.id)
    setTimeout(() => {
      setShowUnlockAnimation(true)
      setTimeout(() => {
        setShowUnlockAnimation(false)
        setUnlockingScrollId(null)
        
        // Now open the scroll
        onScrollClick && onScrollClick(selectedScroll)
        
        // Trigger actual upgrade
        onUpgrade && onUpgrade(tierKey)
      }, 2500)
    }, 300)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-3 space-y-8">
        {/* Personalized Recommendations */}
        <PersonalizedRecommendations 
          role={role}
          progress={progress}
          achievements={achievements}
        />

        {/* Scroll Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scrolls.map((scroll) => {
            const isShaking = shakingScrollId === scroll.id
            const isUnlocking = unlockingScrollId === scroll.id
            
            return (
              <div
                key={scroll.id}
                className="relative"
              >
                {isShaking && (
                  <LockShakeAnimation onAnimationEnd={() => setShakingScrollId(null)} />
                )}
                
                {isUnlocking && <UnlockIndicator isUnlocking={true} />}
                
                {/* Scroll Card - Your existing ScrollCard component */}
                <div className="card cursor-pointer">
                  {/* ... render scroll card content ... */}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Sidebar */}
      {showSidebar && (
        <div className="lg:col-span-1 space-y-6">
          {/* Credit Tracker */}
          <CreditTracker compact={false} showDetails={true} />

          {/* Next Steps */}
          <NextStepsCard role={role} progress={progress} />

          {/* Recommendation Widget */}
          <RecommendationWidget role={role} />

          {/* Quick Upgrade */}
          {currentTier === 'free' && (
            <QuickUpgradePrompt 
              onUpgrade={() => setShowUpgradeModal(true)}
              minimal={false}
            />
          )}
        </div>
      )}

      {/* Modals */}
      {showUpgradeModal && selectedScroll && (
        <UpgradeModal
          scroll={selectedScroll}
          currentTier={currentTier}
          onClose={() => setShowUpgradeModal(false)}
          onUpgrade={handleUpgradeConfirm}
        />
      )}

      {showUnlockAnimation && selectedScroll && (
        <UnlockAnimation
          scroll={selectedScroll}
          onComplete={() => setShowUnlockAnimation(false)}
          autoPlay={true}
        />
      )}
    </div>
  )
}

/**
 * Sidebar Credit and Tier Info
 * Compact version for persistent display
 */
export function ScrollAccessSidebar({ role, currentTier, onUpgrade }) {
  return (
    <div className="space-y-4">
      {/* Credit Badge */}
      <div className="card">
        <CreditBadge showLabel={true} />
        <div className="mt-2 text-xs text-gray-500">
          Credits reset monthly
        </div>
      </div>

      {/* Current Tier */}
      <div className="card bg-gradient-to-br from-vault-purple/10 to-vault-blue/10">
        <div className="text-xs text-gray-600 mb-1">Current Plan</div>
        <div className="text-lg font-bold capitalize mb-3">{currentTier}</div>
        <button 
          onClick={onUpgrade}
          className="btn-primary w-full text-sm py-2"
        >
          Upgrade Tier
        </button>
      </div>

      {/* Progress Indicator */}
      <div className="card">
        <div className="text-xs text-gray-600 mb-2">Your Progress</div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Scrolls Read</span>
          <span className="text-sm font-bold text-vault-purple">3/12</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-gradient-to-r from-vault-purple to-vault-blue h-2 rounded-full" style={{ width: '25%' }}></div>
        </div>
      </div>
    </div>
  )
}

/**
 * Full-page Tier Comparison View
 * For dedicated comparison page
 */
export function TierComparisonPage({ onSelectTier }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <TierComparison 
        currentTier="free"
        onSelectTier={onSelectTier}
      />
    </div>
  )
}

export default EnhancedScrollAccess
