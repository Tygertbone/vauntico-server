import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getCreatorPassTier } from '../utils/pricing'
import { trackAscendPageView, trackSoulStackUnlock } from '../utils/analytics'


/**
 * Ascend Page - Soul Stack Progression Map
 * Phase 5: Final onboarding scroll with tier unlock logic
 */

const SOUL_STACK_TIERS = [
  {
    id: 'foundation',
    name: 'Foundation Layer',
    emoji: '🏗️',
    description: 'Master the fundamentals of your craft',
    requiredTier: 'free',
    scrolls: ['01-landing-page-hero', '02-pricing-tiers', '06-core-features-scroll'],
    achievements: ['first_scroll', 'lore_explorer'],
    skills: ['Content Creation', 'Brand Voice', 'Value Proposition'],
    unlocked: true
  },
  {
    id: 'amplification',
    name: 'Amplification Layer',
    emoji: '📣',
    description: 'Scale your reach and impact',
    requiredTier: 'starter',
    scrolls: ['07-testimonial-social-proof', '08-content-calendar', '09-distribution-layer-scroll'],
    achievements: ['cli_master', 'automation_unlocked'],
    skills: ['Distribution', 'Social Proof', 'Content Systems'],
    unlocked: false
  },
  {
    id: 'transformation',
    name: 'Transformation Layer',
    emoji: '✨',
    description: 'Build systems that create lasting change',
    requiredTier: 'pro',
    scrolls: ['03-workshop-kit-scroll', '04-audit-service-scroll', '10-agency-scroll'],
    achievements: ['workshop_completed', 'audit_master'],
    skills: ['Workshop Design', 'Service Delivery', 'Agency Operations'],
    unlocked: false
  },
  {
    id: 'legacy',
    name: 'Legacy Layer',
    emoji: '👑',
    description: 'Create movements that outlive you',
    requiredTier: 'legacy',
    scrolls: ['creator-pass', 'dream-mover-cli', 'distribution-layer-index-entry'],
    achievements: ['mythmaker', 'legacy_builder', 'movement_starter'],
    skills: ['Vision Casting', 'Movement Building', 'Eternal Systems'],
    unlocked: false
  }
]

