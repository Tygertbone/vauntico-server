import { useState } from 'react'

export default function EarningsCalculator() {
  const [hoursPerDay, setHoursPerDay] = useState(1)
  const [daysPerWeek, setDaysPerWeek] = useState(5)
  const [currentFollowers, setCurrentFollowers] = useState(0)

  // Calculation logic based on R2K Challenge methodology
  const calculateEarnings = () => {
    // Base earnings multiplier (conservative estimate) - now unused but kept for reference
    // const baseMultiplier = 0.15 // R0.15 per follower per month (conservative)
    
    // Calculate projected followers after 60 days
    const weeklyGrowth = hoursPerDay * daysPerWeek * 20 // 20 followers per hour-day
    const totalGrowth = weeklyGrowth * 8 // 8 weeks
    const projectedFollowers = currentFollowers + totalGrowth

    // Calculate earnings from different streams
    const affiliateEarnings = Math.min(projectedFollowers * 0.08, 800) // Cap at R800
    const digitalProducts = Math.min(projectedFollowers * 0.05, 600) // Cap at R600
    const brandDeals = projectedFollowers >= 1000 ? 800 : 0 // Minimum 1K followers for brands
    const services = Math.min(projectedFollowers * 0.02, 400) // Cap at R400

    const totalMonthly = affiliateEarnings + digitalProducts + brandDeals + services
    const totalAnnual = totalMonthly * 12

    return {
      projectedFollowers: Math.round(projectedFollowers),
      affiliateEarnings: Math.round(affiliateEarnings),
      digitalProducts: Math.round(digitalProducts),
      brandDeals: Math.round(brandDeals),
      services: Math.round(services),
      totalMonthly: Math.round(totalMonthly),
      totalAnnual: Math.round(totalAnnual),
      achievesGoal: totalMonthly >= 2000
    }
  }

  const results = calculateEarnings()

  return (
    <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-green-900 text-white rounded-2xl p-8 shadow-2xl">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold mb-2">📊 Your Earnings Calculator</h3>
        <p className="text-purple-200">See how much YOU can make in 60 days</p>
      </div>

      {/* Input Section */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6 space-y-6">
        
        {/* Hours Per Day */}
        <div>
          <label htmlFor="hours-per-day" className="block text-sm font-semibold mb-3">
            How many hours per day can you dedicate? ⏰
          </label>
          <div className="flex items-center gap-4">
            <input
              id="hours-per-day"
              name="hoursPerDay"
              type="range"
              min="0.5"
              max="4"
              step="0.5"
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(parseFloat(e.target.value))}
              className="flex-1 h-3 bg-white/20 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
            <span className="bg-white/20 px-4 py-2 rounded-lg font-bold min-w-[80px] text-center">
              {hoursPerDay}h
            </span>
          </div>
          <p className="text-xs text-purple-200 mt-2">
            {hoursPerDay < 1 ? '⚡ Quick wins mode' : hoursPerDay <= 2 ? '🎯 Recommended pace' : '🚀 Fast track mode'}
          </p>
        </div>

        {/* Days Per Week */}
        <div>
          <label htmlFor="days-per-week" className="block text-sm font-semibold mb-3">
            How many days per week? 📅
          </label>
          <div className="flex items-center gap-4">
            <input
              id="days-per-week"
              name="daysPerWeek"
              type="range"
              min="3"
              max="7"
              step="1"
              value={daysPerWeek}
              onChange={(e) => setDaysPerWeek(parseInt(e.target.value))}
              className="flex-1 h-3 bg-white/20 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
            <span className="bg-white/20 px-4 py-2 rounded-lg font-bold min-w-[80px] text-center">
              {daysPerWeek} days
            </span>
          </div>
          <p className="text-xs text-purple-200 mt-2">
            {daysPerWeek < 5 ? '😊 Part-time hustle' : daysPerWeek <= 6 ? '💪 Committed creator' : '🔥 Beast mode activated'}
          </p>
        </div>

        {/* Current Followers */}
        <div>
          <label htmlFor="current-followers" className="block text-sm font-semibold mb-3">
            Current follower count? 👥
          </label>
          <input
            id="current-followers"
            name="currentFollowers"
            type="number"
            min="0"
            max="100000"
            value={currentFollowers}
            onChange={(e) => setCurrentFollowers(parseInt(e.target.value) || 0)}
            placeholder="Enter your current followers"
            className="w-full px-4 py-3 bg-white/20 rounded-lg text-white placeholder-white/50 border-2 border-white/30 focus:border-green-400 focus:outline-none"
          />
          <p className="text-xs text-purple-200 mt-2">
            {currentFollowers === 0 ? '🌱 Starting from scratch? Perfect!' : "🎉 Great start! We'll help you grow"}
          </p>
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-4">
        
        {/* Follower Projection */}
        <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-xl p-4 border border-cyan-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-cyan-300 mb-1">Projected Followers (60 days)</p>
              <p className="text-3xl font-bold">{results.projectedFollowers.toLocaleString()}</p>
            </div>
            <div className="text-5xl">📈</div>
          </div>
          <p className="text-xs text-cyan-200 mt-2">
            +{(results.projectedFollowers - currentFollowers).toLocaleString()} new followers
          </p>
        </div>

        {/* Income Breakdown */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 space-y-3">
          <p className="text-sm font-semibold text-purple-200 mb-2">Your Income Breakdown:</p>
          
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span>💰</span>
              <span>Affiliate Marketing</span>
            </span>
            <span className="font-bold">R{results.affiliateEarnings}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span>📦</span>
              <span>Digital Products</span>
            </span>
            <span className="font-bold">R{results.digitalProducts}</span>
          </div>

          {results.brandDeals > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <span>🤝</span>
                <span>Brand Partnerships</span>
              </span>
              <span className="font-bold">R{results.brandDeals}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span>🛠️</span>
              <span>Services/Freelance</span>
            </span>
            <span className="font-bold">R{results.services}</span>
          </div>

          <div className="border-t border-white/20 pt-3 mt-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-lg">Total Monthly Income</span>
              <span className="text-3xl font-bold text-green-400">
                R{results.totalMonthly.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="bg-green-500/20 rounded-lg p-3 border border-green-500/30">
            <div className="flex items-center justify-between">
              <span className="text-sm">Annual Projection</span>
              <span className="text-xl font-bold text-green-300">
                R{results.totalAnnual.toLocaleString()}/year
              </span>
            </div>
          </div>
        </div>

        {/* Goal Achievement */}
        {results.achievesGoal ? (
          <div className="bg-green-500/20 rounded-xl p-4 border-2 border-green-500/50 text-center">
            <div className="text-4xl mb-2">🎉</div>
            <p className="font-bold text-lg text-green-300 mb-1">
              You'll EXCEED the R2,000 goal!
            </p>
            <p className="text-sm text-green-200">
              By R{(results.totalMonthly - 2000).toLocaleString()} per month
            </p>
          </div>
        ) : (
          <div className="bg-yellow-500/20 rounded-xl p-4 border-2 border-yellow-500/50 text-center">
            <div className="text-4xl mb-2">💪</div>
            <p className="font-bold text-lg text-yellow-300 mb-1">
              Almost there! Add {Math.ceil((2000 - results.totalMonthly) / 100) * 0.5} more hours/week
            </p>
            <p className="text-sm text-yellow-200">
              Or boost your follower growth to hit R2,000
            </p>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="mt-6 text-center">
        <p className="text-xs text-purple-300 italic">
          *Estimates based on R2K Challenge methodology. Actual results vary based on niche, consistency, and market conditions.
        </p>
      </div>

      {/* CTA */}
      <div className="mt-6 text-center">
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault()
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          className="inline-block bg-white text-purple-600 hover:bg-gray-100 px-8 py-3 rounded-full font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          🚀 Start Your R{results.totalMonthly.toLocaleString()}/Month Journey
        </a>
      </div>
    </div>
  )
}
