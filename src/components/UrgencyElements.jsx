/**
 * Urgency & Scarcity Elements
 * 
 * Psychological triggers to increase conversions:
 * - Limited time offers
 * - Countdown timers
 * - Social proof notifications
 * - Spots remaining
 * - Price increase warnings
 */

import { useState, useEffect } from 'react'

/**
 * Countdown Timer - Creates urgency with time limit
 */
export const CountdownTimer = ({ 
  endDate, 
  title = "Limited Time Offer",
  ctaText = "Claim Your Spot",
  onCTA 
}) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(endDate))

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endDate))
    }, 1000)

    return () => clearInterval(timer)
  }, [endDate])

  function calculateTimeLeft(end) {
    const difference = new Date(end) - new Date()
    
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      expired: false
    }
  }

  if (timeLeft.expired) {
    return (
      <div className="card bg-gray-100 text-center py-6">
        <p className="text-gray-600 font-medium">Offer Expired</p>
        <p className="text-sm text-gray-500 mt-2">Check back soon for new offers!</p>
      </div>
    )
  }

  return (
    <div className="card bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200">
      <div className="text-center">
        <p className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-2">
          ⏰ {title}
        </p>
        
        <div className="flex justify-center gap-4 mb-4">
          <TimeUnit value={timeLeft.days} label="Days" />
          <TimeUnit value={timeLeft.hours} label="Hours" />
          <TimeUnit value={timeLeft.minutes} label="Mins" />
          <TimeUnit value={timeLeft.seconds} label="Secs" />
        </div>

        {onCTA && (
          <button onClick={onCTA} className="btn-primary w-full">
            {ctaText} →
          </button>
        )}
      </div>
    </div>
  )
}

const TimeUnit = ({ value, label }) => (
  <div className="text-center">
    <div className="bg-white rounded-lg px-4 py-3 shadow-md min-w-[60px]">
      <div className="text-3xl font-bold text-gray-900">
        {String(value).padStart(2, '0')}
      </div>
    </div>
    <div className="text-xs text-gray-600 mt-1 font-medium">{label}</div>
  </div>
)

/**
 * Spots Remaining - Creates scarcity with limited availability
 */
