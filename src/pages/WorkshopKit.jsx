import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FullLogo } from '../components/Logo'
import { Search } from 'lucide-react'

const WorkshopKit = () => {
  const [selectedKit, setSelectedKit] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const kits = [
    {
      id: 1,
      name: "Creator Starter Kit",
      description: "Everything you need to launch your creator journey. Includes branding templates, content strategies, and first 90 days of guided support.",
      price: 0,
      duration: "90 days",
      items: [
        "AI-powered content ideas generator",
        "Brand identity toolkit (logos, colors, fonts)",
        "30-day creator roadmap template",
        "Email swipe sequence templates",
        "Content calendar & scheduler",
        "Social media post templates",
        "Hashtag research tools",
        "Engagement optimization strategies"
      ],
      features: [
        "Template library access",
        "AI content suggestions",
        "Performance analytics dashboard",
        "Email marketing automation",
        "Priority support channel access"
      ],
      includes: [
        "Daily creator coaching calls",
        "Weekly group workshops",
        "Private community access",
        "Lifetime template updates"
      ],
      popular: true
    },
    {
      id: 2,
      name: "Content Mastery Kit",
      description: "Advanced strategies for established creators. Deep dive into audience growth, content optimization, and monetization techniques.",
      price: 499,
      duration: "90 days",
      items: [
        "Advanced analytics suite",
        "Competitor analysis tools",
        "SEO optimization tools",
        "Content clustering algorithms",
        "A/B testing framework",
        "Conversion rate optimization"
      ],
      features: [
        "Advanced dashboard customization",
        "Custom analytics reporting",
        "Real-time performance alerts",
        "API integration support"
      ],
      includes: [
        "Bi-weekly strategy calls",
        "Advanced workshop templates",
        "Conversion tracking system",
        "Priority email support"
      ],
      popular: false
    },
    {
      id: 3,
      name: "Monetization Pro Kit",
      description: "Complete monetization toolkit for serious creators. Revenue optimization, sponsorship opportunities, and business scaling strategies.",
      price: 999,
      duration: "Lifetime access",
      items: [
        "Revenue optimization engine",
        "Sponsorship marketplace",
        "Brand partnership opportunities",
        "Advanced financial analytics",
        "Business scaling consultants"
      ],
      features: [
        "White-label marketplace access",
        "Direct sponsor connections",
        "Revenue diversification tools",
        "Equity sharing programs"
      ],
      includes: [
        "Revenue optimization engine",
        "Sponsorship marketplace",
        "Brand partnership opportunities",
        "Advanced financial analytics",
        "Business scaling consultants"
      ],
      popular: false
    }
  ]

  const filteredKits = kits.filter(kit => 
    kit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    kit.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-900 text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl animate-float"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center">
              <FullLogo size="md" />
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/workshop-kit" className="text-white font-medium">Workshop Kit</Link>
              <Link to="/creator-pass" className="text-gray-300 hover:text-white transition-colors">Creator Pass</Link>
              <Link to="/pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</Link>
              <Link to="/dashboard" className="btn-primary text-sm">Dashboard</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-5xl lg:text-6xl font-bold mb-4">
            Workshop <span className="text-gradient">Kits</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Comprehensive toolkits designed to accelerate your creator journey from amateur to professional.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 flex justify-center">
          <div className="relative max-w-xl">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search workshop kits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Kit Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredKits.map((kit) => (
            <div
              key={kit.id}
              className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all hover:shadow-xl"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-purple-600 text-2xl font-bold mb-2">{kit.name}</div>
                  <div className="text-green-600 text-sm">{kit.price === 0 ? 'FREE' : `$${kit.price}`}</div>
                </div>
                <div className="text-right">
                  <div className="text-gray-500 text-sm">{kit.duration}</div>
                </div>
              </div>
              
              <p className="text-gray-300 mb-4">{kit.description}</p>
              
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {kit.items.slice(0, 4).map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-purple-400 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between mb-4">
                <div>
                  <span className="text-green-600 font-semibold">{kit.features.length}+ Features</span>
                  <div className="text-gray-500 text-sm">Included</div>
                </div>
                <div className="text-gray-500 text-sm">{kit.includes.length}+ Templates</div>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-blue-600 font-semibold">{kit.popular ? 'Most Popular' : 'Premium Choice'}</span>
                </div>
                <div className="text-gray-500 text-sm">
                  {kit.popular ? 'Limited time offer' : `${kit.duration} access`}
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-600">
                <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 font-semibold hover:from-purple-700 hover:to-pink-800 transition-all">
                  Get Started with {kit.name}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Features Overview */}
        <div className="max-w-4xl mx-auto mt-16 mb-20">
          <h2 className="text-3xl font-bold text-center mb-8 text-white">
            Why Choose Our Workshop Kits?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center mb-6">
              <div className="bg-purple-50/10 rounded-2xl p-6 border border-purple-300">
                <h3 className="text-xl font-bold text-purple-900 mb-2">For Beginners</h3>
                <p className="text-gray-700">Perfect for getting started with guided support and essential tools.</p>
              </div>
            </div>
            <div className="text-center mb-6">
              <div className="bg-gray-700/10 rounded-2xl p-6 border border-gray-300">
                <h3 className="text-xl font-bold text-gray-900 mb-2">For Growing Creators</h3>
                <p className="text-gray-700">Advanced strategies and tools to scale your audience and revenue.</p>
              </div>
            </div>
            <div className="text-center mb-6">
              <div className="bg-indigo-50/10 rounded-2xl p-6 border border-indigo-300">
                <h3 className="text-xl font-bold text-white mb-2">For Professionals</h3>
                <p className="text-gray-700">Complete monetization toolkit with marketplace access and business scaling features.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10 space-y-6">
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to Accelerate Your Creator Journey?
              </h2>
              <p className="text-xl text-gray-300 mb-6">
                Choose the perfect workshop kit for your needs and start building your empire today.
              </p>
              <div className="flex justify-center space-x-4">
                <Link to="/creator-pass" className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all">
                  Get Started Free
                </Link>
                <Link to="/pricing" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-all">
                  View All Kits
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkshopKit
