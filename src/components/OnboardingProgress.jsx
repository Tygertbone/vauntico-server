import { useState, useEffect } from 'react'

const ACHIEVEMENT_BADGES = [
  {
    id: 'first-install',
    title: 'CLI Novice',
    description: 'Installed Vauntico CLI',
    icon: '⚡',
    color: 'from-blue-400 to-cyan-400'
  },
  {
    id: 'first-auth',
    title: 'Authenticated',
    description: 'Connected your account',
    icon: '🔐',
    color: 'from-purple-400 to-pink-400'
  },
  {
    id: 'first-generation',
    title: 'Dream Weaver',
    description: 'Generated your first content',
    icon: '🎨',
    color: 'from-orange-400 to-red-400'
  },
  {
    id: 'first-client',
    title: 'Agency Pioneer',
    description: 'Onboarded your first client',
    icon: '🏢',
    color: 'from-teal-400 to-green-400'
  },
  {
    id: 'onboarding-complete',
    title: 'CLI Master',
    description: 'Completed full onboarding',
    icon: '👑',
    color: 'from-yellow-400 to-orange-400'
  },
  {
    id: 'automation-setup',
    title: 'Automation Architect',
    description: 'Setup automated workflows',
    icon: '🤖',
    color: 'from-indigo-400 to-purple-400'
  }
]

function OnboardingProgress({ roleId, onStartOnboarding }) {
  const [progress, setProgress] = useState({
    completed: [],
    skipped: [],
    achievements: []
  })
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    loadProgress()
  }, [roleId])

  const loadProgress = () => {
    const saved = localStorage.getItem(`vauntico_cli_onboarding_${roleId}`)
    const achievements = JSON.parse(localStorage.getItem('vauntico_achievements') || '[]')
    
    if (saved) {
      const data = JSON.parse(saved)
      setProgress({
        completed: data.completed || [],
        skipped: data.skipped || [],
        achievements: achievements
      })
    }
  }

  const getTotalSteps = () => {
    // This should match the actual step counts from CLIOnboarding
    const stepCounts = {
      'solo-creator': 5,
      'agency': 7,
      'team-lead': 4
    }
    return stepCounts[roleId] || 5
  }

  const getCompletionPercentage = () => {
    const total = getTotalSteps()
    const completed = progress.completed.length
    return Math.round((completed / total) * 100)
  }

  const getStatusEmoji = () => {
    const percentage = getCompletionPercentage()
    if (percentage === 0) return '🌱'
    if (percentage < 30) return '🌿'
    if (percentage < 60) return '🌳'
    if (percentage < 100) return '⚡'
    return '🏆'
  }

  const getStatusMessage = () => {
    const percentage = getCompletionPercentage()
    if (percentage === 0) return 'Ready to begin your journey'
    if (percentage < 30) return 'Just getting started'
    if (percentage < 60) return 'Making great progress'
    if (percentage < 100) return 'Almost there!'
    return 'Onboarding complete!'
  }

  const hasEarnedAchievement = (achievementId) => {
    return progress.achievements.includes(achievementId)
  }

  const completionPercentage = getCompletionPercentage()
  const isComplete = completionPercentage === 100

  return (
    <div className="card border-2 border-vault-purple/20 hover:border-vault-purple/40 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className="text-3xl">{getStatusEmoji()}</div>
            <div>
              <h3 className="text-lg font-bold">CLI Onboarding Progress</h3>
              <p className="text-sm text-gray-600">{getStatusMessage()}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative mt-4">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-vault-purple to-vault-blue h-3 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>{progress.completed.length} of {getTotalSteps()} steps</span>
              <span className="font-semibold">{completionPercentage}%</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {isExpanded ? '▲' : '▼'}
        </button>
      </div>

      {/* Action Button */}
      {!isComplete && (
        <button
          onClick={onStartOnboarding}
          className="w-full btn-primary py-3 mb-4"
        >
          {progress.completed.length === 0 ? '🚀 Start Onboarding' : '▶️ Continue Onboarding'}
        </button>
      )}

      {isComplete && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-lg text-center mb-4">
          <div className="text-2xl mb-2">🎉</div>
          <div className="font-semibold">Congratulations!</div>
          <p className="text-sm">You've completed the CLI onboarding</p>
        </div>
      )}

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-6 pt-6 border-t space-y-6">
          {/* Step Breakdown */}
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-3">Step Progress</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Completed</span>
                <span className="font-semibold text-green-600">{progress.completed.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Skipped</span>
                <span className="font-semibold text-gray-400">{progress.skipped.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Remaining</span>
                <span className="font-semibold text-vault-purple">
                  {getTotalSteps() - progress.completed.length - progress.skipped.length}
                </span>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center">
              <span>🏆 Achievements</span>
              <span className="ml-2 text-xs bg-vault-purple/10 text-vault-purple px-2 py-0.5 rounded-full">
                {progress.achievements.length} / {ACHIEVEMENT_BADGES.length}
              </span>
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              {ACHIEVEMENT_BADGES.map((badge) => {
                const earned = hasEarnedAchievement(badge.id)
                return (
                  <div
                    key={badge.id}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      earned
                        ? 'border-vault-purple bg-gradient-to-br from-vault-purple/5 to-vault-blue/5'
                        : 'border-gray-200 bg-gray-50 opacity-50'
                    }`}
                  >
                    <div className="text-2xl mb-1">{earned ? badge.icon : '🔒'}</div>
                    <div className="font-semibold text-xs mb-0.5">
                      {badge.title}
                    </div>
                    <p className="text-xs text-gray-600">{badge.description}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-3">Quick Actions</h4>
            <div className="space-y-2">
              <button
                onClick={onStartOnboarding}
                className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm transition-colors"
              >
                📖 View Onboarding Steps
              </button>
              <button
                onClick={() => {
                  if (confirm('Reset your onboarding progress?')) {
                    localStorage.removeItem(`vauntico_cli_onboarding_${roleId}`)
                    loadProgress()
                  }
                }}
                className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm transition-colors text-red-600"
              >
                🔄 Reset Progress
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Mini version for sidebar/header
export function OnboardingProgressMini({ roleId, onStartOnboarding }) {
  const [completionPercentage, setCompletionPercentage] = useState(0)

  useEffect(() => {
    const saved = localStorage.getItem(`vauntico_cli_onboarding_${roleId}`)
    if (saved) {
      const data = JSON.parse(saved)
      const stepCounts = {
        'solo-creator': 5,
        'agency': 7,
        'team-lead': 4
      }
      const total = stepCounts[roleId] || 5
      const completed = (data.completed || []).length
      setCompletionPercentage(Math.round((completed / total) * 100))
    }
  }, [roleId])

  if (completionPercentage === 100) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
        <span className="text-lg">✓</span>
        <span className="text-sm font-medium text-green-700">CLI Ready</span>
      </div>
    )
  }

  return (
    <button
      onClick={onStartOnboarding}
      className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-vault-purple/10 to-vault-blue/10 hover:from-vault-purple/20 hover:to-vault-blue/20 border-2 border-vault-purple/20 rounded-lg transition-all"
    >
      <div className="flex-1 text-left">
        <div className="text-xs font-semibold text-vault-purple mb-1">CLI Onboarding</div>
        <div className="w-full bg-white/50 rounded-full h-1.5">
          <div
            className="bg-vault-purple h-1.5 rounded-full transition-all"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>
      <div className="text-xs font-bold text-vault-purple">{completionPercentage}%</div>
    </button>
  )
}

export default OnboardingProgress