export const SpotsRemaining = ({ 
  totalSpots = 100,
  spotsLeft = 23,
  tierName = "Pro",
  showBar = true 
}) => {
  const percentageFilled = ((totalSpots - spotsLeft) / totalSpots) * 100
  
  const getUrgencyColor = () => {
    if (spotsLeft <= 10) return 'red'
    if (spotsLeft <= 30) return 'orange'
    return 'yellow'
  }

  const urgencyColor = getUrgencyColor()
  const colorClasses = {
    red: 'text-red-600 bg-red-50 border-red-200',
    orange: 'text-orange-600 bg-orange-50 border-orange-200',
    yellow: 'text-yellow-600 bg-yellow-50 border-yellow-200'
  }

  return (
    <div className={`card ${colorClasses[urgencyColor]} border-2`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          <div>
            <p className="font-bold text-lg">Only {spotsLeft} Spots Left!</p>
            <p className="text-sm">in {tierName} tier this month</p>
          </div>
        </div>
      </div>

      {showBar && (
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ${
              urgencyColor === 'red' ? 'bg-red-500' :
              urgencyColor === 'orange' ? 'bg-orange-500' :
              'bg-yellow-500'
            }`}
            style={{ width: `${percentageFilled}%` }}
          />
        </div>
      )}
      
      <p className="text-xs mt-2 font-medium">
        {totalSpots - spotsLeft} creators joined this month
      </p>
    </div>
  )
}

/**
 * Price Increase Warning - Creates urgency with upcoming price change
 */
export const PriceIncreaseWarning = ({ 
  currentPrice = 59,
  newPrice = 79,
  increaseDate = "February 1st",
  currency = "$"
}) => {
  const savings = newPrice - currentPrice

  return (
    <div className="card bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
      <div className="flex items-start gap-3">
        <div className="text-3xl">⚠️</div>
        <div className="flex-1">
          <p className="font-bold text-lg text-purple-900 mb-1">
            Price Increasing Soon!
          </p>
          <p className="text-gray-700 mb-3">
            Lock in <strong>{currency}{currentPrice}/month</strong> before {increaseDate}.
            <br />
            Price increases to <strong className="text-red-600">{currency}{newPrice}/month</strong> after.
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
              Save {currency}{savings}/month
            </span>
            <span className="text-gray-600">by joining today</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Live User Activity - Social proof with recent actions
 */
export const LiveUserActivity = ({ recentActivity }) => {
  const [currentActivity, setCurrentActivity] = useState(0)

  useEffect(() => {
    if (!recentActivity || recentActivity.length === 0) return

    const interval = setInterval(() => {
      setCurrentActivity((prev) => (prev + 1) % recentActivity.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [recentActivity])

  if (!recentActivity || recentActivity.length === 0) return null

  const activity = recentActivity[currentActivity]

  return (
    <div className="card bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 animate-slide-up">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-br from-vault-purple to-vault-blue rounded-full flex items-center justify-center text-xl">
            {activity.avatar || '👤'}
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900">
            {activity.user || 'Someone'} just {activity.action}
          </p>
          <p className="text-sm text-gray-600">{activity.time || '2 minutes ago'}</p>
        </div>
        <div className="text-2xl">✨</div>
      </div>
    </div>
  )
}

/**
 * Money-Back Guarantee Badge
 */
export const GuaranteeBadge = ({ days = 14 }) => {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border-2 border-green-200 rounded-lg">
      <span className="text-2xl">💚</span>
      <div>
        <p className="font-bold text-green-800 text-sm">{days}-Day Money-Back Guarantee</p>
        <p className="text-xs text-green-700">No questions asked</p>
      </div>
    </div>
  )
}

/**
 * Discount Banner - Shows limited-time discount
 */
export const DiscountBanner = ({
  discount = 20,
  code = "LAUNCH20",
  expiresIn = "24 hours"
}) => {
  return (
    <div className="card bg-gradient-to-r from-yellow-400 to-orange-400 text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🎉</span>
          <div>
            <p className="font-bold text-lg">Save {discount}% Today!</p>
            <p className="text-sm opacity-90">Use code: <strong className="font-mono bg-white/20 px-2 py-0.5 rounded">{code}</strong></p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm opacity-90">Expires in</p>
          <p className="font-bold text-lg">{expiresIn}</p>
        </div>
      </div>
    </div>
  )
}

/**
 * Trust Indicators - Combined trust elements
 */
export const TrustIndicators = () => {
  return (
    <div className="flex flex-wrap justify-center items-center gap-6 py-6">
      <div className="flex items-center gap-2 text-gray-700">
        <span className="text-green-500 text-2xl">✓</span>
        <span className="font-medium">SSL Secured</span>
      </div>
      <div className="flex items-center gap-2 text-gray-700">
        <span className="text-green-500 text-2xl">✓</span>
        <span className="font-medium">14-Day Guarantee</span>
      </div>
      <div className="flex items-center gap-2 text-gray-700">
        <span className="text-green-500 text-2xl">✓</span>
        <span className="font-medium">Cancel Anytime</span>
      </div>
      <div className="flex items-center gap-2 text-gray-700">
        <span className="text-green-500 text-2xl">✓</span>
        <span className="font-medium">2,500+ Users</span>
      </div>
    </div>
  )
}

/**
 * Urgency Stack - Combines multiple urgency elements
 */
export const UrgencyStack = ({ tier = "Pro" }) => {
  // Calculate dynamic end date (e.g., end of month)
  const endOfMonth = new Date()
  endOfMonth.setMonth(endOfMonth.getMonth() + 1)
  endOfMonth.setDate(0)
  endOfMonth.setHours(23, 59, 59)

  const recentActivity = [
    { user: 'Sarah from NYC', action: 'upgraded to Pro', time: '2 min ago', avatar: '👩‍💼' },
    { user: 'Marcus from London', action: 'joined Legacy', time: '5 min ago', avatar: '👨‍💻' },
    { user: 'Zara from Mumbai', action: 'started Pro trial', time: '8 min ago', avatar: '👩‍🏫' },
  ]

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <SpotsRemaining spotsLeft={23} tierName={tier} />
      <LiveUserActivity recentActivity={recentActivity} />
      <PriceIncreaseWarning />
    </div>
  )
}

export default {
  CountdownTimer,
  SpotsRemaining,
  PriceIncreaseWarning,
  LiveUserActivity,
  GuaranteeBadge,
  DiscountBanner,
  TrustIndicators,
  UrgencyStack
}
