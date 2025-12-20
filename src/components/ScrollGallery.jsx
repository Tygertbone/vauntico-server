import { useState, useEffect } from 'react'
import { PRICING } from '../utils/pricing'
import ScrollPreview from './ScrollPreview'

// Scroll metadata with access tiers
const scrolls = [
  {
    id: '00-index',
    title: 'Master Index',
    subtitle: 'Your Entry Point',
    description: 'Complete library navigation, quick-start guides, and voice guidelines.',
    excerpt: 'Your comprehensive entry point to the Vauntico Lore Vault. Navigate the complete library, access quick-start guides, understand voice guidelines, and discover the architecture of sacred knowledge.',
    icon: '📋',
    tier: 'free',
    category: 'foundation',
    readTime: '10 min',
    views: '5.2k',
    rating: 4.9,
    difficulty: 'Beginner',
    unlockedBy: '2,500+',
    features: ['Complete library map', 'Quick-start guides', 'Voice & tone guidelines', 'Navigation best practices'],
    filePath: 'docs/lore/scrolls/00-index.md'
  },
  {
    id: 'creator-pass',
    title: 'Creator Pass',
    subtitle: 'The Master Key',
    description: 'Premium subscription details, pricing tiers, and exclusive perks.',
    excerpt: 'Discover the three covenant tiers, understand pricing models, explore exclusive perks, and learn how to ascend through the ranks of Vauntico mastery.',
    icon: '👑',
    tier: 'free',
    category: 'foundation',
    readTime: '8 min',
    views: '3.8k',
    rating: 4.8,
    difficulty: 'Beginner',
    unlockedBy: '2,100+',
    features: ['Tier comparison', 'Pricing details', 'Exclusive benefits', 'Upgrade paths'],
    filePath: 'docs/lore/scrolls/creator-pass.md'
  },
  {
    id: '10-agency-scroll',
    title: 'Agency Scroll',
    subtitle: 'Partnership Framework',
    description: 'White-label offerings, revenue models, CLI commands, and agency success stories.',
    excerpt: 'Master the art of agency partnerships with Vauntico. Learn white-label offerings, revenue models, CLI automation, client onboarding, and proven success stories from top agencies.',
    icon: '🏢',
    tier: 'pro',
    category: 'agency',
    readTime: '20 min',
    views: '1.4k',
    rating: 4.9,
    difficulty: 'Advanced',
    unlockedBy: '850+',
    features: ['White-label setup', 'Revenue sharing models', 'Client onboarding flows', 'Agency CLI commands', 'Case studies & success stories'],
    filePath: 'docs/lore/scrolls/10-agency-scroll.md'
  },
  {
    id: 'AGENCY_CLI_QUICKSTART',
    title: 'CLI Quickstart',
    subtitle: 'Command Reference',
    description: 'Master the command line for agency operations, automation, and client management.',
    excerpt: 'The complete command-line reference for agency operations. Learn essential commands, automation sequences, client management workflows, and power-user shortcuts.',
    icon: '⚡',
    tier: 'pro',
    category: 'agency',
    readTime: '12 min',
    views: '2.1k',
    rating: 4.8,
    difficulty: 'Intermediate',
    unlockedBy: '950+',
    features: ['Essential CLI commands', 'Automation workflows', 'Client management', 'Power-user shortcuts', 'Troubleshooting guide'],
    filePath: 'docs/lore/scrolls/AGENCY_CLI_QUICKSTART.md'
  },
  {
    id: 'ASCENSION_SCROLL',
    title: 'Ascension Scroll',
    subtitle: 'Advanced Rituals',
    description: 'Deep system architecture, automation sequences, and scaling strategies.',
    excerpt: 'The sacred knowledge of system mastery. Dive deep into Vauntico architecture, advanced automation, scaling strategies, and the rituals of legendary creators.',
    icon: '🔮',
    tier: 'legacy',
    category: 'advanced',
    readTime: '15 min',
    views: '680',
    rating: 5.0,
    difficulty: 'Expert',
    unlockedBy: '320+',
    features: ['System architecture deep dive', 'Advanced automation sequences', 'Scaling strategies', 'Legacy builder rituals', 'Custom integrations'],
    filePath: 'docs/lore/scrolls/ASCENSION_SCROLL.md'
  }
]

