import { useState, useEffect } from 'react'
import { getCreatorPassTier } from '../utils/pricing'
import UnlockAnimation, { LockShakeAnimation, UnlockIndicator } from './UnlockAnimation'
import UpgradeModal from './UpgradeModal'
import { CreditCost } from './CreditTracker'

// Scroll metadata with access tiers
const scrolls = [
  {
    id: '00-index',
    title: 'Master Index',
    subtitle: 'Your Entry Point',
    description: 'Complete library navigation, quick-start guides, and voice guidelines.',
    icon: '📋',
    tier: 'free',
    category: 'foundation',
    readTime: '10 min',
    creditCost: 0,
    filePath: 'docs/lore/scrolls/00-index.md'
  },
  {
    id: 'creator-pass',
    title: 'Creator Pass',
    subtitle: 'The Master Key',
    description: 'Premium subscription details, pricing tiers, and exclusive perks.',
    icon: '👑',
    tier: 'free',
    category: 'foundation',
    readTime: '8 min',
    creditCost: 0,
    filePath: 'docs/lore/scrolls/creator-pass.md'
  },
  {
    id: '10-agency-scroll',
    title: 'Agency Scroll',
    subtitle: 'Partnership Framework',
    description: 'White-label offerings, revenue models, CLI commands, and agency success stories.',
    icon: '🏢',
    tier: 'pro',
    category: 'agency',
    readTime: '20 min',
    creditCost: 25,
    filePath: 'docs/lore/scrolls/10-agency-scroll.md'
  },
  {
    id: 'AGENCY_CLI_QUICKSTART',
    title: 'CLI Quickstart',
    subtitle: 'Command Reference',
    description: 'Master the command line for agency operations, automation, and client management.',
    icon: '⚡',
    tier: 'pro',
    category: 'agency',
    readTime: '12 min',
    creditCost: 15,
    filePath: 'docs/lore/scrolls/AGENCY_CLI_QUICKSTART.md'
  },
  {
    id: 'ASCENSION_SCROLL',
    title: 'Ascension Scroll',
    subtitle: 'Advanced Rituals',
    description: 'Deep system architecture, automation sequences, and scaling strategies.',
    icon: '🔮',
    tier: 'legacy',
    category: 'advanced',
    readTime: '15 min',
    creditCost: 50,
    filePath: 'docs/lore/scrolls/ASCENSION_SCROLL.md'
  }
]

