import { useState } from 'react'

function Addons() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [cart, setCart] = useState([])

  const categories = [
    { id: 'all', name: 'All Add-ons', icon: '🌟' },
    { id: 'content', name: 'Content Tools', icon: '✍️' },
    { id: 'automation', name: 'Automation', icon: '🤖' },
    { id: 'analytics', name: 'Analytics', icon: '📊' },
    { id: 'integration', name: 'Integrations', icon: '🔌' }
  ]

  const addons = [
    {
      id: 'auto-fix',
      name: 'Auto-Fix Service',
      category: 'automation',
      price: 299,
      period: '/month',
      description: 'Automated fixes for common code issues',
      features: [
        'Automatic dependency updates',
        'Security vulnerability patching',
        'Code style enforcement',
        'Dead code removal'
      ],
      icon: '🤖',
      popular: true,
      creatorPassDiscount: 20
    },
    {
      id: 'custom-reporting',
      name: 'Custom Reporting',
      category: 'analytics',
      price: 199,
      period: '/month',
      description: 'Branded reports with custom metrics',
      features: [
        'White-label reports',
        'Custom KPI tracking',
        'Executive summaries',
        'Scheduled delivery'
      ],
      icon: '📈',
      popular: false,
      creatorPassDiscount: 15
    },
    {
      id: 'team-training',
      name: 'Team Training',
      category: 'content',
      price: 1499,
      period: '/session',
      description: 'Hands-on workshop for your team',
      features: [
        '3-hour live workshop',
        'Custom curriculum',
        'Recording provided',
        '30-day email support'
      ],
      icon: '🎓',
      popular: false,
      creatorPassDiscount: 10
    },
    {
      id: 'emergency-audit',
      name: 'Emergency Audit',
      category: 'automation',
      price: 2999,
      period: '/one-time',
      description: '24-hour critical issue analysis',
      features: [
        '24-hour turnaround',
        'Senior engineer review',
        'Video walkthrough',
        'Priority fix recommendations'
      ],
      icon: '🚨',
      popular: false,
      creatorPassDiscount: 25
    },
    {
      id: 'ai-content-boost',
      name: 'AI Content Boost',
      category: 'content',
      price: 399,
      period: '/month',
      description: '10x your AI generation limits',
      features: [
        '10,000 AI generations/month',
        'Priority processing',
        'Advanced models access',
        'Bulk generation tools'
      ],
      icon: '🚀',
      popular: true,
      creatorPassDiscount: 30
    },
    {
      id: 'white-label',
      name: 'White Label',
      category: 'integration',
      price: 799,
      period: '/month',
      description: 'Remove Vauntico branding',
      features: [
        'Custom domain',
        'Your logo & colors',
        'Custom email templates',
        'API white-labeling'
      ],
      icon: '🏷️',
      popular: false,
      creatorPassDiscount: 20
    },
    {
      id: 'api-access',
      name: 'API Access Pro',
      category: 'integration',
      price: 499,
      period: '/month',
      description: 'Full API access for integrations',
      features: [
        'Unlimited API calls',
        'Webhook support',
        'Priority rate limits',
        'Dedicated support'
      ],
      icon: '🔌',
      popular: true,
      creatorPassDiscount: 15
    },
    {
      id: 'priority-support',
      name: 'Priority Support',
      category: 'automation',
      price: 299,
      period: '/month',
      description: '24/7 priority assistance',
      features: [
        '1-hour response time',
        'Direct engineer access',
        'Screen sharing sessions',
        'Dedicated Slack channel'
      ],
      icon: '💬',
      popular: false,
      creatorPassDiscount: 25
    },
    {
      id: 'advanced-analytics',
      name: 'Advanced Analytics',
      category: 'analytics',
      price: 349,
      period: '/month',
      description: 'Deep insights into your content',
      features: [
        'Custom dashboards',
        'Predictive analytics',
        'A/B testing tools',
        'Export to BI tools'
      ],
      icon: '📊',
      popular: false,
      creatorPassDiscount: 20
    }
  ]

  const filteredAddons = selectedCategory === 'all' 
    ? addons 
    : addons.filter(addon => addon.category === selectedCategory)

  const addToCart = (addon) => {
    if (!cart.find(item => item.id === addon.id)) {
      setCart([...cart, addon])
    }
  }

  const removeFromCart = (addonId) => {
    setCart(cart.filter(item => item.id !== addonId))
  }

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price, 0)
  }

  const calculateSavings = () => {
    return cart.reduce((total, item) => {
      return total + (item.price * (item.creatorPassDiscount / 100))
    }, 0)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-block vault-gradient text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
          ADD-ONS & EXTENSIONS
        </div>
        <h1 className="text-5xl font-bold mb-4">
          Supercharge Your <span className="text-gradient">Vauntico Experience</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
          Enhance your workflow with powerful add-ons. Mix and match to create your perfect toolkit.
        </p>
        <p className="text-lg text-vault-purple font-semibold">
          🎉 Creator Pass members save 10-30% on all add-ons
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex justify-center mb-8 overflow-x-auto pb-2">
        <div className="inline-flex space-x-2 bg-gray-100 rounded-full p-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-2 rounded-full font-medium transition-all whitespace-nowrap ${
                selectedCategory === category.id
                  ? 'bg-white shadow-md text-vault-purple'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {category.icon} {category.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add-ons Grid */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredAddons.map((addon) => (
              <div 
                key={addon.id}
                className={`card hover:shadow-xl transition-all ${
                  addon.popular ? 'border-2 border-vault-purple' : ''
                }`}
              >
                {addon.popular && (
                  <div className="bg-vault-purple text-white text-xs font-semibold px-3 py-1 rounded-full inline-block mb-3">
                    POPULAR
                  </div>
                )}
                
                <div className="text-5xl mb-3">{addon.icon}</div>
                <h3 className="text-xl font-bold mb-2">{addon.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{addon.description}</p>
                
                <div className="mb-4">
                  <div className="flex items-end mb-1">
                    <span className="text-3xl font-bold">R{addon.price}</span>
                    <span className="text-gray-500 ml-1 mb-1">{addon.period}</span>
                  </div>
                  {addon.creatorPassDiscount > 0 && (
                    <div className="text-sm text-green-600 font-semibold">
                      Save {addon.creatorPassDiscount}% with Creator Pass
                    </div>
                  )}
                </div>
                
                <ul className="space-y-2 mb-4">
                  {addon.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start text-sm">
                      <span className="text-green-500 mr-2 mt-0.5">✓</span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => addToCart(addon)}
                  disabled={cart.find(item => item.id === addon.id)}
                  className={`w-full py-2 rounded-lg font-semibold transition-all ${
                    cart.find(item => item.id === addon.id)
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'btn-primary'
                  }`}
                >
                  {cart.find(item => item.id === addon.id) ? '✓ Added' : 'Add to Cart'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Cart Sidebar */}
        <div className="lg:col-span-1">
          <div className="card sticky top-8">
            <h3 className="text-2xl font-bold mb-4">Your Selection</h3>
            
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🛒</div>
                <p className="text-gray-500">No add-ons selected yet</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-6">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{item.name}</div>
                        <div className="text-xs text-gray-600">R{item.price}{item.period}</div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">R{calculateTotal()}</span>
                  </div>
                  {calculateSavings() > 0 && (
                    <div className="flex justify-between mb-2 text-green-600">
                      <span>Creator Pass Savings</span>
                      <span className="font-semibold">-R{calculateSavings().toFixed(0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total</span>
                    <span className="text-gradient">R{(calculateTotal() - calculateSavings()).toFixed(0)}</span>
                  </div>
                </div>

                <button className="btn-primary w-full mb-3">
                  🚀 Activate Add-ons
                </button>
                <button 
                  onClick={() => setCart([])}
                  className="btn-outline w-full text-sm"
                >
                  Clear All
                </button>
              </>
            )}
          </div>

          {/* Creator Pass Promo */}
          <div className="card mt-6 bg-gradient-to-br from-vault-purple/10 to-vault-blue/10 border-2 border-vault-purple/20">
            <div className="text-center">
              <div className="text-4xl mb-3">💎</div>
              <h4 className="font-bold text-lg mb-2">Not a Creator Pass member?</h4>
              <p className="text-sm text-gray-600 mb-4">
                Unlock 10-30% discounts on all add-ons, plus unlimited AI generations and more.
              </p>
              <button className="btn-secondary w-full text-sm">
                Upgrade to Creator Pass
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">
          Add-on <span className="text-gradient">FAQs</span>
        </h2>
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-lg mb-2">Can I cancel add-ons anytime?</h3>
            <p className="text-gray-600">
              Yes! All subscription add-ons can be canceled anytime. One-time add-ons are non-refundable after delivery.
            </p>
          </div>
          <div className="card">
            <h3 className="font-semibold text-lg mb-2">Do add-ons work without Creator Pass?</h3>
            <p className="text-gray-600">
              Absolutely. Add-ons are standalone purchases. However, Creator Pass members enjoy significant discounts.
            </p>
          </div>
          <div className="card">
            <h3 className="font-semibold text-lg mb-2">How do discounts stack?</h3>
            <p className="text-gray-600">
              Creator Pass discounts are automatically applied. We occasionally run promotions that can stack for even bigger savings.
            </p>
          </div>
          <div className="card">
            <h3 className="font-semibold text-lg mb-2">Can I share add-ons with my team?</h3>
            <p className="text-gray-600">
              Most add-ons are account-level, so your entire team can benefit. Enterprise plans offer team-specific features.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-16 text-center vault-gradient rounded-2xl p-12 text-white">
        <h2 className="text-3xl font-bold mb-4">
          Build Your Perfect Toolkit
        </h2>
        <p className="text-xl mb-8 opacity-90">
          Mix and match add-ons to create the ultimate content creation system
        </p>
        <button className="bg-white text-vault-purple hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-all duration-200">
          View All Add-ons
        </button>
      </div>
    </div>
  )
}

export default Addons
