import { useState, useEffect } from 'react'
import { getCreatorPassTier, PRICING } from '../utils/pricing'

/**
 * Credit Tracker Component
 * Visualizes remaining credits and usage meter
 */
function CreditTracker({ compact = false, showDetails = true }) {
  const [credits, setCredits] = useState({
    used: 0,
    total: 500,
    remaining: 500,
    rollover: 0,
    resetDate: null
  })

  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    loadCreditData()
  }, [])

  const loadCreditData = () => {
    // Load from localStorage or API
    const savedCredits = localStorage.getItem('vauntico_credits')
    const tierData = getCreatorPassTier()

    if (savedCredits) {
      setCredits(JSON.parse(savedCredits))
    } else if (tierData) {
      // Set default credits based on tier
      const tierCredits = {
        'starter': 500,
        'pro': 2500,
        'legacy': 10000
      }
      
      const total = tierCredits[tierData.tier] || 500
      setCredits({
        used: 0,
        total: total,
        remaining: total,
        rollover: 0,
        resetDate: getNextResetDate()
      })
    }
  }

  const getNextResetDate = () => {
    const now = new Date()
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    return nextMonth.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getUsagePercentage = () => {
    return Math.round((credits.used / credits.total) * 100)
  }

  const getStatusColor = () => {
    const percentage = getUsagePercentage()
    if (percentage >= 90) return 'text-red-600'
    if (percentage >= 70) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getProgressBarColor = () => {
    const percentage = getUsagePercentage()
    if (percentage >= 90) return 'from-red-500 to-red-600'
    if (percentage >= 70) return 'from-yellow-500 to-orange-500'
    return 'from-green-500 to-emerald-500'
  }

  const getStatusIcon = () => {
    const percentage = getUsagePercentage()
    if (percentage >= 90) return '⚠️'
    if (percentage >= 70) return '⏰'
    return '✓'
  }

  const getStatusMessage = () => {
    const percentage = getUsagePercentage()
    if (percentage >= 90) return 'Low credits - consider upgrading'
    if (percentage >= 70) return 'Credits running low'
    return 'Healthy credit balance'
  }

  if (compact) {
    return (
      <div className="flex items-center space-x-3 px-4 py-2 bg-white rounded-lg border-2 border-gray-200">
        <div className="text-2xl">{getStatusIcon()}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-gray-700">Credits</span>
            <span className={`font-bold ${getStatusColor()}`}>
              {credits.remaining.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`bg-gradient-to-r ${getProgressBarColor()} h-2 rounded-full transition-all duration-500`}
              style={{ width: `${100 - getUsagePercentage()}%` }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card border-2 border-gray-200 hover:border-vault-purple/30 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <div className="text-3xl">{getStatusIcon()}</div>
            <div>
              <h3 className="text-lg font-bold">Credit Balance</h3>
              <p className="text-sm text-gray-600">{getStatusMessage()}</p>
            </div>
          </div>
        </div>

        {showDetails && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {isExpanded ? '▲' : '▼'}
          </button>
        )}
      </div>

      {/* Credit Display */}
      <div className="mb-6">
        <div className="flex items-baseline justify-between mb-2">
          <div>
            <span className="text-4xl font-bold text-gradient">
              {credits.remaining.toLocaleString()}
            </span>
            <span className="text-gray-500 text-lg ml-2">
              / {credits.total.toLocaleString()}
            </span>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-400">
              {getUsagePercentage()}%
            </div>
            <div className="text-xs text-gray-500">remaining</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className={`bg-gradient-to-r ${getProgressBarColor()} h-4 rounded-full transition-all duration-500 relative overflow-hidden`}
              style={{ width: `${100 - getUsagePercentage()}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-3 gap-4 text-center text-sm mb-4">
        <div>
          <div className="text-gray-500 mb-1">Used</div>
          <div className="font-bold text-gray-700">{credits.used.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-gray-500 mb-1">Remaining</div>
          <div className={`font-bold ${getStatusColor()}`}>
            {credits.remaining.toLocaleString()}
          </div>
        </div>
        <div>
          <div className="text-gray-500 mb-1">Rollover</div>
          <div className="font-bold text-vault-purple">{credits.rollover.toLocaleString()}</div>
        </div>
      </div>

      {/* Reset Date */}
      {credits.resetDate && (
        <div className="flex items-center justify-between text-sm py-3 px-4 bg-gray-50 rounded-lg">
          <span className="text-gray-600">Credits reset on:</span>
          <span className="font-semibold text-gray-800">{credits.resetDate}</span>
        </div>
      )}

      {/* Expanded Details */}
      {isExpanded && showDetails && (
        <div className="mt-6 pt-6 border-t space-y-4 animate-slide-down">
          {/* Credit History */}
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-3">Recent Activity</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                <span className="text-gray-600">Landing Page Generation</span>
                <span className="font-semibold text-red-600">-50</span>
              </div>
              <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                <span className="text-gray-600">Workshop Kit Access</span>
                <span className="font-semibold text-red-600">-25</span>
              </div>
              <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                <span className="text-gray-600">Audit Service Run</span>
                <span className="font-semibold text-red-600">-100</span>
              </div>
            </div>
          </div>

          {/* Upgrade Prompt */}
          <div className="bg-gradient-to-br from-vault-purple/10 to-vault-blue/10 p-4 rounded-lg border border-vault-purple/20">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">💎</div>
              <div className="flex-1">
                <div className="font-semibold mb-1">Need More Credits?</div>
                <p className="text-xs text-gray-600 mb-3">
                  Upgrade your tier to get more monthly credits and rollover benefits
                </p>
                <a href="/creator-pass" className="text-sm font-semibold text-vault-purple hover:underline">
                  View Upgrade Options →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Credit Badge - Mini version for headers/sidebars
 */
export function CreditBadge({ showLabel = true }) {
  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    const savedCredits = localStorage.getItem('vauntico_credits')
    if (savedCredits) {
      const { remaining } = JSON.parse(savedCredits)
      setRemaining(remaining)
    }
  }, [])

  return (
    <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-vault-purple/10 to-vault-blue/10 border border-vault-purple/30 rounded-full">
      <span className="text-lg">⚡</span>
      {showLabel && <span className="text-xs font-medium text-gray-600">Credits:</span>}
      <span className="text-sm font-bold text-vault-purple">
        {remaining.toLocaleString()}
      </span>
    </div>
  )
}

/**
 * Credit usage indicator for individual actions
 */
export function CreditCost({ cost, action }) {
  return (
    <div className="inline-flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded text-xs">
      <span className="text-gray-500">{action}:</span>
      <span className="font-semibold text-gray-700">{cost}</span>
      <span>⚡</span>
    </div>
  )
}

export default CreditTracker
