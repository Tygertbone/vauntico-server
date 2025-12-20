/**
 * Pricing Demo & Testing Page
 * Section 2A: Pricing Logic Binding - Demo & Testing Interface
 */

import { useState, useMemo } from 'react'
import { 
  useCreatorPass, 
  useWorkshopKitAccess, 
  useAuditServiceAccess,
  useSubscriptionStatus,
  usePremiumAccess 
} from '../hooks/useAccess'
import { 
  AccessGate, 
  AccessBadge, 
  CreatorPassPromoBanner,
  SubscriptionStatus,
  PricingComparisonCard
} from '../components/AccessGate'
import { DEV_UTILS, PRICING, formatPrice, getLocalizedPrice, getUserCurrency } from '../utils/pricing'

function PricingDemo() {
  const [activeTab, setActiveTab] = useState('status')
  const { hasPass, isLoading: passLoading } = useCreatorPass()
  const workshopAccess = useWorkshopKitAccess()
  const auditAccess = useAuditServiceAccess()
  const subscription = useSubscriptionStatus()
  const premiumAccess = usePremiumAccess()
  
  // Get current currency
  const currentCurrency = useMemo(() => getUserCurrency(), [])
  
  // Get localized prices for display
  const creatorPassPrice = useMemo(() => getLocalizedPrice(PRICING.CREATOR_PASS), [])
  const workshopKitPrice = useMemo(() => getLocalizedPrice(PRICING.WORKSHOP_KIT), [])
  const auditServicePrice = useMemo(() => getLocalizedPrice(PRICING.AUDIT_SERVICE), [])

  const tabs = [
    { id: 'status', name: 'Access Status', icon: '📊' },
    { id: 'demo', name: 'Component Demo', icon: '🎨' },
    { id: 'pricing', name: 'Pricing Data', icon: '💰' },
    { id: 'controls', name: 'Dev Controls', icon: '🛠️' }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-block vault-gradient text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
          PRICING DEMO & TESTING
        </div>
        <h1 className="text-5xl font-bold mb-4">
          Pricing Logic <span className="text-gradient">Binding Demo</span>
        </h1>
        <p className="text-xl text-gray-600">
          Test and visualize the pricing and access control system
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8 overflow-x-auto pb-2">
        <div className="inline-flex space-x-2 bg-gray-100 rounded-full p-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2 rounded-full font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white shadow-md text-vault-purple'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.icon} {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-8">
        {/* Access Status Tab */}
        {activeTab === 'status' && (
          <>
            <div className="card">
              <h2 className="text-2xl font-bold mb-6">Current Access Status</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Creator Pass */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg">Creator Pass</h3>
                    <AccessBadge hasAccess={hasPass} reason={hasPass ? 'creator_pass' : 'no_access'} />
                  </div>
                  <div className="text-sm space-y-2 text-gray-600">
                    <p>Status: {passLoading ? 'Loading...' : (hasPass ? 'Active ✓' : 'Inactive ✗')}</p>
                    <p>Price: {creatorPassPrice.formatted}/{PRICING.CREATOR_PASS.period}</p>
                    <p>Currency: {creatorPassPrice.currency}</p>
                  </div>
                </div>

                {/* Workshop Kit */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg">Workshop Kit</h3>
                    <AccessBadge hasAccess={workshopAccess.hasAccess} reason={workshopAccess.reason} />
                  </div>
                  <div className="text-sm space-y-2 text-gray-600">
                    <p>Status: {workshopAccess.isLoading ? 'Loading...' : (workshopAccess.hasAccess ? 'Unlocked ✓' : 'Locked ✗')}</p>
                    <p>Reason: {workshopAccess.reason}</p>
                    <p>Price: {workshopKitPrice.formatted} (once-off)</p>
                    <p>Currency: {workshopKitPrice.currency}</p>
                  </div>
                </div>

                {/* Audit Service */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg">Audit Service</h3>
                    <AccessBadge hasAccess={auditAccess.hasAccess} reason={auditAccess.reason} />
                  </div>
                  <div className="text-sm space-y-2 text-gray-600">
                    <p>Status: {auditAccess.isLoading ? 'Loading...' : (auditAccess.hasAccess ? 'Active ✓' : 'Inactive ✗')}</p>
                    <p>Reason: {auditAccess.reason}</p>
                    {auditAccess.plan && <p>Plan: {auditAccess.plan}</p>}
                    <p>Price: {auditServicePrice.formatted}/{PRICING.AUDIT_SERVICE.period}</p>
                    <p>Currency: {auditServicePrice.currency}</p>
                  </div>
                </div>

                {/* Subscription Status */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg">Subscription</h3>
                    {subscription.isActive && (
                      <SubscriptionStatus 
                        status={subscription.status}
                        plan={subscription.plan}
                      />
                    )}
                  </div>
                  <div className="text-sm space-y-2 text-gray-600">
                    <p>Status: {subscription.status || 'None'}</p>
                    <p>Plan: {subscription.plan || 'N/A'}</p>
                    <p>Active: {subscription.isActive ? 'Yes ✓' : 'No ✗'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Access Summary */}
            <div className="card bg-gradient-to-br from-vault-purple/5 to-vault-blue/5">
              <h2 className="text-2xl font-bold mb-6">Premium Access Summary</h2>
              <div className="mb-4 p-4 bg-white rounded-lg border-2 border-vault-purple/20">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">🌍 Current Region</div>
                  <div className="text-2xl font-bold text-vault-purple">{currentCurrency}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {currentCurrency === 'ZAR' ? 'South Africa' : 'United States'}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { name: 'Creator Pass', value: premiumAccess.creatorPass },
                  { name: 'Workshop Kit', value: premiumAccess.workshopKit },
                  { name: 'Audit Service', value: premiumAccess.auditService },
                  { name: 'Automation', value: premiumAccess.automation },
                  { name: 'Brand Builder', value: premiumAccess.brandBuilder }
                ].map((item, idx) => (
                  <div key={idx} className="text-center p-4 bg-white rounded-lg">
                    <div className="text-3xl mb-2">
                      {item.value ? '✅' : '🔒'}
                    </div>
                    <div className="font-semibold text-sm">{item.name}</div>
                    <div className={`text-xs ${item.value ? 'text-green-600' : 'text-gray-500'}`}>
                      {item.value ? 'Unlocked' : 'Locked'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Component Demo Tab */}
        {activeTab === 'demo' && (
          <>
            <div className="card">
              <h2 className="text-2xl font-bold mb-6">Component Showcase</h2>
              
              {/* Access Gate */}
              <div className="mb-8">
                <h3 className="font-bold text-lg mb-4">Access Gate Component</h3>
                <AccessGate
                  hasAccess={workshopAccess.hasAccess}
                  reason={workshopAccess.reason}
                  message="This is a demo of the Access Gate component"
                  price={499}
                  currency="ZAR"
                  actionText="Unlock Demo Content"
                  onAction={() => alert('Action triggered!')}
                >
                  <div className="p-6 bg-green-50 border-2 border-green-200 rounded-lg">
                    <h4 className="font-bold text-lg text-green-700 mb-2">🎉 Unlocked Content!</h4>
                    <p className="text-gray-700">This content is only visible when access is granted.</p>
                  </div>
                </AccessGate>
              </div>

              {/* Access Badges */}
              <div className="mb-8">
                <h3 className="font-bold text-lg mb-4">Access Badge Variants</h3>
                <div className="flex flex-wrap gap-4">
                  <AccessBadge hasAccess={false} reason="no_access" />
                  <AccessBadge hasAccess={true} reason="creator_pass" />
                  <AccessBadge hasAccess={true} reason="purchased" />
                  <AccessBadge hasAccess={true} reason="subscription" />
                  <AccessBadge hasAccess={false} reason="no_access" compact={true} />
                  <AccessBadge hasAccess={true} reason="creator_pass" compact={true} />
                </div>
              </div>

              {/* Creator Pass Promo */}
              <div className="mb-8">
                <h3 className="font-bold text-lg mb-4">Creator Pass Promo Banner</h3>
                <CreatorPassPromoBanner 
                  features={[
                    'Unlimited AI Generation',
                    'Workshop Kit Access',
                    'All Premium Add-ons',
                    'Priority Support'
                  ]}
                  showDiscount={true}
                  discountPercentage={25}
                />
              </div>

              {/* Pricing Comparison */}
              <div className="mb-8">
                <h3 className="font-bold text-lg mb-4">Pricing Comparison Card</h3>
                <div className="max-w-sm">
                  <PricingComparisonCard 
                    standardPrice={1998}
                    passPrice={999}
                    currency="ZAR"
                    period="month"
                  />
                </div>
              </div>

              {/* Subscription Status */}
              <div>
                <h3 className="font-bold text-lg mb-4">Subscription Status Indicators</h3>
                <div className="flex flex-wrap gap-4">
                  <SubscriptionStatus status="active" plan="professional" />
                  <SubscriptionStatus status="cancelled" plan="starter" expiryDate="2024-12-31" />
                  <SubscriptionStatus status="expired" plan="enterprise" />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Pricing Data Tab */}
        {activeTab === 'pricing' && (
          <div className="card">
            <h2 className="text-2xl font-bold mb-6">Pricing Configuration</h2>
            
            <div className="space-y-6">
              {Object.entries(PRICING).map(([key, value]) => (
                <div key={key} className="p-4 border rounded-lg">
                  <h3 className="font-bold text-lg mb-2 uppercase">{key.replace(/_/g, ' ')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-semibold">Price: </span>
                      {value.price ? formatPrice(value.price, value.currency) : 'N/A'}
                    </div>
                    <div>
                      <span className="font-semibold">Period: </span>
                      {value.period || 'N/A'}
                    </div>
                    {value.features && (
                      <div className="col-span-2">
                        <span className="font-semibold">Features:</span>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          {value.features.map((feature, idx) => (
                            <li key={idx} className="text-gray-600">{feature}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {value.unlockConditions && (
                      <div className="col-span-2">
                        <span className="font-semibold">Unlock Conditions:</span>
                        <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
                          {Object.entries(value.unlockConditions).map(([condition, enabled]) => (
                            <li key={condition}>
                              {condition}: {enabled ? '✅' : '❌'}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dev Controls Tab */}
        {activeTab === 'controls' && (
          <div className="card">
            <h2 className="text-2xl font-bold mb-6">Development Controls</h2>
            <p className="text-gray-600 mb-6">
              Use these controls to toggle access states for testing. Changes are stored in localStorage.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => {
                  DEV_UTILS.toggleCreatorPass()
                  window.location.reload()
                }}
                className="btn-primary"
              >
                Toggle Creator Pass
              </button>

              <button
                onClick={() => {
                  DEV_UTILS.toggleWorkshopKit()
                  window.location.reload()
                }}
                className="btn-primary"
              >
                Toggle Workshop Kit
              </button>

              <button
                onClick={() => {
                  DEV_UTILS.setAuditSubscription('professional')
                  window.location.reload()
                }}
                className="btn-primary"
              >
                Enable Audit Subscription
              </button>

              <button
                onClick={() => {
                  DEV_UTILS.clearAll()
                  window.location.reload()
                }}
                className="btn-outline"
              >
                Clear All Access
              </button>
              
              <button
                onClick={() => {
                  DEV_UTILS.setLocale('USD')
                  window.location.reload()
                }}
                className="btn-primary"
              >
                🇺🇸 Set Locale to USD
              </button>
              
              <button
                onClick={() => {
                  DEV_UTILS.setLocale('ZAR')
                  window.location.reload()
                }}
                className="btn-primary"
              >
                🇿🇦 Set Locale to ZAR
              </button>
              
              <button
                onClick={() => {
                  DEV_UTILS.clearLocale()
                  window.location.reload()
                }}
                className="btn-outline"
              >
                Clear Locale Override
              </button>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold mb-2">Console Commands</h3>
              <p className="text-sm text-gray-600 mb-2">
                Open browser console and use <code className="bg-gray-200 px-2 py-1 rounded">window.VaunticoDev</code>:
              </p>
              <pre className="bg-gray-800 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">
{`// Toggle Creator Pass
window.VaunticoDev.toggleCreatorPass()

// Toggle Workshop Kit
window.VaunticoDev.toggleWorkshopKit()

// Set Audit Subscription
window.VaunticoDev.setAuditSubscription('professional')

// Set Regional Locale
window.VaunticoDev.setLocale('ZAR')  // or 'USD'
window.VaunticoDev.clearLocale()

// Clear all access
window.VaunticoDev.clearAll()

// Log current state
window.VaunticoDev.logState()`}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PricingDemo
