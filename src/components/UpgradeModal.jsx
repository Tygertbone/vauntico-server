import { useState } from 'react'
import { PRICING, formatPrice, getUserCurrency, getLocalizedPrice } from '../utils/pricing'

/**
 * Upgrade Modal Component
 * Tier-based modal with CTA for locked scrolls
 */
function UpgradeModal({ scroll, currentTier = 'free', onClose, onUpgrade }) {
  const [selectedTier, setSelectedTier] = useState(null)
  const userCurrency = getUserCurrency()

  const getTierForScroll = (scrollTier) => {
    // Map scroll tier to Creator Pass tier
    const tierMapping = {
      'free': null,
      'starter': 'starter',
      'pro': 'pro',
      'legacy': 'legacy'
    }
    return tierMapping[scrollTier]
  }

  const requiredTier = getTierForScroll(scroll.tier)
  const tiers = PRICING.CREATOR_PASS.tiers

  // Only show tiers that unlock this scroll
  const tierHierarchy = { 'starter': 1, 'pro': 2, 'legacy': 3 }
  const scrollTierLevel = tierHierarchy[scroll.tier] || 0
  
  const availableTiers = Object.entries(tiers)
    .filter(([key]) => tierHierarchy[key] >= scrollTierLevel)
    .map(([key, tier]) => ({ ...tier, key }))

  const handleUpgrade = (tierKey) => {
    onUpgrade && onUpgrade(tierKey)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-vault-purple to-vault-blue p-8 text-white rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
          
          <div className="flex items-start space-x-4">
            <div className="text-6xl">{scroll.icon}</div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">{scroll.title}</h2>
              <p className="text-white/90 mb-4">{scroll.description}</p>
              
              <div className="flex items-center space-x-3">
                <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur rounded-lg">
                  <span className="text-2xl mr-2">🔒</span>
                  <div className="text-left">
                    <div className="text-xs opacity-80">Requires</div>
                    <div className="font-bold capitalize">{scroll.tier} Tier</div>
                  </div>
                </div>
                
                <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur rounded-lg">
                  <span className="text-2xl mr-2">⏱️</span>
                  <div className="text-left">
                    <div className="text-xs opacity-80">Read Time</div>
                    <div className="font-bold">{scroll.readTime}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tier Comparison */}
        <div className="p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">Choose Your Tier</h3>
            <p className="text-gray-600">
              Upgrade to unlock this scroll and access exclusive Creator Pass benefits
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {availableTiers.map((tier) => {
              const pricing = getLocalizedPrice({ 
                price: tier.price, 
                localizedPrices: tier.localizedPrices 
              })
              const isPopular = tier.popular
              const isSelected = selectedTier === tier.key

              return (
                <div
                  key={tier.key}
                  onClick={() => setSelectedTier(tier.key)}
                  className={`relative card cursor-pointer transition-all transform hover:scale-105 ${
                    isSelected ? 'ring-4 ring-vault-purple shadow-2xl' : 'hover:shadow-xl'
                  } ${isPopular ? 'border-4 border-vault-purple' : 'border-2'}`}
                >
                  {/* Popular Badge */}
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                        ⭐ MOST POPULAR
                      </div>
                    </div>
                  )}

                  {/* Tier Header */}
                  <div className="text-center mb-6">
                    <div className="text-5xl mb-3">{tier.icon}</div>
                    <h4 className="text-xl font-bold mb-2">{tier.name.split(':')[0]}</h4>
                    <p className="text-sm text-gray-600 mb-4">{tier.description}</p>
                    
                    {/* Pricing */}
                    <div className="mb-4">
                      <div className="text-4xl font-bold text-gradient mb-1">
                        {pricing.formatted}
                      </div>
                      <div className="text-sm text-gray-500">per {tier.period}</div>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 mb-6 text-sm">
                    {tier.features.slice(0, 4).map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-green-500 mr-2 mt-0.5 flex-shrink-0">✓</span>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                    {tier.features.length > 4 && (
                      <li className="text-gray-500 text-xs italic">
                        + {tier.features.length - 4} more features
                      </li>
                    )}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleUpgrade(tier.key)
                    }}
                    className={`w-full py-3 rounded-lg font-bold transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-vault-purple to-vault-blue text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {isSelected ? '✓ Selected' : 'Select Plan'}
                  </button>
                </div>
              )
            })}
          </div>

          {/* Continue Button */}
          {selectedTier && (
            <div className="mt-8 text-center animate-slide-up">
              <button
                onClick={() => handleUpgrade(selectedTier)}
                className="btn-primary px-12 py-4 text-lg"
              >
                Upgrade to {tiers[selectedTier].name.split(':')[0]} →
              </button>
              <p className="text-sm text-gray-500 mt-3">
                30-day money-back guarantee • Cancel anytime
              </p>
            </div>
          )}

          {/* FAQ Section */}
          <div className="mt-12 pt-8 border-t">
            <h4 className="font-bold text-lg mb-4 text-center">Why Upgrade?</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-3xl mb-2">🔓</div>
                <div className="font-semibold mb-1">Unlock All Scrolls</div>
                <p className="text-gray-600">Access the complete Lore Vault library</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">⚡</div>
                <div className="font-semibold mb-1">CLI Power Tools</div>
                <p className="text-gray-600">Advanced automation & agency commands</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🎯</div>
                <div className="font-semibold mb-1">Priority Support</div>
                <p className="text-gray-600">Fast responses & dedicated assistance</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Quick Upgrade Prompt
 * Compact version for inline use
 */
export function QuickUpgradePrompt({ onUpgrade, minimal = false }) {
  if (minimal) {
    return (
      <button
        onClick={onUpgrade}
        className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-vault-purple to-vault-blue text-white rounded-lg font-semibold hover:shadow-lg transition-all"
      >
        <span>🔓</span>
        <span>Upgrade</span>
      </button>
    )
  }

  return (
    <div className="card bg-gradient-to-br from-vault-purple/10 to-vault-blue/10 border-2 border-vault-purple/30">
      <div className="flex items-center space-x-4">
        <div className="text-4xl">🔒</div>
        <div className="flex-1">
          <h4 className="font-bold text-lg mb-1">Premium Content</h4>
          <p className="text-sm text-gray-600 mb-3">
            This scroll requires Creator Pass to unlock
          </p>
          <button onClick={onUpgrade} className="btn-primary text-sm">
            View Upgrade Options →
          </button>
        </div>
      </div>
    </div>
  )
}

export default UpgradeModal