function Ascend() {
  const [userTier, setUserTier] = useState(null)
  const [progress, setProgress] = useState({})
  const [selectedTier, setSelectedTier] = useState(null)

  useEffect(() => {
    // Get user's current tier
    const tierData = getCreatorPassTier()
    setUserTier(tierData?.tier || 'free')

    // Calculate progress
    const progressData = calculateProgress(tierData?.tier || 'free')
    setProgress(progressData)

    // Track page view
    trackAscendPageView(progressData.percentage)
  }, [])

  const calculateProgress = (currentTier) => {
    const tierOrder = ['free', 'starter', 'pro', 'legacy']
    const currentIndex = tierOrder.indexOf(currentTier)
    
    const unlockedLayers = SOUL_STACK_TIERS.map(tier => {
      const tierIndex = tierOrder.indexOf(tier.requiredTier)
      return {
        ...tier,
        unlocked: tierIndex <= currentIndex
      }
    })

    const totalLayers = SOUL_STACK_TIERS.length
    const unlockedCount = unlockedLayers.filter(t => t.unlocked).length
    const percentage = Math.round((unlockedCount / totalLayers) * 100)

    return {
      unlockedLayers,
      totalLayers,
      unlockedCount,
      percentage
    }
  }

  const handleTierClick = (tier) => {
    setSelectedTier(selectedTier?.id === tier.id ? null : tier)
    if (!tier.unlocked) {
      trackSoulStackUnlock(tier.name, SOUL_STACK_TIERS.indexOf(tier))
    }
  }

  const getTierIcon = (requiredTier) => {
    const icons = {
      free: '📖',
      starter: '⚔️',
      pro: '🏰',
      legacy: '👑'
    }
    return icons[requiredTier] || '📜'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-vault-dark via-purple-900 to-vault-dark text-white">
      {/* Hero Section */}
      <section className="pt-20 pb-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-block mb-6 animate-float">
            <div className="w-24 h-24 vault-gradient rounded-full flex items-center justify-center text-5xl">
              🏔️
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            <span className="text-gradient">Ascend</span> the Soul Stack
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 animate-fade-in animation-delay-200">
            Your journey from creator to mythmaker
          </p>

          {/* Progress Bar */}
          <div className="max-w-2xl mx-auto mb-12 animate-fade-in animation-delay-400">
            <div className="bg-white/10 backdrop-blur-sm rounded-full h-6 border border-white/20 overflow-hidden">
              <div 
                className="h-full vault-gradient transition-all duration-1000 ease-out flex items-center justify-end px-4"
                style={{ width: `${progress.percentage || 0}%` }}
              >
                <span className="text-white text-sm font-bold">
                  {progress.percentage || 0}%
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-3">
              {progress.unlockedCount || 0} of {progress.totalLayers || 4} layers unlocked
            </p>
          </div>

          {/* Current Tier Badge */}
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 animate-fade-in animation-delay-600">
            <span className="text-2xl">{getTierIcon(userTier)}</span>
            <div className="text-left">
              <p className="text-xs text-gray-400 uppercase tracking-wider">Current Tier</p>
              <p className="text-lg font-bold capitalize">{userTier || 'Free'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quest System Section */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">

        </div>
      </section>

      {/* Soul Stack Visualization */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-gradient">
            Your Soul Stack Journey
          </h2>
          <div className="space-y-6">
            {SOUL_STACK_TIERS.map((tier, index) => {
              const isUnlocked = progress.unlockedLayers?.[index]?.unlocked || false
              const isSelected = selectedTier?.id === tier.id

              return (
                <div
                  key={tier.id}
                  className={`
                    group relative overflow-hidden rounded-2xl border-2 transition-all duration-500 cursor-pointer
                    ${isUnlocked 
                      ? 'bg-white/10 backdrop-blur-sm border-vault-purple hover:border-vault-gold hover:scale-102' 
                      : 'bg-black/20 backdrop-blur-sm border-gray-700 opacity-60 hover:opacity-80'
                    }
                    ${isSelected ? 'scale-102 ring-4 ring-vault-gold' : ''}
                    animate-fade-in
                  `}
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => handleTierClick(tier)}
                >
                  {/* Lock Overlay */}
                  {!isUnlocked && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-10">
                      <div className="text-center">
                        <div className="text-6xl mb-4 animate-pulse">🔒</div>
                        <p className="text-white font-bold text-lg mb-2">
                          Requires {getTierIcon(tier.requiredTier)} {tier.requiredTier.charAt(0).toUpperCase() + tier.requiredTier.slice(1)}
                        </p>
                        <Link 
                          to="/creator-pass" 
                          className="inline-block mt-4 px-6 py-2 bg-vault-gradient text-white font-bold rounded-lg hover:scale-105 transition-transform"
                        >
                          Unlock Layer →
                        </Link>
                      </div>
                    </div>
                  )}

                  <div className="p-8">
                    <div className="flex items-start gap-6">
                      {/* Tier Icon */}
                      <div className="flex-shrink-0">
                        <div className={`
                          w-20 h-20 rounded-2xl flex items-center justify-center text-4xl transition-transform
                          ${isUnlocked ? 'vault-gradient' : 'bg-gray-800'}
                          ${isSelected ? 'scale-110' : 'group-hover:scale-110'}
                        `}>
                          {tier.emoji}
                        </div>
                      </div>

                      {/* Tier Content */}
                      <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-2xl font-bold">{tier.name}</h3>
                          {isUnlocked && (
                            <span className="text-green-400 text-2xl animate-bounce">✓</span>
                          )}
                        </div>
                        
                        <p className="text-gray-300 mb-6">{tier.description}</p>

                        {/* Skills */}
                        <div className="mb-4">
                          <p className="text-sm text-gray-400 mb-2 uppercase tracking-wider">Skills</p>
                          <div className="flex flex-wrap gap-2">
                            {tier.skills.map(skill => (
                              <span 
                                key={skill}
                                className="px-3 py-1 bg-white/10 rounded-full text-sm border border-white/20"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {isSelected && isUnlocked && (
                          <div className="mt-6 pt-6 border-t border-white/20 animate-fade-in">
                            <div className="grid md:grid-cols-2 gap-6">
                              {/* Scrolls */}
                              <div>
                                <p className="text-sm text-gray-400 mb-3 uppercase tracking-wider">
                                  📜 Available Scrolls
                                </p>
                                <ul className="space-y-2">
                                  {tier.scrolls.map(scroll => (
                                    <li key={scroll} className="text-sm text-gray-300 flex items-center gap-2">
                                      <span className="text-vault-gold">→</span>
                                      {scroll.replace(/-/g, ' ').replace(/^\d+-/, '')}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Achievements */}
                              <div>
                                <p className="text-sm text-gray-400 mb-3 uppercase tracking-wider">
                                  🏆 Achievements
                                </p>
                                <ul className="space-y-2">
                                  {tier.achievements.map(achievement => (
                                    <li key={achievement} className="text-sm text-gray-300 flex items-center gap-2">
                                      <span className="text-vault-gold">✦</span>
                                      {achievement.replace(/_/g, ' ')}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            <Link
                              to="/lore"
                              className="mt-6 inline-flex items-center gap-2 px-6 py-3 vault-gradient rounded-lg font-bold hover:scale-105 transition-transform"
                            >
                              Explore Scrolls →
                            </Link>
                          </div>
                        )}
                      </div>

                      {/* Tier Number */}
                      <div className="flex-shrink-0 text-right">
                        <div className="text-6xl font-bold text-white/10">
                          {index + 1}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-vault-purple to-purple-900 rounded-3xl p-12 border-2 border-vault-gold">
            <h2 className="text-4xl font-bold mb-6">
              Ready to {progress.percentage === 100 ? 'Build Your' : 'Ascend the'} Legacy?
            </h2>
            
            <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
              {progress.percentage === 100 
                ? 'You\'ve unlocked all layers. Now it\'s time to create systems that outlive you.' 
                : 'Unlock all layers of the Soul Stack and transform from creator to mythmaker.'
              }
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              {progress.percentage < 100 ? (
                <>
                  <Link
                    to="/creator-pass"
                    className="btn-primary text-lg px-8 py-4"
                  >
                    View Creator Pass →
                  </Link>
                  <Link
                    to="/lore"
                    className="btn-outline text-lg px-8 py-4"
                  >
                    Explore Lore Vault
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/dream-mover"
                    className="btn-primary text-lg px-8 py-4"
                  >
                    Launch Dream Mover →
                  </Link>
                  <Link
                    to="/lore"
                    className="btn-outline text-lg px-8 py-4"
                  >
                    Review Scrolls
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Journey Stats */}
      <section className="py-12 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Layers Unlocked', value: progress.unlockedCount || 0, icon: '🏔️' },
              { label: 'Scrolls Available', value: (progress.unlockedLayers || []).reduce((acc, tier) => acc + (tier.unlocked ? tier.scrolls.length : 0), 0), icon: '📜' },
              { label: 'Skills Mastered', value: (progress.unlockedLayers || []).reduce((acc, tier) => acc + (tier.unlocked ? tier.skills.length : 0), 0), icon: '✨' },
              { label: 'Progress', value: `${progress.percentage || 0}%`, icon: '📈' }
            ].map((stat, index) => (
              <div 
                key={stat.label} 
                className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div className="text-3xl font-bold mb-1 text-gradient">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Ascend
