export const PRICING = {
  CREATOR_PASS: {
    tiers: {
      starter: {
        name: 'Starter',
        price: 299,
        yearlyPrice: 2990,
        localizedPrices: {
          ZAR: { yearlyPrice: 2990, localizedYearlyPrices: { 'ZAR': 'R29,900' } },
          USD: { yearlyPrice: 2990, localizedYearlyPrices: { 'USD': '$2,990' } }
        },
        features: [
          'Basic trust scoring',
          '3 social platforms',
          'Monthly reports',
          'Email support',
          'Basic fraud detection'
        ],
        idealFor: ['Beginners taking first steps', 'Building portfolio consistency', 'Learning platform basics']
      },
      pro: {
        name: 'Pro',
        price: 899,
        yearlyPrice: 8990,
        localizedPrices: {
          ZAR: { yearlyPrice: 8990, localizedYearlyPrices: { 'ZAR': 'R89,900' } },
          USD: { yearlyPrice: 8990, localizedYearlyPrices: { 'USD': '$8,990' } }
        },
        features: [
          'Advanced trust scoring',
          'Unlimited social platforms',
          'Real-time notifications',
          'Priority email support',
          'Advanced fraud detection',
          'API access',
          'Custom branding'
        ],
        idealFor: ['Professional creators', 'Growing audience', 'Content optimization', 'Revenue scaling']
      },
      legacy: {
        name: 'Legacy',
        price: 2499,
        yearlyPrice: 24990,
        localizedPrices: {
          ZAR: { yearlyPrice: 24990, localizedYearlyPrices: { 'ZAR': 'R249,900' } },
          USD: { yearlyPrice: 24990, localizedYearlyPrices: { 'USD': '$24,990' } }
        },
        features: [
          'Everything in Pro plan',
          'White-label dashboard',
          'Dedicated account manager',
          'Custom integrations',
          'Phone support',
          'SLA guarantee',
          'Advanced analytics suite'
        ],
        idealFor: ['Elite creators', 'Building media empires', 'Platform ownership', 'Legacy building']
      }
    }
  }
}

export const getLocalizedPrice = (tier, cycle, currency = 'ZAR') => {
  const tierData = PRICING.CREATOR_PASS.tiers[tier]
  if (!tierData) return { price: 0, currency: 'ZAR', formatted: 'R0', symbol: 'R' }
  
  const priceKey = cycle === 'yearly' ? 'yearlyPrice' : 'price'
  const localizedKey = cycle === 'yearly' ? 'localizedYearlyPrices' : 'localizedPrices'
  
  const userCurrency = localStorage.getItem('vauntico_locale') || currency
  const localizedPrices = tierData[localizedKey] || {}
  const price = localizedPrices[userCurrency] || tierData[priceKey] || 0
  
  return {
    price,
    currency: userCurrency,
    formatted: `${userCurrency === 'ZAR' ? 'R' : '$'}${price.toLocaleString()}`,
    symbol: userCurrency === 'ZAR' ? 'R' : '$'
  }
}

export const getApproximatePrice = (price, fromCurrency = 'ZAR', toCurrency = 'USD') => {
  // Simple approximation - in real app, this would use an exchange rate API
  const exchangeRates = {
    ZAR: { USD: 0.055 }, // 1 ZAR ≈ 0.055 USD (example rate)
    USD: { ZAR: 18.18 }  // 1 USD ≈ 18.18 ZAR
  }
  
  const rate = exchangeRates[fromCurrency]?.[toCurrency] || 0.055
  const approximatedPrice = Math.round(price * rate)
  
  return approximatedPrice
}

export const formatPrice = (price, currency = 'USD') => {
  const symbol = currency === 'ZAR' ? 'R' : '$'
  return `${symbol}${price.toLocaleString()}`
}

export const getCreatorPassTier = (tier) => {
  return PRICING.CREATOR_PASS.tiers[tier] || PRICING.CREATOR_PASS.tiers.starter
}

export const subscribeToCreatorPassTier = (tier) => {
  // In a real app, this would handle subscription logic
  console.log(`Subscribe to ${tier} tier`)
}

export const checkoutCreatorPass = async (tier) => {
  // In a real app, this would integrate with Paystack
  console.log(`Checkout ${tier} tier`)
}

export const subscribeToAuditService = (userEmail, tier) => {
  // In a real app, this would handle subscription to audit service
  console.log(`Subscribe ${userEmail} to audit service: ${tier}`)
}
