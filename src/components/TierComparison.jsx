import { useState, useEffect } from 'react'
import { PRICING, getLocalizedPrice, getUserCurrency, formatPrice } from '../utils/pricing'

/**
 * Tier Comparison Calculator
 * Interactive comparison of Starter vs Pro vs Legacy tiers
 */
function TierComparison({ currentTier = 'free', onSelectTier }) {
  const [billingCycle, setBillingCycle] = useState('monthly') // monthly or yearly
  const [comparisonMode, setComparisonMode] = useState('features') // features, savings, value
  const userCurrency = getUserCurrency()

  const tiers = PRICING.CREATOR_PASS.tiers
  const tierOrder = ['starter', 'pro', 'legacy']

  const getPrice = (tier, cycle) => {
    const priceKey = cycle === 'yearly' ? 'yearlyPrice' : 'price'
    const localizedKey = cycle === 'yearly' ? 'localizedYearlyPrices' : 'localizedPrices'
    
    return getLocalizedPrice({
      price: tier[priceKey],
      localizedPrices: tier[localizedKey]
    })
  }

  const calculateYearlySavings = (tier) => {
    const monthlyPrice = getPrice(tier, 'monthly')
    const yearlyPrice = getPrice(tier, 'yearly')
    
    const monthlyTotal = monthlyPrice.price * 12
    const savings = monthlyTotal - yearlyPrice.price
    const savingsPercent = Math.round((savings / monthlyTotal) * 100)
    
    return {
      savings,
      savingsPercent,
      monthlyTotal,
      yearlyTotal: yearlyPrice.price
    }
  }

  const getTierFeaturesByCategory = (tier) => {
    const categories = {
      credits: [],
      features: [],
      support: [],
      special: []
    }

    tier.features.forEach(feature => {
      const lower = feature.toLowerCase()
      if (lower.includes('credit')) categories.credits.push(feature)
      else if (lower.includes('support') || lower.includes('response')) categories.support.push(feature)
      else if (lower.includes('white-label') || lower.includes('api') || lower.includes('affiliate')) categories.special.push(feature)
      else categories.features.push(feature)
    })

    return categories
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-3">
          Choose Your <span className="text-gradient">Creator Tier</span>
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-6">
          Compare tiers to find the perfect fit for your creative empire
        </p>

        {/* Billing Toggle */}
        <div className="inline-flex items-center space-x-2 p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              billingCycle === 'monthly'
                ? 'bg-white text-vault-purple shadow-md'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-2 rounded-lg font-medium transition-all relative ${
              billingCycle === 'yearly'
                ? 'bg-white text-vault-purple shadow-md'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Yearly
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
              Save 16%
            </span>
          </button>
        </div>
      </div>

      {/* Comparison Mode Selector */}
      <div className="flex justify-center space-x-3">
        {[
          { id: 'features', label: 'Features', icon: '📋' },
          { id: 'savings', label: 'Savings', icon: '💰' },
          { id: 'value', label: 'Value Score', icon: '⭐' }
        ].map(mode => (
          <button
            key={mode.id}
            onClick={() => setComparisonMode(mode.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
              comparisonMode === mode.id
                ? 'bg-vault-purple text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>{mode.icon}</span>
            <span>{mode.label}</span>
          </button>
        ))}
      </div>

      {/* Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tierOrder.map((tierKey) => {
          const tier = tiers[tierKey]
          const pricing = getPrice(tier, billingCycle)
          const savings = billingCycle === 'yearly' ? calculateYearlySavings(tier) : null
          const isPopular = tier.popular
          const isCurrent = currentTier === tierKey

          return (
            <div
              key={tierKey}
              className={`relative card transition-all transform hover:scale-105 ${
                isPopular ? 'border-4 border-vault-purple shadow-2xl' : 'border-2 border-gray-200'
              } ${isCurrent ? 'ring-4 ring-green-500' : ''}`}
            >
              {/* Current Tier Badge */}
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-green-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                    ✓ YOUR PLAN
                  </div>
                </div>
              )}

              {/* Popular Badge */}
              {isPopular && !isCurrent && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                    ⭐ MOST POPULAR
                  </div>
                </div>
              )}

              {/* Tier Header */}
              <div className="text-center mb-6">
                <div className="text-5xl mb-3">{tier.icon}</div>
                <h3 className="text-2xl font-bold mb-1">
                  {tier.name.split(':')[0]}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {tier.name.split(':')[1]}
                </p>

                {/* Pricing */}
                <div>
                  <div className="text-5xl font-bold text-gradient mb-2">
                    {pricing.formatted}
                  </div>
                  <div className="text-sm text-gray-500">
                    per {billingCycle === 'yearly' ? 'year' : 'month'}
                  </div>
                  {billingCycle === 'yearly' && savings && (
                    <div className="mt-2 text-sm text-green-600 font-semibold">
                      Save {formatPrice(savings.savings, pricing.currency)} ({savings.savingsPercent}%)
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 text-center mb-6 italic">
                {tier.description}
              </p>

              {/* Features based on comparison mode */}
              {comparisonMode === 'features' && (
                <div className="space-y-3 mb-6">
                  <h4 className="font-semibold text-sm text-gray-700 mb-3">What's Included:</h4>
                  <ul className="space-y-2 text-sm">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-green-500 mr-2 mt-0.5 flex-shrink-0">✓</span>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {comparisonMode === 'savings' && savings && (
                <div className="space-y-3 mb-6">
                  <h4 className="font-semibold text-sm text-gray-700 mb-3">Annual Savings:</h4>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      {formatPrice(savings.savings, pricing.currency)}
                    </div>
                    <div className="text-xs text-gray-600">saved per year</div>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div className="flex justify-between">
                      <span>Monthly × 12:</span>
                      <span>{formatPrice(savings.monthlyTotal, pricing.currency)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-green-600">
                      <span>Yearly price:</span>
                      <span>{formatPrice(savings.yearlyTotal, pricing.currency)}</span>
                    </div>
                  </div>
                </div>
              )}

              {comparisonMode === 'value' && (
                <div className="space-y-3 mb-6">
                  <h4 className="font-semibold text-sm text-gray-700 mb-3">Best For:</h4>
                  <ul className="space-y-2 text-sm">
                    {tier.idealFor?.map((use, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-vault-purple mr-2 mt-0.5 flex-shrink-0">→</span>
                        <span className="text-gray-700">{use}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 pt-4 border-t">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gradient mb-1">
                        {tier.features.length}
                      </div>
                      <div className="text-xs text-gray-500">features included</div>
                    </div>
                  </div>
                </div>
              )}

              {/* CTA Button */}
              <button
                onClick={() => onSelectTier && onSelectTier(tierKey, billingCycle)}
                className={`w-full py-3 rounded-lg font-bold transition-all ${
                  isCurrent
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : isPopular
                    ? 'bg-gradient-to-r from-vault-purple to-vault-blue text-white hover:shadow-xl'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
                disabled={isCurrent}
              >
                {isCurrent ? 'Current Plan' : `Select ${tier.name.split(':')[0]}`}
              </button>
            </div>
          )
        })}
      </div>

      {/* Detailed Feature Comparison Table */}
      <div className="card">
        <h3 className="text-xl font-bold mb-6 text-center">Detailed Feature Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Feature</th>
                {tierOrder.map(tierKey => (
                  <th key={tierKey} className="text-center py-3 px-4 font-semibold text-gray-700">
                    {tiers[tierKey].icon} {tiers[tierKey].name.split(':')[0]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Credits */}
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-medium">Monthly Credits</td>
                <td className="text-center py-3 px-4">500</td>
                <td className="text-center py-3 px-4 bg-vault-purple/5">2,500</td>
                <td className="text-center py-3 px-4">10,000</td>
              </tr>
              
              {/* CLI Access */}
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-medium">CLI Access</td>
                <td className="text-center py-3 px-4">Core commands</td>
                <td className="text-center py-3 px-4 bg-vault-purple/5">Full suite</td>
                <td className="text-center py-3 px-4">Full suite + API</td>
              </tr>

              {/* Support */}
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-medium">Support Response</td>
                <td className="text-center py-3 px-4">48 hours</td>
                <td className="text-center py-3 px-4 bg-vault-purple/5">12 hours</td>
                <td className="text-center py-3 px-4">White-glove</td>
              </tr>

              {/* Special Features */}
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-medium">White-label Rights</td>
                <td className="text-center py-3 px-4 text-gray-400">—</td>
                <td className="text-center py-3 px-4 bg-vault-purple/5 text-green-500">✓</td>
                <td className="text-center py-3 px-4 text-green-500">✓</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div className="card bg-gradient-to-br from-gray-50 to-white">
        <h3 className="text-xl font-bold mb-6 text-center">Common Questions</h3>
        <div className="space-y-4">
          <details className="group">
            <summary className="font-semibold cursor-pointer hover:text-vault-purple">
              Can I change my tier later?
            </summary>
            <p className="text-sm text-gray-600 mt-2 pl-4">
              Yes! You can upgrade or downgrade anytime. Upgrades take effect immediately, downgrades at next billing cycle.
            </p>
          </details>
          <details className="group">
            <summary className="font-semibold cursor-pointer hover:text-vault-purple">
              Do unused credits roll over?
            </summary>
            <p className="text-sm text-gray-600 mt-2 pl-4">
              Pro tier: up to 1,000 credits roll over. Legacy tier: unlimited rollover.
            </p>
          </details>
          <details className="group">
            <summary className="font-semibold cursor-pointer hover:text-vault-purple">
              What's the refund policy?
            </summary>
            <p className="text-sm text-gray-600 mt-2 pl-4">
              30-day money-back guarantee on all plans. No questions asked.
            </p>
          </details>
        </div>
      </div>
    </div>
  )
}

export default TierComparison
