import { useState, useMemo } from 'react'
import { useAuditServiceAccess, useCreatorPass, useSubscriptionStatus } from '../hooks/useAccess'
import { subscribeToAuditService, PRICING, getLocalizedPrice, getApproximatePrice } from '../utils/pricing'
import { AccessGate, AccessBadge, CreatorPassPromoBanner, SubscriptionStatus } from '../components/AccessGate'

function AuditService() {
  const [selectedPlan, setSelectedPlan] = useState('professional')
  const [isSubscribing, setIsSubscribing] = useState(false)
  const accessStatus = useAuditServiceAccess()
  const { hasPass } = useCreatorPass()
  const subscription = useSubscriptionStatus()
  
  // Get localized pricing for all plans
  const starterPrice = useMemo(() => getLocalizedPrice(PRICING.AUDIT_SERVICE.plans.starter), [])
  const professionalPrice = useMemo(() => getLocalizedPrice(PRICING.AUDIT_SERVICE.plans.professional), [])
  const enterprisePrice = useMemo(() => getLocalizedPrice(PRICING.AUDIT_SERVICE.plans.enterprise), [])
  
  // Get approximate prices for display
  const starterApprox = useMemo(() => {
    if (starterPrice.currency === 'ZAR') {
      return getApproximatePrice(starterPrice.price, 'ZAR', 'USD')
    } else {
      return getApproximatePrice(starterPrice.price, 'USD', 'ZAR')
    }
  }, [starterPrice])
  
  const professionalApprox = useMemo(() => {
    if (professionalPrice.currency === 'ZAR') {
      return getApproximatePrice(professionalPrice.price, 'ZAR', 'USD')
    } else {
      return getApproximatePrice(professionalPrice.price, 'USD', 'ZAR')
    }
  }, [professionalPrice])

  const handleSubscribe = async (plan) => {
    setIsSubscribing(true)
    await subscribeToAuditService(
      plan,
      () => {
        alert(`🎉 Subscribed to ${plan} plan! Refresh to access Audit Service.`)
        window.location.reload()
      },
      (error) => {
        alert('Subscription failed. Please try again.')
        console.error(error)
        setIsSubscribing(false)
      }
    )
  }

  const auditIncludes = [
    {
      icon: '🔍',
      title: 'Git Archaeology',
      description: 'Deep dive into your repository history',
      details: [
        'Commit pattern analysis',
        'Code evolution tracking',
        'Technical debt identification',
        'Contributor activity mapping'
      ]
    },
    {
      icon: '🚀',
      title: 'Deployment Health Check',
      description: 'Comprehensive deployment assessment',
      details: [
        'Build pipeline analysis',
        'Environment configuration review',
        'Performance benchmarking',
        'Security vulnerability scan'
      ]
    },
    {
      icon: '🗺️',
      title: 'Module Mapping',
      description: 'Visual architecture documentation',
      details: [
        'Dependency graph generation',
        'Component relationship mapping',
        'Dead code detection',
        'Import/export analysis'
      ]
    },
    {
      icon: '🔧',
      title: 'Fix Suggestions',
      description: 'Actionable improvement recommendations',
      details: [
        'Prioritized issue list',
        'Quick win opportunities',
        'Long-term refactoring strategy',
        'Best practice guidelines'
      ]
    },
    {
      icon: '📊',
      title: 'Performance Metrics',
      description: 'Detailed performance analysis',
      details: [
        'Load time assessment',
        'Bundle size optimization',
        'Runtime performance tracking',
        'Resource utilization report'
      ]
    },
    {
      icon: '🛡️',
      title: 'Security Audit',
      description: 'Identify security vulnerabilities',
      details: [
        'Dependency vulnerability check',
        'API security review',
        'Authentication/authorization audit',
        'Data protection assessment'
      ]
    }
  ]

  const pricingPlans = [
    {
      id: 'starter',
      name: 'Starter Audit',
      price: starterPrice.formatted,
      approximatePrice: starterApprox,
      period: 'one-time',
      description: 'Perfect for small projects',
      features: [
        'Basic git archaeology',
        'Deployment health check',
        'Module mapping',
        'PDF report',
        '2-day turnaround'
      ],
      cta: 'Start Basic Audit',
      popular: false
    },
    {
      id: 'professional',
      name: 'Professional Audit',
      price: professionalPrice.formatted,
      approximatePrice: professionalApprox,
      period: '/month',
      description: 'Ongoing project health monitoring',
      features: [
        'Everything in Starter',
        'Weekly automated audits',
        'Performance metrics tracking',
        'Security vulnerability monitoring',
        'Priority support',
        'Monthly strategy call',
        'Custom recommendations'
      ],
      cta: 'Subscribe to Professional',
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise Audit',
      price: enterprisePrice.formatted,
      approximatePrice: null,
      period: 'pricing',
      description: 'For large-scale applications',
      features: [
        'Everything in Professional',
        'Multi-repository audits',
        'Team collaboration features',
        'Dedicated account manager',
        'Custom CI/CD integration',
        'On-demand audits',
        'Slack/Teams integration'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ]

  const sampleFindings = [
    {
      severity: 'high',
      category: 'Performance',
      title: 'Large Bundle Size Detected',
      description: 'Main bundle is 2.4MB, exceeding recommended 500KB threshold',
      impact: 'Slow initial load times on mobile devices',
      recommendation: 'Implement code splitting and lazy loading for routes'
    },
    {
      severity: 'medium',
      category: 'Security',
      title: 'Outdated Dependencies',
      description: '12 packages have known security vulnerabilities',
      impact: 'Potential security risks in production',
      recommendation: 'Run npm audit fix and update critical packages'
    },
    {
      severity: 'low',
      category: 'Code Quality',
      title: 'Unused Code Detected',
      description: '23% of imported modules are never used',
      impact: 'Increased bundle size and maintenance overhead',
      recommendation: 'Use tree-shaking and remove dead code'
    }
  ]

  const syndicationAddons = useMemo(() => {
    const currency = professionalPrice.currency
    const addons = [
      {
        name: 'Auto-Fix Service',
        priceZAR: 299,
        priceUSD: 19,
        period: '/month',
        description: 'Automated fixes for common issues',
        icon: '🤖'
      },
      {
        name: 'Custom Reporting',
        priceZAR: 199,
        priceUSD: 12,
        period: '/month',
        description: 'Branded reports with custom metrics',
        icon: '📈'
      },
      {
        name: 'Team Training',
        priceZAR: 1499,
        priceUSD: 89,
        period: '/session',
        description: 'Hands-on workshop for your team',
        icon: '🎓'
      },
      {
        name: 'Emergency Audit',
        priceZAR: 2999,
        priceUSD: 169,
        period: '',
        description: '24-hour critical issue analysis',
        icon: '🚨'
      }
    ]
    
    return addons.map(addon => ({
      ...addon,
      price: currency === 'ZAR' 
        ? `R${addon.priceZAR}${addon.period}`
        : `$${addon.priceUSD}${addon.period}`
    }))
  }, [professionalPrice.currency])

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="inline-block vault-gradient text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
          AUDIT-AS-A-SERVICE
        </div>
        <h1 className="text-5xl font-bold mb-4">
          Know Your Code's <span className="text-gradient">Health Score</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Comprehensive code audits powered by AI and veteran developers. 
          Get actionable insights to improve performance, security, and maintainability.
        </p>
        
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-4">
            <AccessBadge hasAccess={accessStatus.hasAccess} reason={accessStatus.reason} />
            {subscription.isActive && (
              <SubscriptionStatus 
                status={subscription.status} 
                plan={subscription.plan}
              />
            )}
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => accessStatus.hasAccess ? alert('You already have access!') : handleSubscribe('starter')}
              disabled={isSubscribing || accessStatus.hasAccess}
              className="btn-primary text-lg px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {accessStatus.hasAccess ? '✓ Access Granted' : 'Start Free Audit'}
            </button>
            <button 
              onClick={() => {
                // Scroll to sample report section
                const sampleSection = document.querySelector('.card.bg-gradient-to-br.from-gray-50.to-white')
                if (sampleSection) {
                  sampleSection.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }
              }}
              className="btn-outline text-lg px-8 py-3"
            >
              View Sample Report
            </button>
          </div>
        </div>
      </div>

      {/* Creator Pass Promo */}
      {!hasPass && !accessStatus.hasAccess && (
        <div className="mb-16">
          <CreatorPassPromoBanner 
            features={[
              'Audit Service (Professional Plan)',
              'Workshop Kit Included',
              'All Premium Add-ons',
              'Priority Support'
            ]}
            showDiscount={true}
            discountPercentage={30}
          />
        </div>
      )}

      {/* What's Included */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Comprehensive <span className="text-gradient">Code Analysis</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {auditIncludes.map((item, index) => (
            <div key={index} className="card hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-gray-600 mb-4">{item.description}</p>
              <ul className="space-y-2">
                {item.details.map((detail, idx) => (
                  <li key={idx} className="flex items-start text-sm">
                    <span className="text-vault-purple mr-2">▸</span>
                    <span className="text-gray-700">{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Sample Findings */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-4">
          Sample <span className="text-gradient">Audit Report</span>
        </h2>
        <p className="text-center text-gray-600 mb-8">
          See the kind of insights you'll receive in every audit
        </p>
        
        <div className="card bg-gradient-to-br from-gray-50 to-white">
          <div className="flex items-center justify-between mb-6 pb-4 border-b">
            <div>
              <h3 className="text-2xl font-bold">Project Health: 72/100</h3>
              <p className="text-gray-600">Last audited: 2 days ago</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-gradient">B-</div>
              <p className="text-sm text-gray-600">Above Average</p>
            </div>
          </div>

          <div className="space-y-4">
            {sampleFindings.map((finding, index) => (
              <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase border ${getSeverityColor(finding.severity)}`}>
                      {finding.severity}
                    </span>
                    <span className="text-xs text-gray-500">{finding.category}</span>
                  </div>
                </div>
                
                <h4 className="font-bold text-lg mb-2">{finding.title}</h4>
                <p className="text-gray-700 mb-2">{finding.description}</p>
                
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-3">
                  <p className="text-sm"><strong>Impact:</strong> {finding.impact}</p>
                </div>
                
                <div className="bg-green-50 border-l-4 border-green-400 p-3">
                  <p className="text-sm"><strong>Recommendation:</strong> {finding.recommendation}</p>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => {
              alert('📥 Sample report would download here. In production, this would trigger a PDF download.')
              // TODO: Implement actual PDF download
            }}
            className="w-full mt-6 btn-primary"
          >
            📥 Download Full Sample Report
          </button>
        </div>
      </div>

      {/* Pricing */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Choose Your <span className="text-gradient">Audit Plan</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`card cursor-pointer transition-all ${
                plan.popular 
                  ? 'border-2 border-vault-purple shadow-xl scale-105 relative' 
                  : selectedPlan === plan.id
                  ? 'border-2 border-gray-300'
                  : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-vault-purple text-white px-4 py-1 rounded-full text-sm font-semibold">
                    MOST POPULAR
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="flex flex-col items-center mb-2">
                  <div className="flex items-end justify-center">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period !== 'one-time' && plan.period !== 'pricing' && (
                      <span className="text-gray-600 ml-2 mb-1">{plan.period}</span>
                    )}
                  </div>
                  {plan.approximatePrice && (
                    <span className="text-sm text-gray-400 mt-1">≈ {plan.approximatePrice.formatted}</span>
                  )}
                </div>
                {plan.period === 'one-time' && (
                  <span className="text-sm text-gray-500">One-time payment</span>
                )}
              </div>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">✓</span>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button 
                onClick={() => {
                  if (plan.id === 'enterprise') {
                    window.open('mailto:sales@vauntico.com?subject=Enterprise Audit Inquiry', '_blank')
                  } else if (accessStatus.hasAccess) {
                    alert('✅ You already have access!')
                  } else {
                    handleSubscribe(plan.id)
                  }
                }}
                disabled={isSubscribing && selectedPlan === plan.id}
                className={plan.popular ? 'btn-primary w-full' : 'btn-outline w-full'}
              >
                {isSubscribing && selectedPlan === plan.id ? 'Processing...' : plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add-ons / Syndication */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-4">
          Enhance Your <span className="text-gradient">Audit Experience</span>
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Add-ons available with any plan • Activate via Creator Pass or à la carte
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {syndicationAddons.map((addon, index) => (
            <div key={index} className="card text-center hover:shadow-xl transition-all hover:scale-105">
              <div className="text-5xl mb-4">{addon.icon}</div>
              <h3 className="font-bold text-lg mb-2">{addon.name}</h3>
              <div className="text-2xl font-bold text-vault-purple mb-2">{addon.price}</div>
              <p className="text-sm text-gray-600 mb-4">{addon.description}</p>
              <button 
                onClick={() => {
                  alert(`🎨 ${addon.name} addon would be added here. Payment integration coming soon!`)
                  // TODO: Implement addon purchase flow
                }}
                className="btn-outline w-full text-sm"
              >
                Add to Plan
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="mb-16 vault-gradient rounded-2xl p-12 text-white">
        <h2 className="text-3xl font-bold text-center mb-12">
          How Audit-as-a-Service Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { step: 1, title: 'Connect Repo', description: 'Link your GitHub, GitLab, or Bitbucket', icon: '🔗' },
            { step: 2, title: 'Run Analysis', description: 'AI-powered deep scan begins', icon: '🔍' },
            { step: 3, title: 'Review Report', description: 'Get detailed findings & recommendations', icon: '📊' },
            { step: 4, title: 'Take Action', description: 'Implement fixes with our guidance', icon: '🚀' }
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="relative mb-4">
                <div className="w-20 h-20 mx-auto bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-4xl">
                  {item.icon}
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-white text-vault-purple rounded-full flex items-center justify-center font-bold">
                  {item.step}
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="opacity-90">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center card bg-gradient-to-br from-vault-purple/5 to-vault-blue/5 border-2 border-vault-purple/20">
        <h2 className="text-3xl font-bold mb-4">
          Ready to Improve Your <span className="text-gradient">Codebase?</span>
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Get your first audit free. No credit card required. See what we can find in your code.
        </p>
        <div className="flex items-center justify-center space-x-4">
          <button 
            onClick={() => {
              if (accessStatus.hasAccess) {
                alert('✅ You already have access! Check your dashboard.')
              } else {
                // Scroll to pricing section
                document.querySelector('.grid.grid-cols-1.md\\:grid-cols-3.gap-8').scrollIntoView({ 
                  behavior: 'smooth', 
                  block: 'center' 
                })
              }
            }}
            className="btn-primary text-lg px-12 py-4"
          >
            🔍 Start Free Audit
          </button>
          <button 
            onClick={() => {
              window.open('mailto:support@vauntico.com?subject=Audit Service Inquiry', '_blank')
            }}
            className="btn-outline text-lg px-8 py-4"
          >
            💬 Talk to an Expert
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-6">
          Used by 200+ development teams • 10,000+ audits completed • 4.9/5 average rating
        </p>
      </div>
    </div>
  )
}

export default AuditService
