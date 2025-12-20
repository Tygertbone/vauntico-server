/**
 * Access Gate Components
 * Section 2A: Pricing Logic Binding - UI Components
 */

import { Link } from 'react-router-dom'
import { formatPrice } from '../utils/pricing'

/**
 * Generic access gate that shows paywall or content
 */
export const AccessGate = ({ 
  hasAccess, 
  reason, 
  message, 
  price, 
  currency = 'ZAR',
  actionText = 'Unlock Access',
  onAction,
  actionLink,
  children,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vault-purple"></div>
      </div>
    )
  }

  if (hasAccess) {
    return <>{children}</>
  }

  return (
    <div className="card bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 text-center py-12">
      <div className="text-6xl mb-4">🔒</div>
      <h3 className="text-2xl font-bold mb-2">Access Required</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{message}</p>
      
      {price && (
        <div className="text-4xl font-bold text-vault-purple mb-6">
          {formatPrice(price, currency)}
        </div>
      )}
      
      {actionLink ? (
        <Link to={actionLink} className="btn-primary inline-block">
          {actionText}
        </Link>
      ) : (
        <button onClick={onAction} className="btn-primary">
          {actionText}
        </button>
      )}
      
      {reason !== 'creator_pass' && (
        <div className="mt-6 pt-6 border-t">
          <p className="text-sm text-gray-600 mb-3">
            💎 Or get access with Creator Pass
          </p>
          <Link to="/creator-pass" className="btn-outline inline-block text-sm">
            Learn About Creator Pass
          </Link>
        </div>
      )}
    </div>
  )
}

/**
 * Inline access badge showing access status
 */
export const AccessBadge = ({ hasAccess, reason, compact = false }) => {
  if (!hasAccess) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-300">
        🔒 {compact ? 'Locked' : 'Access Required'}
      </span>
    )
  }

  if (reason === 'creator_pass') {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-100 to-blue-100 text-vault-purple border border-vault-purple/30">
        💎 {compact ? 'Unlocked' : 'Creator Pass'}
      </span>
    )
  }

  if (reason === 'purchased' || reason === 'subscription') {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-300">
        ✓ {compact ? 'Active' : 'Purchased'}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-300">
      ✓ {compact ? 'Active' : 'Unlocked'}
    </span>
  )
}

/**
 * Creator Pass promotional banner
 */
export const CreatorPassPromoBanner = ({ 
  features = [],
  showDiscount = false,
  discountPercentage = 20
}) => {
  return (
    <div className="card bg-gradient-to-br from-vault-purple/10 to-vault-blue/10 border-2 border-vault-purple/20">
      <div className="flex items-start space-x-4">
        <div className="text-5xl">💎</div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-xl font-bold">Unlock with Creator Pass</h3>
            {showDiscount && (
              <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                Save {discountPercentage}%
              </span>
            )}
          </div>
          <p className="text-gray-600 mb-4">
            Get instant access to this and all premium features
          </p>
          
          {features.length > 0 && (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
              {features.slice(0, 4).map((feature, idx) => (
                <li key={idx} className="flex items-center text-sm">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          )}
          
          <Link to="/creator-pass" className="btn-primary inline-block">
            Upgrade to Creator Pass
          </Link>
        </div>
      </div>
    </div>
  )
}

/**
 * Feature lock overlay for premium features
 */
export const FeatureLock = ({ 
  feature, 
  onUnlock,
  unlockLink = '/creator-pass'
}) => {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
        <div className="text-center p-6">
          <div className="text-4xl mb-3">🔒</div>
          <h4 className="font-bold text-lg mb-2">Premium Feature</h4>
          <p className="text-gray-600 text-sm mb-4">
            {feature || 'This feature'} requires Creator Pass
          </p>
          {unlockLink ? (
            <Link to={unlockLink} className="btn-primary text-sm">
              Unlock Now
            </Link>
          ) : (
            <button onClick={onUnlock} className="btn-primary text-sm">
              Unlock Now
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Pricing comparison card
 */
export const PricingComparisonCard = ({ 
  standardPrice, 
  passPrice, 
  currency = 'ZAR',
  period = 'month' 
}) => {
  const savings = standardPrice - passPrice
  const savingsPercent = Math.round((savings / standardPrice) * 100)

  return (
    <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
      <div className="text-center">
        <div className="text-sm text-gray-600 mb-2">Pay Separately</div>
        <div className="text-2xl font-bold text-gray-400 line-through mb-4">
          {formatPrice(standardPrice, currency)}/{period}
        </div>
        
        <div className="text-sm font-semibold text-green-600 mb-2">
          WITH CREATOR PASS
        </div>
        <div className="text-4xl font-bold text-gradient mb-2">
          {formatPrice(passPrice, currency)}/{period}
        </div>
        
        <div className="inline-block bg-green-500 text-white text-sm font-bold px-4 py-2 rounded-full">
          Save {savingsPercent}% ({formatPrice(savings, currency)})
        </div>
      </div>
    </div>
  )
}

/**
 * Subscription status indicator
 */
export const SubscriptionStatus = ({ status, plan, expiryDate }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-300'
      case 'cancelled':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'expired':
        return 'bg-red-100 text-red-700 border-red-300'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return '✓'
      case 'cancelled':
        return '⚠️'
      case 'expired':
        return '❌'
      default:
        return '○'
    }
  }

  if (!status) return null

  return (
    <div className={`inline-flex items-center px-4 py-2 rounded-lg border ${getStatusColor(status)}`}>
      <span className="mr-2">{getStatusIcon(status)}</span>
      <div className="text-left">
        <div className="font-semibold text-sm capitalize">{status}</div>
        {plan && (
          <div className="text-xs opacity-75 capitalize">{plan} Plan</div>
        )}
        {expiryDate && status === 'cancelled' && (
          <div className="text-xs opacity-75">Expires: {expiryDate}</div>
        )}
      </div>
    </div>
  )
}

/**
 * Loading skeleton for gated content
 */
export const AccessLoadingSkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="card">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6 mb-6"></div>
        <div className="h-10 bg-gray-200 rounded w-40"></div>
      </div>
    </div>
  )
}

export default AccessGate