function ScrollGallery({ role, hasPass, onSelectScroll, onBackToRoles }) {
  const [userTier, setUserTier] = useState('free')
  const [filterCategory, setFilterCategory] = useState('all')

  useEffect(() => {
    // Determine user tier based on hasPass and stored data
    if (hasPass) {
      const storedTier = localStorage.getItem('vauntico_creator_pass_tier') || 'starter'
      setUserTier(storedTier)
    }
  }, [hasPass])

  const canAccessScroll = (scroll) => {
    // Free scrolls accessible to everyone
    if (scroll.tier === 'free') return true
    
    // Check tier hierarchy: legacy > pro > starter > free
    const tierHierarchy = { 'free': 0, 'starter': 1, 'pro': 2, 'legacy': 3 }
    return tierHierarchy[userTier] >= tierHierarchy[scroll.tier]
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
            {recommendedScrolls.map((scroll) => {
              const canAccess = canAccessScroll(scroll)
              // Use ScrollPreview for locked scrolls, regular card for unlocked
              if (!canAccess) {
                return (
                  <ScrollPreview
                    key={scroll.id}
                    scroll={scroll}
                    hasAccess={false}
                    onUpgrade={() => window.location.href = '/creator-pass'}
                  />
                )
              }
              return (
                <ScrollCard
                  key={scroll.id}
                  scroll={scroll}
                  canAccess={canAccess}
                  onSelect={onSelectScroll}
                  isRecommended={true}
                />
              )
            })}
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
            {otherScrolls.map((scroll) => {
              const canAccess = canAccessScroll(scroll)
              // Use ScrollPreview for locked scrolls
              if (!canAccess) {
                return (
                  <ScrollPreview
                    key={scroll.id}
                    scroll={scroll}
                    hasAccess={false}
                    onUpgrade={() => window.location.href = '/creator-pass'}
                  />
                )
              }
              return (
                <ScrollCard
                  key={scroll.id}
                  scroll={scroll}
                  canAccess={canAccess}
                  onSelect={onSelectScroll}
                  isRecommended={false}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* Filtered Results */}
      {filterCategory !== 'all' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allScrolls.map((scroll) => {
            const canAccess = canAccessScroll(scroll)
            // Use ScrollPreview for locked scrolls
            if (!canAccess) {
              return (
                <ScrollPreview
                  key={scroll.id}
                  scroll={scroll}
                  hasAccess={false}
                  onUpgrade={() => window.location.href = '/creator-pass'}
                />
              )
            }
            return (
              <ScrollCard
                key={scroll.id}
                scroll={scroll}
                canAccess={canAccess}
                onSelect={onSelectScroll}
                isRecommended={roleScrollAccess.includes(scroll.id)}
              />
            )
          })}
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
              <a href="/creator-pass" className="btn-primary">
                Upgrade to Creator Pass →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Individual Scroll Card Component
function ScrollCard({ scroll, canAccess, onSelect, isRecommended }) {
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
      onClick={() => canAccess && onSelect(scroll)}
      className={`card border-2 transition-all transform hover:scale-105 ${
        canAccess
          ? 'cursor-pointer border-transparent hover:border-vault-purple hover:shadow-2xl'
          : 'opacity-60 cursor-not-allowed border-gray-300'
      } ${isRecommended ? 'ring-2 ring-vault-purple/30' : ''}`}
    >
      {/* Lock Overlay */}
      {!canAccess && (
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
      <div className="flex items-center justify-between text-xs">
        <div className={`px-2 py-1 rounded-full font-semibold ${tierBadge.class}`}>
          {tierBadge.icon} {tierBadge.text}
        </div>
        <span className="text-gray-500">{scroll.readTime}</span>
      </div>

      {/* Access Status */}
      <div className="mt-4 pt-4 border-t">
        {canAccess ? (
          <div className="text-center text-sm text-vault-purple font-semibold">
            Read Scroll →
          </div>
        ) : (
          <div className="text-center text-sm text-gray-500">
            Requires {tierBadge.text} Tier
          </div>
        )}
      </div>
    </div>
  )
}

export default ScrollGallery