function ScrollGalleryEnhanced({ role, hasPass, onSelectScroll, onBackToRoles }) {
  const [userTier, setUserTier] = useState('free')
  const [filterCategory, setFilterCategory] = useState('all')
  
  // Phase 4 enhancements
  const [shakingScrollId, setShakingScrollId] = useState(null)
  const [unlockingScrollId, setUnlockingScrollId] = useState(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false)
  const [selectedScroll, setSelectedScroll] = useState(null)

  useEffect(() => {
    // Determine user tier based on hasPass and stored data
    if (hasPass) {
      const tierData = getCreatorPassTier()
      setUserTier(tierData?.tier || 'starter')
    }
  }, [hasPass])

  const canAccessScroll = (scroll) => {
    // Free scrolls accessible to everyone
    if (scroll.tier === 'free') return true
    
    // Check tier hierarchy: legacy > pro > starter > free
    const tierHierarchy = { 'free': 0, 'starter': 1, 'pro': 2, 'legacy': 3 }
    return tierHierarchy[userTier] >= tierHierarchy[scroll.tier]
  }

  const handleScrollClick = (scroll) => {
    if (canAccessScroll(scroll)) {
      // Unlocked - open normally
      onSelectScroll(scroll)
    } else {
      // Locked - trigger shake then modal
      setShakingScrollId(scroll.id)
      setTimeout(() => {
        setShakingScrollId(null)
        setSelectedScroll(scroll)
        setShowUpgradeModal(true)
      }, 600)
    }
  }

  const handleUpgrade = async (tierKey) => {
    setShowUpgradeModal(false)
    
    // Show unlocking indicator
    setUnlockingScrollId(selectedScroll.id)
    
    // Trigger unlock animation after brief delay
    setTimeout(() => {
      setShowUnlockAnimation(true)
      
      // Complete unlock sequence
      setTimeout(() => {
        setShowUnlockAnimation(false)
        setUnlockingScrollId(null)
        
        // Update tier
        const subscriptionData = {
          hasPass: true,
          tier: tierKey,
          billingCycle: 'monthly',
          subscribedAt: new Date().toISOString()
        }
        localStorage.setItem('vauntico_creator_pass', 'true')
        localStorage.setItem('vauntico_creator_pass_tier', JSON.stringify(subscriptionData))
        setUserTier(tierKey)
        
        // Award achievement
        const achievements = JSON.parse(localStorage.getItem('vauntico_achievements') || '[]')
        if (!achievements.includes('upgraded-tier')) {
          achievements.push('upgraded-tier')
          localStorage.setItem('vauntico_achievements', JSON.stringify(achievements))
        }
        
        // Now open the scroll
        onSelectScroll(selectedScroll)
      }, 2500)
    }, 300)
  }

  const getRoleName = (roleId) => {
    const names = {
      'solo-creator': 'Solo Creator',
      'agency': 'Agency Partner',
      'team-lead': 'Team Lead'
    }
    return names[roleId] || roleId
  }

  // Filter scrolls based on role's recommended path
  const roleScrollAccess = role.scrollAccess || []
  const recommendedScrolls = scrolls.filter(s => roleScrollAccess.includes(s.id))
  const otherScrolls = scrolls.filter(s => !roleScrollAccess.includes(s.id))

  const allScrolls = filterCategory === 'all' 
    ? [...recommendedScrolls, ...otherScrolls]
    : scrolls.filter(s => s.category === filterCategory)

  const categories = [
    { id: 'all', name: 'All Scrolls', icon: '📚' },
    { id: 'foundation', name: 'Foundation', icon: '🏛️' },
    { id: 'agency', name: 'Agency', icon: '🏢' },
    { id: 'advanced', name: 'Advanced', icon: '🔮' }
  ]

  return (
    <div className="mb-16">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onBackToRoles}
          className="text-gray-600 hover:text-vault-purple font-medium mb-4 flex items-center transition-colors"
        >
          <span className="mr-2">←</span> Back to Role Selection
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">
              {role.icon} {getRoleName(role.id)} <span className="text-gradient">Library</span>
            </h2>
            <p className="text-gray-600">
              Your curated scroll collection. {recommendedScrolls.length} recommended for your path.
            </p>
          </div>

          {/* Tier Badge */}
          <div className="text-right">
            <div className="text-xs text-gray-500 mb-1">Your Access Tier</div>
            <div className={`inline-flex items-center px-4 py-2 rounded-lg font-semibold ${
              userTier === 'legacy' ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700' :
              userTier === 'pro' ? 'bg-gradient-to-r from-purple-100 to-blue-100 text-vault-purple' :
              userTier === 'starter' ? 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700' :
              'bg-gray-100 text-gray-600'
            }`}>
              {userTier === 'legacy' && '👑'}
              {userTier === 'pro' && '💎'}
              {userTier === 'starter' && '⚡'}
              {userTier === 'free' && '📖'}
              <span className="ml-2 capitalize">{userTier}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center space-x-3 mb-8 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilterCategory(cat.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              filterCategory === cat.id
                ? 'bg-vault-purple text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Recommended Scrolls */}
      {filterCategory === 'all' && recommendedScrolls.length > 0 && (
        <div className="mb-12">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <span className="text-gradient">⭐ Recommended for You</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedScrolls.map((scroll) => (
              <ScrollCardEnhanced
                key={scroll.id}
                scroll={scroll}
                canAccess={canAccessScroll(scroll)}
                onSelect={handleScrollClick}
                isRecommended={true}
                isShaking={shakingScrollId === scroll.id}
                isUnlocking={unlockingScrollId === scroll.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Other Scrolls */}
      {filterCategory === 'all' && otherScrolls.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4 text-gray-700">
            📚 Full Library
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherScrolls.map((scroll) => (
              <ScrollCardEnhanced
                key={scroll.id}
                scroll={scroll}
                canAccess={canAccessScroll(scroll)}
                onSelect={handleScrollClick}
                isRecommended={false}
                isShaking={shakingScrollId === scroll.id}
                isUnlocking={unlockingScrollId === scroll.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Filtered Results */}
      {filterCategory !== 'all' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allScrolls.map((scroll) => (
            <ScrollCardEnhanced
              key={scroll.id}
              scroll={scroll}
              canAccess={canAccessScroll(scroll)}
              onSelect={handleScrollClick}
              isRecommended={roleScrollAccess.includes(scroll.id)}
              isShaking={shakingScrollId === scroll.id}
              isUnlocking={unlockingScrollId === scroll.id}
            />
          ))}
        </div>
      )}

      {/* Upgrade Prompt */}
      {!hasPass && (
        <div className="mt-12 card bg-gradient-to-br from-vault-purple/10 to-vault-blue/10 border-2 border-vault-purple/20">
          <div className="flex items-start space-x-4">
            <div className="text-5xl">🔓</div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-2">Unlock Advanced Scrolls</h3>
              <p className="text-gray-600 mb-4">
                Get Creator Pass to access agency tools, CLI automation guides, and advanced implementation scrolls.
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
                <li className="flex items-center text-sm">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Agency Partnership Framework</span>
                </li>
                <li className="flex items-center text-sm">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>CLI Command Reference</span>
                </li>
                <li className="flex items-center text-sm">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Ascension Rituals</span>
                </li>
                <li className="flex items-center text-sm">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Monthly new scrolls</span>
                </li>
              </ul>
              <button
                onClick={() => {
                  setSelectedScroll(scrolls.find(s => s.tier !== 'free'))
                  setShowUpgradeModal(true)
                }}
                className="btn-primary"
              >
                View Plans & Pricing →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showUpgradeModal && selectedScroll && (
        <UpgradeModal
          scroll={selectedScroll}
          currentTier={userTier}
          onClose={() => setShowUpgradeModal(false)}
          onUpgrade={handleUpgrade}
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

// Enhanced Individual Scroll Card Component with animations
function ScrollCardEnhanced({ scroll, canAccess, onSelect, isRecommended, isShaking, isUnlocking }) {
  const getTierBadge = (tier) => {
    const badges = {
      'free': { text: 'Free', class: 'bg-gray-100 text-gray-600', icon: '📖' },
      'starter': { text: 'Starter', class: 'bg-blue-100 text-blue-700', icon: '⚡' },
      'pro': { text: 'Pro', class: 'bg-purple-100 text-vault-purple', icon: '💎' },
      'legacy': { text: 'Legacy', class: 'bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700', icon: '👑' }
    }
    return badges[tier] || badges.free
  }

  const tierBadge = getTierBadge(scroll.tier)

  return (
    <div
      onClick={() => onSelect(scroll)}
      className={`relative card border-2 transition-all transform ${
        canAccess
          ? 'cursor-pointer border-transparent hover:border-vault-purple hover:shadow-2xl hover:scale-105'
          : 'cursor-pointer border-gray-300 hover:border-gray-400'
      } ${isRecommended ? 'ring-2 ring-vault-purple/30' : ''}`}
    >
      {/* Shake Animation Overlay */}
      {isShaking && (
        <LockShakeAnimation onAnimationEnd={() => {}} />
      )}

      {/* Unlocking Indicator */}
      {isUnlocking && <UnlockIndicator isUnlocking={true} />}

      {/* Lock Overlay */}
      {!canAccess && !isUnlocking && (
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-gray-800 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl">
            🔒
          </div>
        </div>
      )}

      {/* Recommended Badge */}
      {isRecommended && canAccess && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full px-3 py-1 text-xs font-bold shadow-lg">
            ⭐ For You
          </div>
        </div>
      )}

      {/* Content */}
      <div className="text-center mb-4">
        <div className="text-5xl mb-3">{scroll.icon}</div>
        <h3 className="text-lg font-bold mb-1">{scroll.title}</h3>
        <p className="text-sm text-gray-500 mb-2">{scroll.subtitle}</p>
      </div>

      <p className="text-sm text-gray-600 mb-4 leading-relaxed">
        {scroll.description}
      </p>

      {/* Meta Info */}
      <div className="flex items-center justify-between text-xs mb-3">
        <div className={`px-2 py-1 rounded-full font-semibold ${tierBadge.class}`}>
          {tierBadge.icon} {tierBadge.text}
        </div>
        <span className="text-gray-500">{scroll.readTime}</span>
      </div>

      {/* Credit Cost (if applicable) */}
      {scroll.creditCost > 0 && canAccess && (
        <div className="mb-3">
          <CreditCost cost={scroll.creditCost} action="Read" />
        </div>
      )}

      {/* Access Status */}
      <div className="mt-4 pt-4 border-t">
        {canAccess ? (
          <div className="text-center text-sm text-vault-purple font-semibold">
            Read Scroll →
          </div>
        ) : (
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-2">
              Requires {tierBadge.text} Tier
            </div>
            <div className="text-xs text-vault-purple font-semibold">
              Click to unlock
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ScrollGalleryEnhanced
