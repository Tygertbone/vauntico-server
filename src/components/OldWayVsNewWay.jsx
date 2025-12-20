import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import { trackOldVsNewView, trackComparisonCTAClick } from '../utils/analytics'

/**
 * OldWayVsNewWay Component
 * 
 * Enemy positioning component that contrasts the painful "old way" of juggling
 * multiple tools with the streamlined "Vauntico way" of using one unified Creator OS.
 * 
 * Visually emphasizes:
 * - Cost savings ($500/mo → $29/mo)
 * - Speed improvements (10x faster)
 * - Elimination of context-switching hell
 * 
 * @component
 */
function OldWayVsNewWay() {
  // Track when component is viewed
  useEffect(() => {
    trackOldVsNewView()
  }, [])

  const handleCTAClick = () => {
    trackComparisonCTAClick('Stop Juggling. Start Shipping', '/pricing')
  }

  const oldWayItems = [
    { text: 'Figma for mockups', icon: '🎨' },
    { text: 'ChatGPT for copy', icon: '💬' },
    { text: 'Notion for docs', icon: '📝' },
    { text: 'Webflow for landing pages', icon: '🌐' },
    { text: 'Canva for graphics', icon: '🖼️' },
    { text: '10+ browser tabs open', icon: '🔥', emphasis: true },
    { text: '$500/month in subscriptions', icon: '💸', emphasis: true, large: true },
    { text: 'Constant context-switching hell', icon: '😵', emphasis: true }
  ]

  const newWayItems = [
    { text: 'One command', icon: '⚡' },
    { text: 'Complete infrastructure generated', icon: '🏗️' },
    { text: 'Zero context switching', icon: '🎯' },
    { text: 'AI that learns your voice', icon: '🧠' },
    { text: 'Intelligent vault organization', icon: '🗄️' },
    { text: 'Export everything (no lock-in)', icon: '🔓' },
    { text: '$29/month total', icon: '💰', emphasis: true, large: true },
    { text: 'Ship 10x faster', icon: '🚀', emphasis: true, large: true }
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-64 h-64 bg-red-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-orange-400 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4 text-gray-900">
            Stop Fighting Your Tools
          </h2>
          <p className="text-2xl text-gray-700 max-w-3xl mx-auto">
            You didn't become a creator to spend your life managing subscriptions and switching contexts.
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* OLD WAY - Left Column */}
          <div className="relative">
            <div className="card bg-white/90 backdrop-blur-sm border-2 border-red-300 shadow-2xl hover:shadow-red-200 transition-all">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 -mx-6 -mt-6 mb-6 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold">THE OLD WAY</h3>
                  <span className="text-4xl">😤</span>
                </div>
                <p className="text-red-100 text-sm mt-1">The tool-juggling nightmare</p>
              </div>

              {/* List Items */}
              <div className="space-y-4">
                {oldWayItems.map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 ${
                      item.emphasis ? 'bg-red-50 -mx-6 px-6 py-3 border-l-4 border-red-500' : ''
                    }`}
                  >
                    <span className={`text-2xl flex-shrink-0 ${item.large ? 'text-3xl' : ''}`}>
                      ❌
                    </span>
                    <div className="flex-1">
                      <p className={`${
                        item.large 
                          ? 'text-2xl font-bold text-red-700' 
                          : item.emphasis 
                            ? 'text-lg font-semibold text-red-700' 
                            : 'text-lg text-gray-700'
                      }`}>
                        {item.text}
                      </p>
                    </div>
                    <span className={`text-2xl ${item.large ? 'text-3xl' : ''}`}>
                      {item.icon}
                    </span>
                  </div>
                ))}
              </div>

              {/* Pain Point Callout */}
              <div className="mt-6 p-4 bg-red-100 border-2 border-red-300 rounded-lg">
                <p className="text-center text-red-800 font-semibold">
                  ⏰ The average creator wastes <span className="text-2xl font-bold">20+ hours/week</span> on tool management
                </p>
              </div>
            </div>

            {/* VS Badge - Desktop */}
            <div className="hidden lg:block absolute -right-8 top-1/2 transform -translate-y-1/2 z-20">
              <div className="bg-gradient-to-br from-vault-purple to-vault-blue text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-2xl border-4 border-white">
                VS
              </div>
            </div>

            {/* VS Badge - Mobile */}
            <div className="lg:hidden flex justify-center my-6">
              <div className="bg-gradient-to-br from-vault-purple to-vault-blue text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-xl border-4 border-white">
                VS
              </div>
            </div>
          </div>

          {/* THE VAUNTICO WAY - Right Column */}
          <div className="relative">
            <div className="card bg-white/90 backdrop-blur-sm border-2 border-green-300 shadow-2xl hover:shadow-green-200 transition-all">
              {/* Header */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 -mx-6 -mt-6 mb-6 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold">THE VAUNTICO WAY</h3>
                  <span className="text-4xl">⚡</span>
                </div>
                <p className="text-green-100 text-sm mt-1">The Creator OS that actually ships</p>
              </div>

              {/* List Items */}
              <div className="space-y-4">
                {newWayItems.map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 ${
                      item.emphasis ? 'bg-green-50 -mx-6 px-6 py-3 border-l-4 border-green-500' : ''
                    }`}
                  >
                    <span className={`text-2xl flex-shrink-0 ${item.large ? 'text-3xl' : ''}`}>
                      ✅
                    </span>
                    <div className="flex-1">
                      <p className={`${
                        item.large 
                          ? 'text-2xl font-bold text-green-700' 
                          : item.emphasis 
                            ? 'text-lg font-semibold text-green-700' 
                            : 'text-lg text-gray-700'
                      }`}>
                        {item.text}
                      </p>
                    </div>
                    <span className={`text-2xl ${item.large ? 'text-3xl' : ''}`}>
                      {item.icon}
                    </span>
                  </div>
                ))}
              </div>

              {/* Value Proposition Callout */}
              <div className="mt-6 p-4 bg-green-100 border-2 border-green-300 rounded-lg">
                <p className="text-center text-green-800 font-semibold">
                  ⚡ Save <span className="text-2xl font-bold">$471/month</span> and get your time back
                </p>
              </div>

              {/* CTA Button */}
              <div className="mt-6 text-center">
                <Link
                  to="/pricing"
                  onClick={handleCTAClick}
                  className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2 w-full justify-center shadow-xl hover:shadow-2xl hover:scale-105 transform transition-all"
                >
                  Stop Juggling. Start Shipping
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <p className="text-gray-500 text-sm mt-3">
                  14-day free trial • Cancel anytime
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats Bar */}
        <div className="bg-white rounded-xl shadow-xl p-8 border-2 border-vault-purple/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="border-b md:border-b-0 md:border-r border-gray-200 pb-6 md:pb-0">
              <div className="text-5xl font-bold text-gradient mb-2">94%</div>
              <div className="text-gray-600">Less tool fatigue</div>
              <div className="text-sm text-gray-500 mt-1">reported by creators</div>
            </div>
            <div className="border-b md:border-b-0 md:border-r border-gray-200 pb-6 md:pb-0">
              <div className="text-5xl font-bold text-gradient mb-2">10x</div>
              <div className="text-gray-600">Faster shipping</div>
              <div className="text-sm text-gray-500 mt-1">from idea to live</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-gradient mb-2">$471</div>
              <div className="text-gray-600">Average monthly savings</div>
              <div className="text-sm text-gray-500 mt-1">vs. tool stack</div>
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Trusted by 2,500+ creators who switched from the old way</p>
          <div className="flex justify-center items-center gap-2 flex-wrap">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-yellow-400 text-2xl">★</span>
            ))}
            <span className="text-gray-700 font-semibold ml-2">4.9/5 average rating</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default OldWayVsNewWay
