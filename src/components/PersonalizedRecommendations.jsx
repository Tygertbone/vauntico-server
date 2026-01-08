import { useState, useEffect } from 'react'
import { getCreatorPassTier } from '../utils/pricing'

/**
 * Personalized Recommendations Component
 * Suggests scrolls and actions based on role + progress
 */
function PersonalizedRecommendations({ role, progress = {}, achievements = [] }) {
  const [recommendations, setRecommendations] = useState([])
  const tier = getCreatorPassTier()

  useEffect(() => {
    generateRecommendations()
  }, [role, progress, achievements])

  const generateRecommendations = () => {
    const recs = []

    // Progress-based recommendations
    if (progress.completed?.length === 0) {
      recs.push({
        id: 'start-onboarding',
        type: 'action',
        priority: 'high',
        icon: '🚀',
        title: 'Start Your CLI Journey',
        description: 'Complete the onboarding flow to unlock powerful automation commands',
        action: 'Start Onboarding',
        category: 'setup'
      })
    }

    // Role-specific recommendations
    if (role?.id === 'agency') {
      if (!achievements.includes('first-client')) {
        recs.push({
          id: 'agency-first-client',
          type: 'scroll',
          priority: 'high',
          icon: '🏢',
          title: 'Agency Scroll',
          description: 'Master client onboarding, white-label setups, and revenue models',
          action: 'Read Agency Scroll',
          scrollId: '10-agency-scroll',
          category: 'learning'
        })
      }

      if (!tier || tier.tier === 'starter') {
        recs.push({
          id: 'agency-upgrade-pro',
          type: 'upgrade',
          priority: 'medium',
          icon: '💎',
          title: 'Upgrade to Pro',
          description: 'Get white-label rights and advanced CLI tools for agency scaling',
          action: 'View Pro Benefits',
          category: 'growth'
        })
      }
    }

    if (role?.id === 'solo-creator') {
      if (!achievements.includes('first-generation')) {
        recs.push({
          id: 'creator-first-gen',
          type: 'action',
          priority: 'high',
          icon: '🎨',
          title: 'Generate Your First Content',
          description: 'Use DreamMover to create your first AI-powered landing page',
          action: 'Open DreamMover',
          category: 'creation'
        })
      }

      recs.push({
        id: 'creator-ascension',
        type: 'scroll',
        priority: 'medium',
        icon: '🔮',
        title: 'Ascension Scroll',
        description: 'Deep dive into advanced automation and scaling strategies',
        action: 'Unlock Ascension Scroll',
        scrollId: 'ASCENSION_SCROLL',
        category: 'learning'
      })
    }

    if (role?.id === 'team-lead') {
      recs.push({
        id: 'team-collaboration',
        type: 'feature',
        priority: 'high',
        icon: '👥',
        title: 'Enable Team Features',
        description: 'Set up vault sharing and collaborative workflows for your team',
        action: 'Configure Team',
        category: 'setup'
      })
    }

    // Tier-based recommendations
    if (!tier || tier.tier === 'free') {
      recs.push({
        id: 'unlock-full-library',
        type: 'upgrade',
        priority: 'high',
        icon: '🔓',
        title: 'Unlock Full Library',
        description: 'Access all scrolls, CLI tools, and premium features with Creator Pass',
        action: 'Compare Tiers',
        category: 'growth'
      })
    }

    // Achievement-based recommendations
    if (achievements.includes('onboarding-complete') && !achievements.includes('automation-setup')) {
      recs.push({
        id: 'setup-automation',
        type: 'action',
        priority: 'medium',
        icon: '🤖',
        title: 'Setup Automation',
        description: 'Configure automated workflows to save time and scale efficiently',
        action: 'Open Automation Tools',
        category: 'automation'
      })
    }

    // Learning path recommendations
    if (progress.completed?.length >= 3 && achievements.length >= 2) {
      recs.push({
        id: 'explore-advanced',
        type: 'scroll',
        priority: 'low',
        icon: '📚',
        title: 'Explore Advanced Scrolls',
        description: 'You\'re making great progress! Dive into specialized topics',
        action: 'Browse Library',
        category: 'learning'
      })
    }

    setRecommendations(recs)
  }

  const getPriorityBadge = (priority) => {
    const badges = {
      high: { text: 'High Priority', class: 'bg-red-100 text-red-700', icon: '🔥' },
      medium: { text: 'Recommended', class: 'bg-yellow-100 text-yellow-700', icon: '⭐' },
      low: { text: 'Suggested', class: 'bg-blue-100 text-blue-700', icon: '💡' }
    }
    return badges[priority] || badges.low
  }

  const getCategoryColor = (category) => {
    const colors = {
      setup: 'border-purple-300 bg-purple-50',
      learning: 'border-blue-300 bg-blue-50',
      creation: 'border-green-300 bg-green-50',
      growth: 'border-orange-300 bg-orange-50',
      automation: 'border-cyan-300 bg-cyan-50'
    }
    return colors[category] || 'border-gray-300 bg-gray-50'
  }

  if (recommendations.length === 0) {
    return (
      <div className="card text-center py-12">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-xl font-bold mb-2">You're All Caught Up!</h3>
        <p className="text-gray-600">
          Keep exploring the Lore Vault to discover more scrolls and features
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold mb-1">
            <span className="text-gradient">Recommended for You</span>
          </h3>
          <p className="text-gray-600">
            Based on your role and progress, here's what we suggest next
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {recommendations.length} {recommendations.length === 1 ? 'recommendation' : 'recommendations'}
        </div>
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((rec) => {
          const priority = getPriorityBadge(rec.priority)
          const categoryColor = getCategoryColor(rec.category)

          return (
            <div
              key={rec.id}
              className={`card border-2 ${categoryColor} hover:shadow-lg transition-all cursor-pointer group`}
            >
              {/* Priority Badge */}
              <div className="flex items-start justify-between mb-3">
                <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold ${priority.class}`}>
                  <span>{priority.icon}</span>
                  <span>{priority.text}</span>
                </div>
                <div className="text-3xl">{rec.icon}</div>
              </div>

              {/* Content */}
              <h4 className="text-lg font-bold mb-2 group-hover:text-vault-purple transition-colors">
                {rec.title}
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                {rec.description}
              </p>

              {/* Action Button */}
              <button className="w-full btn-outline text-sm py-2 group-hover:bg-vault-purple group-hover:text-white group-hover:border-vault-purple transition-all">
                {rec.action} →
              </button>

              {/* Category Tag */}
              <div className="mt-3 text-xs text-gray-500 capitalize">
                {rec.category}
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="card bg-gradient-to-br from-vault-purple/10 to-vault-blue/10 border-2 border-vault-purple/20">
        <h4 className="font-bold mb-3 flex items-center">
          <span className="text-xl mr-2">⚡</span>
          Quick Actions
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="flex flex-col items-center p-3 bg-white/50 rounded-lg hover:bg-white transition-all text-center">
            <span className="text-2xl mb-1">📖</span>
            <span className="text-xs font-medium">Browse Scrolls</span>
          </button>
          <button className="flex flex-col items-center p-3 bg-white/50 rounded-lg hover:bg-white transition-all text-center">
            <span className="text-2xl mb-1">🎯</span>
            <span className="text-xs font-medium">Track Progress</span>
          </button>
          <button className="flex flex-col items-center p-3 bg-white/50 rounded-lg hover:bg-white transition-all text-center">
            <span className="text-2xl mb-1">💎</span>
            <span className="text-xs font-medium">Upgrade Tier</span>
          </button>
          <button className="flex flex-col items-center p-3 bg-white/50 rounded-lg hover:bg-white transition-all text-center">
            <span className="text-2xl mb-1">🏆</span>
            <span className="text-xs font-medium">Achievements</span>
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Mini Recommendation Widget
 * Compact version for sidebars
 */
export function RecommendationWidget({ role, compact = true }) {
  const [topRec, setTopRec] = useState(null)

  useEffect(() => {
    // Get single top recommendation
    if (role?.id === 'agency') {
      setTopRec({
        icon: '🏢',
        title: 'Agency Scroll',
        action: 'Read Now'
      })
    } else if (role?.id === 'solo-creator') {
      setTopRec({
        icon: '🎨',
        title: 'Start Creating',
        action: 'Open DreamMover'
      })
    } else {
      setTopRec({
        icon: '📚',
        title: 'Explore Library',
        action: 'Browse Scrolls'
      })
    }
  }, [role])

  if (!topRec) return null

  return (
    <div className="card bg-gradient-to-br from-vault-purple/10 to-vault-blue/10 border-2 border-vault-purple/20">
      <div className="flex items-center space-x-3">
        <div className="text-3xl">{topRec.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-vault-purple font-semibold mb-1">Recommended</div>
          <div className="font-bold text-sm truncate">{topRec.title}</div>
        </div>
      </div>
      <button className="w-full btn-primary text-xs py-2 mt-3">
        {topRec.action} →
      </button>
    </div>
  )
}

/**
 * Next Steps Card
 * Shows immediate next action
 */
export function NextStepsCard({ role, progress }) {
  const getNextStep = () => {
    if (!progress || progress.completed?.length === 0) {
      return {
        icon: '🚀',
        title: 'Complete CLI Onboarding',
        description: 'Get started with the command line tools',
        action: 'Start Now'
      }
    }

    if (progress.completed?.length < 3) {
      return {
        icon: '📖',
        title: 'Read Your First Scroll',
        description: 'Dive into the knowledge library',
        action: 'Browse Scrolls'
      }
    }

    return {
      icon: '🎯',
      title: 'Keep Building',
      description: 'You\'re on the right track!',
      action: 'Continue'
    }
  }

  const nextStep = getNextStep()

  return (
    <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
      <div className="flex items-start space-x-4">
        <div className="text-5xl">{nextStep.icon}</div>
        <div className="flex-1">
          <div className="text-xs text-green-600 font-semibold mb-1">NEXT STEP</div>
          <h4 className="font-bold text-lg mb-1">{nextStep.title}</h4>
          <p className="text-sm text-gray-600 mb-4">{nextStep.description}</p>
          <button className="btn-primary text-sm">
            {nextStep.action} →
          </button>
        </div>
      </div>
    </div>
  )
}

export default PersonalizedRecommendations
