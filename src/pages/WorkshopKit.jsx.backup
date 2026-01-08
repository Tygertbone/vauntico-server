import { useState, useMemo } from 'react'
import { useWorkshopKitAccess, useCreatorPass } from '../hooks/useAccess'
import { purchaseWorkshopKit, PRICING, getLocalizedPrice, getApproximatePrice } from '../utils/pricing'
import { AccessGate, AccessBadge, CreatorPassPromoBanner } from '../components/AccessGate'

function WorkshopKit() {
  const [selectedTab, setSelectedTab] = useState('overview')
  const [isPurchasing, setIsPurchasing] = useState(false)
  const accessStatus = useWorkshopKitAccess()
  const { hasPass } = useCreatorPass()
  
  // Get localized pricing
  const localizedPrice = useMemo(() => getLocalizedPrice(PRICING.WORKSHOP_KIT), [])
  const approximatePrice = useMemo(() => {
    if (localizedPrice.currency === 'ZAR') {
      return getApproximatePrice(localizedPrice.price, 'ZAR', 'USD')
    } else {
      return getApproximatePrice(localizedPrice.price, 'USD', 'ZAR')
    }
  }, [localizedPrice])

  const handlePurchase = async () => {
    setIsPurchasing(true)
    await purchaseWorkshopKit(
      () => {
        alert('🎉 Workshop Kit unlocked! Refresh the page to access your content.')
        window.location.reload()
      },
      (error) => {
        alert('Purchase failed. Please try again.')
        console.error(error)
        setIsPurchasing(false)
      }
    )
  }

  const kitIncludes = [
    {
      icon: '🎨',
      title: 'Brand Starter Pack',
      description: 'Logo templates, color palettes, and typography guidelines',
      items: ['Logo variants', 'Brand colors', 'Font pairings', 'Style guide']
    },
    {
      icon: '📜',
      title: 'Ritual Scrolls',
      description: 'Step-by-step guides for common creative workflows',
      items: ['Content rituals', 'Launch sequences', 'Growth playbooks', 'Monetization guides']
    },
    {
      icon: '🎭',
      title: 'Creator Templates',
      description: 'Pre-built templates for various content types',
      items: ['Blog templates', 'Social post formats', 'Email sequences', 'Landing pages']
    },
    {
      icon: '🔮',
      title: 'Vault Blueprints',
      description: 'Organized vault structures for different niches',
      items: ['Content vault', 'Product vault', 'Marketing vault', 'Knowledge vault']
    },
    {
      icon: '⚡',
      title: 'Quick Start Scripts',
      description: 'AI prompts and automation workflows',
      items: ['50+ AI prompts', 'Automation recipes', 'Integration guides', 'API examples']
    },
    {
      icon: '🎓',
      title: 'Masterclass Access',
      description: 'Video tutorials and live workshop recordings',
      items: ['Setup tutorials', 'Advanced techniques', 'Case studies', 'Q&A sessions']
    }
  ]

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Content Creator',
      avatar: '👩‍💼',
      quote: 'The Workshop Kit gave me everything I needed to launch my brand in just 48 hours. The templates alone are worth 10x the price.'
    },
    {
      name: 'Marcus Rivera',
      role: 'Digital Marketer',
      avatar: '👨‍💻',
      quote: 'The ritual scrolls are game-changers. Following the proven workflows saved me months of trial and error.'
    },
    {
      name: 'Aisha Patel',
      role: 'Course Creator',
      avatar: '👩‍🎓',
      quote: 'I\'ve bought many creator kits before, but this is the first one that actually delivered on its promise. Comprehensive and actionable.'
    }
  ]

  const faqs = [
    {
      question: 'Is this a one-time payment?',
      answer: `Yes! The Workshop Kit is a one-time purchase at ${localizedPrice.formatted}. You get lifetime access to all materials and future updates.`
    },
    {
      question: 'Do I need the Creator Pass to use this?',
      answer: 'No, the Workshop Kit works standalone. However, it pairs beautifully with the Creator Pass for enhanced features.'
    },
    {
      question: 'What format are the templates in?',
      answer: 'Templates are provided in multiple formats: Figma, Canva, Google Docs, Notion, and plain text - whatever works best for you.'
    },
    {
      question: 'Can I use these for client work?',
      answer: 'Absolutely! The Workshop Kit includes commercial usage rights for all templates and resources.'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="inline-block vault-gradient text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
            ONCE-OFF OFFERING ✨
          </div>
          <h1 className="text-6xl font-bold mb-6">
            The <span className="text-gradient">Workshop Kit</span>
          </h1>
          <p className="text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Everything you need to launch and scale your creative business. 
            Templates, guides, and resources curated from years of experience.
          </p>
          
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-vault-purple">{localizedPrice.formatted}</div>
              {approximatePrice && (
                <div className="text-sm text-gray-400">≈ {approximatePrice.formatted}</div>
              )}
              <div className="text-gray-500">One-time payment</div>
            </div>
            <div className="text-4xl text-gray-300">•</div>
            <div className="text-center">
              <div className="text-5xl font-bold text-vault-purple">∞</div>
              <div className="text-gray-500">Lifetime access</div>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-4 mb-4">
            <AccessBadge hasAccess={accessStatus.hasAccess} reason={accessStatus.reason} />
          </div>

          <button 
            onClick={handlePurchase}
            disabled={isPurchasing || accessStatus.hasAccess}
            className="btn-primary text-lg px-12 py-4 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPurchasing ? '⏳ Processing...' : (accessStatus.hasAccess ? '✓ Already Unlocked' : '🎁 Get Your Workshop Kit')}
          </button>
          <p className="text-sm text-gray-500">
            💳 Secure payment • 📥 Instant download • 🔄 30-day money-back guarantee
          </p>
        </div>

        {/* Creator Pass Promo - Show if user doesn't have pass or kit */}
        {!hasPass && !accessStatus.hasAccess && (
          <div className="mb-8">
            <CreatorPassPromoBanner 
              features={[
                'Workshop Kit (Included FREE)',
                'All Add-ons Unlocked',
                'Unlimited AI Generation',
                'Priority Support'
              ]}
            />
          </div>
        )}

        {/* Preview Banner */}
        <div className="card bg-gradient-to-r from-vault-purple/10 to-vault-blue/10 border-2 border-vault-purple/20">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-2">🎯 Start Your Creator Journey Today</h3>
              <p className="text-gray-600">
                Join 500+ creators who launched their brands with the Workshop Kit
              </p>
            </div>
            <div className="text-6xl">📦</div>
          </div>
        </div>
      </div>

      {/* What's Inside - Gated Content */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AccessGate
            hasAccess={accessStatus.hasAccess}
            reason={accessStatus.reason}
            message={accessStatus.message}
            price={localizedPrice.price}
            currency={localizedPrice.currency}
            actionText={`🎁 Purchase Workshop Kit (${localizedPrice.formatted})`}
            onAction={handlePurchase}
            isLoading={accessStatus.isLoading}
          >
          <h2 className="text-4xl font-bold text-center mb-4">
            What's Inside the <span className="text-gradient">Workshop Kit</span>
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Six comprehensive modules designed to accelerate your creative business
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {kitIncludes.map((module, index) => (
              <div key={index} className="card hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="text-5xl mb-4">{module.icon}</div>
                <h3 className="text-xl font-bold mb-2">{module.title}</h3>
                <p className="text-gray-600 mb-4">{module.description}</p>
                <ul className="space-y-2">
                  {module.items.map((item, idx) => (
                    <li key={idx} className="flex items-center text-sm">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          </AccessGate>
        </div>
      </div>

      {/* Value Proposition */}
      <div className="bg-gradient-to-r from-vault-purple to-vault-blue py-16 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">R15,000+</div>
              <div className="text-purple-200">Total Value</div>
              <div className="text-sm mt-2 opacity-75">If purchased separately</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">97%</div>
              <div className="text-purple-200">Satisfaction Rate</div>
              <div className="text-sm mt-2 opacity-75">From our creator community</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">24hrs</div>
              <div className="text-purple-200">Average Setup Time</div>
              <div className="text-sm mt-2 opacity-75">From download to launch</div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">
            How It <span className="text-gradient">Works</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: 1, title: 'Purchase', description: 'Complete secure checkout', icon: '💳' },
              { step: 2, title: 'Download', description: 'Instant access to all materials', icon: '📥' },
              { step: 3, title: 'Customize', description: 'Adapt templates to your brand', icon: '🎨' },
              { step: 4, title: 'Launch', description: 'Go live with confidence', icon: '🚀' }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="relative mb-4">
                  <div className="w-20 h-20 mx-auto vault-gradient rounded-full flex items-center justify-center text-4xl text-white">
                    {item.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-vault-purple text-white rounded-full flex items-center justify-center font-bold">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">
            Creators Love the <span className="text-gradient">Workshop Kit</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card">
                <div className="flex items-center mb-4">
                  <div className="text-5xl mr-4">{testimonial.avatar}</div>
                  <div>
                    <div className="font-bold">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.quote}"</p>
                <div className="mt-4 text-yellow-400">★★★★★</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">
            Frequently Asked <span className="text-gradient">Questions</span>
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="card">
                <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="vault-gradient text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Launch Your Creative Business?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Get the Workshop Kit today and start building your dream brand
          </p>
          
          <div className="bg-white/10 backdrop-blur rounded-2xl p-8 mb-8">
            <div className="text-5xl font-bold mb-2">{localizedPrice.formatted}</div>
            {approximatePrice && (
              <div className="text-sm opacity-75 mb-1">≈ {approximatePrice.formatted}</div>
            )}
            <div className="text-lg mb-4">One-time payment • Lifetime access</div>
            <ul className="text-left inline-block space-y-2 mb-6">
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                <span>6 comprehensive modules</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                <span>50+ templates and resources</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                <span>Commercial usage rights</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                <span>Lifetime updates</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                <span>30-day money-back guarantee</span>
              </li>
            </ul>
          </div>

          <button 
            onClick={handlePurchase}
            disabled={isPurchasing || accessStatus.hasAccess}
            className="bg-white text-vault-purple hover:bg-gray-100 font-bold text-xl px-12 py-4 rounded-lg transition-all duration-200 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPurchasing ? '⏳ Processing...' : (accessStatus.hasAccess ? '✓ Already Unlocked - Access Dashboard' : '🎁 Get Your Workshop Kit Now')}
          </button>
          
          <p className="text-sm mt-4 opacity-75">
            Join 500+ creators who have launched with the Workshop Kit
          </p>
        </div>
      </div>
    </div>
  )
}

export default WorkshopKit
