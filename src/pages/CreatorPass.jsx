import { useState, useMemo } from 'react'
import SEO from '../components/SEO'
import StructuredData from '../components/StructuredData'
import { useCreatorPass } from '../hooks/useAccess'
import { subscribeToCreatorPassTier, PRICING, getLocalizedPrice, getApproximatePrice } from '../utils/pricing'
import { AccessBadge } from '../components/AccessGate'
import LoadingSpinner from '../components/LoadingSpinner'
import Testimonials from '../components/Testimonials'
import { TrustBadges, MoneyBackGuarantee, ReviewStars } from '../components/SocialProof'
import { CreatorPassCTA } from '../components/MobileStickyCTA'
import { checkoutCreatorPass as paystackCheckout, mockPaystackCheckout, isPaystackConfigured } from '../utils/paystack'
import { UrgencyStack, PriceIncreaseWarning } from '../components/UrgencyElements'

function CreatorPass() {
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [selectedTier, setSelectedTier] = useState('pro')
  const [billingCycle, setBillingCycle] = useState('monthly')
  const { hasPass, isLoading } = useCreatorPass()
  
    // Get tier-based pricing
  const tiers = PRICING.CREATOR_PASS.tiers
  
    const getPriceForTier = (tier, cycle) => {
    const tierData = tiers[tier]
    if (!tierData) {
      console.error(`Invalid tier: ${tier}`)
      return { price: 0, currency: 'ZAR', formatted: 'R0', symbol: 'R' }
    }
    
    const priceKey = cycle === 'yearly' ? 'yearlyPrice' : 'price'
    const localizedKey = cycle === 'yearly' ? 'localizedYearlyPrices' : 'localizedPrices'
    
    const userCurrency = localStorage.getItem('vauntico_locale') || 'ZAR'
    
    // Safe access with fallbacks
    const localizedPrices = tierData[localizedKey] || {}
    const price = localizedPrices[userCurrency] || tierData[priceKey] || 0
    const symbol = userCurrency === 'ZAR' ? 'R' : '$'
    
    return {
      price,
      currency: userCurrency,
      formatted: `${symbol}${price.toLocaleString()}`,
      symbol
    }
  }
  
    const getApproxForTier = (tier, cycle) => {
    const priceData = getPriceForTier(tier, cycle)
    if (!priceData || priceData.price === 0) return null
    
    try {
      if (priceData.currency === 'ZAR') {
        return getApproximatePrice(priceData.price, 'ZAR', 'USD')
      } else {
        return getApproximatePrice(priceData.price, 'USD', 'ZAR')
      }
    } catch (error) {
      console.error('Error getting approximate price:', error)
      return null
    }
  }

            const handleSubscribe = async (tier) => {
    setIsSubscribing(true)
    setSelectedTier(tier)
    
    try {
      // Get user email (you can add email input field or get from auth)
      const userEmail = localStorage.getItem('user_email') || 'customer@vauntico.com'
      
      // Check if Paystack is configured
      if (isPaystackConfigured()) {
        // Real Paystack checkout
        console.log('🇿🇦 Opening Paystack payment modal...')
        await paystackCheckout(tier, billingCycle, userEmail)
      } else {
        // Mock checkout for development/testing
        console.warn('⚠️  Paystack not configured - using mock checkout')
        await mockPaystackCheckout(tier, billingCycle)
      }
    } catch (error) {
      console.error('Subscription error:', error)
      alert('Subscription failed. Please try again.')
      setIsSubscribing(false)
    }
  }

    const upgradePath = [
    {
      icon: '🧪',
      title: 'Ascend Anytime',
      description: 'Your credits, scrolls, and vault access scale with you'
    },
    {
      icon: '🔄',
      title: 'Prorated Credits',
      description: 'Credits rolled over and preserved during upgrades'
    },
    {
      icon: '⚡',
      title: 'Instant Access',
      description: 'Scroll access expands immediately upon ascension'
    },
    {
      icon: '🎖️',
      title: 'Support Scales',
      description: 'Your support tier adjusts automatically'
    },
  ]

            return (
    <>
      <SEO 
        title="Creator Pass - Unlock the Vault | Vauntico"
        description="Choose your covenant: Starter, Pro, or Legacy tiers. Scale your creative output with AI-powered tools, unlimited vaults, and priority support. From R299/month."
        canonical="/creator-pass"
      />
      <StructuredData 
        type="Product"
        data={{
          name: 'Vauntico Creator Pass',
          description: 'AI-powered content creation platform with three tiers: Starter, Pro, and Legacy',
          offers: [
            {
              '@type': 'Offer',
              name: 'Starter',
              price: getPriceForTier('starter', 'monthly').price.toString(),
              priceCurrency: getPriceForTier('starter', 'monthly').currency,
              availability: 'https://schema.org/InStock'
            },
            {
              '@type': 'Offer',
              name: 'Pro',
              price: getPriceForTier('pro', 'monthly').price.toString(),
              priceCurrency: getPriceForTier('pro', 'monthly').currency,
              availability: 'https://schema.org/InStock'
            },
            {
              '@type': 'Offer',
              name: 'Legacy',
              price: getPriceForTier('legacy', 'monthly').price.toString(),
              priceCurrency: getPriceForTier('legacy', 'monthly').currency,
              availability: 'https://schema.org/InStock'
            }
          ]
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="inline-block vault-gradient text-white px-4 py-2 rounded-full text-sm font-semibold mb-4 tracking-wide">
          THE CREATOR PASS SCROLL
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-4">
          Unlock the Vault. Ascend the Tiers.<br/>
          <span className="text-gradient">Scale Your Legacy.</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
          Most platforms sell subscriptions. Vauntico offers <strong>ascension</strong>.<br/>
          The Creator Pass isn't just access—it's a <strong>covenant</strong>.
        </p>
        <div className="flex justify-center mb-6">
          <ReviewStars rating={4.8} reviewCount={350} />
        </div>
        {hasPass && (
          <div className="mb-6">
            <AccessBadge hasAccess={hasPass} reason="creator_pass" />
          </div>
        )}
        <div className="flex justify-center">
          <MoneyBackGuarantee days={14} />
        </div>
      </div>
      
      {/* Billing Toggle */}
      <div className="flex justify-center mb-12">
        <div className="inline-flex items-center bg-gray-100 rounded-full p-1">
          <button 
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              billingCycle === 'monthly' 
                ? 'bg-white shadow-sm text-vault-purple' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Monthly
          </button>
          <button 
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              billingCycle === 'yearly' 
                ? 'bg-white shadow-sm text-vault-purple' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Yearly <span className="text-green-600 text-sm ml-1">(Save 17%)</span>
          </button>
        </div>
      </div>

                        {/* Urgency Elements - Above pricing */}
      <div className="mb-12">
        <UrgencyStack tier="Pro" />
      </div>

      {/* Social Proof - Testimonials */}
      <div className="mb-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Join 2,500+ Creators Scaling Their Legacy</h2>
          <p className="text-gray-600">See what they're saying about their ascension</p>
        </div>
        <Testimonials variant="grid" limit={3} />
      </div>

      {/* Three Covenant Tiers */}
      <div className="mb-16">
        <h2 className="text-4xl font-bold text-center mb-4">
          The Three <span className="text-gradient">Covenants</span>
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          A tiered gateway to tools, rituals, and revenue systems that scale with your soul.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Starter Tier */}
          <div className="card hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-gray-300">
            <div className="text-center mb-4">
              <div className="text-5xl mb-3">{tiers.starter.icon}</div>
              <h3 className="text-xl font-bold mb-1">Starter</h3>
              <p className="text-sm text-gray-500 mb-4">The Apprentice Forge</p>
              <div className="flex flex-col items-center mb-3">
                <div className="flex items-end justify-center">
                  <span className="text-4xl font-bold text-vault-purple">
                    {getPriceForTier('starter', billingCycle).formatted}
                  </span>
                  <span className="text-gray-600 ml-2 mb-1">/{billingCycle === 'yearly' ? 'year' : 'month'}</span>
                </div>
                {getApproxForTier('starter', billingCycle) && (
                  <span className="text-xs text-gray-400 mt-1">
                    ≈ {getApproxForTier('starter', billingCycle).formatted}/{billingCycle === 'yearly' ? 'year' : 'month'}
                  </span>
                )}
              </div>
              <p className="text-sm italic text-gray-600 mb-6">For the builder taking their first sacred steps</p>
            </div>
            
            <ul className="space-y-2 mb-6 text-sm">
              {tiers.starter.features.map((feature, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-green-500 mr-2 mt-0.5">✓</span>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            
            <div className="border-t pt-4 mb-4">
              <p className="text-xs font-semibold text-gray-500 mb-2">IDEAL FOR:</p>
              {tiers.starter.idealFor.map((ideal, idx) => (
                <p key={idx} className="text-xs text-gray-600 mb-1">• {ideal}</p>
              ))}
            </div>
            
                        <button
              onClick={() => handleSubscribe('starter')}
              disabled={isSubscribing || hasPass || isLoading}
              className="btn-outline w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubscribing && selectedTier === 'starter' ? (
                <>
                  <LoadingSpinner size="sm" color="purple" />
                  Processing...
                </>
              ) : (hasPass ? '✓ Active' : 'Begin Journey')}
            </button>
          </div>
          
          {/* Pro Tier */}
          <div className="card hover:shadow-2xl transition-all duration-300 border-2 border-vault-purple relative transform scale-105">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-vault-purple text-white px-4 py-1 rounded-full text-xs font-semibold tracking-wide">
                MOST POPULAR
              </span>
            </div>
            
            <div className="text-center mb-4">
              <div className="text-5xl mb-3">{tiers.pro.icon}</div>
              <h3 className="text-xl font-bold mb-1">Pro</h3>
              <p className="text-sm text-gray-500 mb-4">The Empire Builder</p>
              <div className="flex flex-col items-center mb-3">
                <div className="flex items-end justify-center">
                  <span className="text-4xl font-bold text-vault-purple">
                    {getPriceForTier('pro', billingCycle).formatted}
                  </span>
                  <span className="text-gray-600 ml-2 mb-1">/{billingCycle === 'yearly' ? 'year' : 'month'}</span>
                </div>
                {getApproxForTier('pro', billingCycle) && (
                  <span className="text-xs text-gray-400 mt-1">
                    ≈ {getApproxForTier('pro', billingCycle).formatted}/{billingCycle === 'yearly' ? 'year' : 'month'}
                  </span>
                )}
              </div>
              <p className="text-sm italic text-gray-600 mb-6">For the creator who's tasted freedom and wants dominion</p>
            </div>
            
            <ul className="space-y-2 mb-6 text-sm">
              {tiers.pro.features.map((feature, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-green-500 mr-2 mt-0.5">✓</span>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            
            <div className="border-t pt-4 mb-4">
              <p className="text-xs font-semibold text-gray-500 mb-2">IDEAL FOR:</p>
              {tiers.pro.idealFor.map((ideal, idx) => (
                <p key={idx} className="text-xs text-gray-600 mb-1">• {ideal}</p>
              ))}
            </div>
            
                        <button
              onClick={() => handleSubscribe('pro')}
              disabled={isSubscribing || hasPass || isLoading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubscribing && selectedTier === 'pro' ? (
                <>
                  <LoadingSpinner size="sm" />
                  Processing...
                </>
              ) : (hasPass ? '✓ Active' : 'Claim Dominion')}
            </button>
          </div>
          
          {/* Legacy Tier */}
          <div className="card hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-yellow-400 bg-gradient-to-br from-white to-yellow-50">
            <div className="text-center mb-4">
              <div className="text-5xl mb-3">{tiers.legacy.icon}</div>
              <h3 className="text-xl font-bold mb-1">Legacy</h3>
              <p className="text-sm text-gray-500 mb-4">The Mythmaker</p>
              <div className="flex flex-col items-center mb-3">
                <div className="flex items-end justify-center">
                  <span className="text-4xl font-bold text-vault-purple">
                    {getPriceForTier('legacy', billingCycle).formatted}
                  </span>
                  <span className="text-gray-600 ml-2 mb-1">/{billingCycle === 'yearly' ? 'year' : 'month'}</span>
                </div>
                {getApproxForTier('legacy', billingCycle) && (
                  <span className="text-xs text-gray-400 mt-1">
                    ≈ {getApproxForTier('legacy', billingCycle).formatted}/{billingCycle === 'yearly' ? 'year' : 'month'}
                  </span>
                )}
              </div>
              <p className="text-sm italic text-gray-600 mb-6">For the oracle who builds systems that outlive them</p>
            </div>
            
            <ul className="space-y-2 mb-6 text-sm">
              {tiers.legacy.features.map((feature, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-green-500 mr-2 mt-0.5">✓</span>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            
            <div className="border-t pt-4 mb-4">
              <p className="text-xs font-semibold text-gray-500 mb-2">IDEAL FOR:</p>
              {tiers.legacy.idealFor.map((ideal, idx) => (
                <p key={idx} className="text-xs text-gray-600 mb-1">• {ideal}</p>
              ))}
            </div>
            
                        <button
              onClick={() => handleSubscribe('legacy')}
              disabled={isSubscribing || hasPass || isLoading}
              className="btn-secondary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubscribing && selectedTier === 'legacy' ? (
                <>
                  <LoadingSpinner size="sm" />
                  Processing...
                </>
              ) : (hasPass ? '✓ Active' : 'Forge Legend')}
            </button>
          </div>
        </div>
      </div>

            {/* Upgrade Path */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-4">
          <span className="text-gradient">🔁 Upgrade Rituals</span>
        </h2>
        <p className="text-center text-gray-600 mb-8">Ascend anytime. Your credits, scrolls, and vault access scale with you.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {upgradePath.map((path, index) => (
            <div key={index} className="card text-center hover:border-vault-purple transition-all">
              <div className="text-4xl mb-3">{path.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{path.title}</h3>
              <p className="text-sm text-gray-600">{path.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* CLI Invocation */}
      <div className="mb-16 max-w-4xl mx-auto">
        <div className="card bg-gray-900 text-green-400 font-mono text-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500">🧙 CLI Invocation</span>
            <span className="text-xs text-gray-500">Coming Soon</span>
          </div>
          <pre className="overflow-x-auto">
            <code>{`vauntico pass upgrade \\\n  --tier "legacy" \\\n  --confirm true`}</code>
          </pre>
        </div>
      </div>

                  {/* Trust Badges */}
      <div className="mb-16">
        <TrustBadges layout="horizontal" />
      </div>

      {/* FAQ Section */}
      <div className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">
          Sacred <span className="text-gradient">Covenant Questions</span>
        </h2>
        <div className="space-y-4">
          <div className="card hover:border-vault-purple transition-all">
            <h3 className="font-semibold text-lg mb-2">⚔️ Can I ascend between tiers?</h3>
            <p className="text-gray-600">Yes! Upgrade anytime via CLI or dashboard. Credits are prorated and rolled over, scroll access expands instantly, and support tier adjusts automatically.</p>
          </div>
          <div className="card hover:border-vault-purple transition-all">
            <h3 className="font-semibold text-lg mb-2">💳 What payment methods are accepted?</h3>
            <p className="text-gray-600">We accept all major credit cards, PayPal, and regional payment methods. Pricing is automatically localized to ZAR or USD based on your location.</p>
          </div>
          <div className="card hover:border-vault-purple transition-all">
            <h3 className="font-semibold text-lg mb-2">🔄 What happens to my credits when I upgrade?</h3>
            <p className="text-gray-600">All unused credits roll over when you ascend. Pro tier allows rollover up to 1,000 credits, while Legacy tier offers unlimited rollover.</p>
          </div>
          <div className="card hover:border-vault-purple transition-all">
            <h3 className="font-semibold text-lg mb-2">📜 What are scrolls?</h3>
            <p className="text-gray-600">Scrolls are Vauntico's codified rituals—pre-built workflows, templates, and automation sequences that scale your creative output. Higher tiers unlock more scrolls.</p>
          </div>
          <div className="card hover:border-vault-purple transition-all">
            <h3 className="font-semibold text-lg mb-2">🎖️ Is there a free trial?</h3>
            <p className="text-gray-600">Yes! All tiers include a 14-day trial period. Cancel anytime within the trial and you won't be charged.</p>
          </div>
          <div className="card hover:border-vault-purple transition-all">
            <h3 className="font-semibold text-lg mb-2">👑 What makes Legacy tier special?</h3>
            <p className="text-gray-600">Legacy members get quarterly co-creation sessions with Tyrone, custom scroll creation, API access, a dedicated success architect, and their name inscribed in the Founder's Codex.</p>
          </div>
        </div>
      </div>
      
      {/* CTA Footer */}
      <div className="mt-16 vault-gradient rounded-2xl p-12 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Begin Your Ascension?</h2>
        <p className="text-xl mb-8 opacity-90">
          Choose your covenant and unlock the vault. Scale your legacy.
        </p>
        <div className="flex items-center justify-center space-x-4">
          <button 
            onClick={() => {
              document.querySelector('.grid.grid-cols-1.md\\:grid-cols-3').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
              })
            }}
            className="bg-white text-vault-purple hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-all duration-200"
          >
            View Covenants
          </button>
          <a 
            href="/pricing" 
            className="border-2 border-white text-white hover:bg-white hover:text-vault-purple font-semibold py-3 px-8 rounded-lg transition-all duration-200 inline-block"
          >
            Compare All Plans
          </a>
        </div>
                        </div>
      </div>

      {/* Mobile Sticky CTA */}
      {!hasPass && <CreatorPassCTA />}
    </>
  )
}

export default CreatorPass
