import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import { trackComparisonTableView, trackComparisonCTAClick } from '../utils/analytics'

/**
 * ComparisonTable Component
 * 
 * Competitive positioning table showing how Vauntico compares to major competitors.
 * Highlights Vauntico's unique value propositions:
 * - CLI Workflow
 * - One-Command Infrastructure
 * - No vendor lock-in
 * - Export everything
 * 
 * @component
 */
function ComparisonTable() {
  // Track when comparison table is viewed
  useEffect(() => {
    trackComparisonTableView(['Jasper', 'ChatGPT', 'Notion', 'Vauntico'])
  }, [])

  // Comparison data structure
  const competitors = [
    {
      name: 'Jasper',
      position: 'left',
      highlighted: false
    },
    {
      name: 'ChatGPT',
      position: 'left',
      highlighted: false
    },
    {
      name: 'Notion',
      position: 'left',
      highlighted: false
    },
    {
      name: 'Vauntico',
      position: 'right',
      highlighted: true,
      badge: '⚡ Creator OS'
    }
  ]

  const features = [
    {
      name: 'CLI Workflow',
      values: {
        'Jasper': { status: 'no', icon: '❌', color: 'text-red-500' },
        'ChatGPT': { status: 'no', icon: '❌', color: 'text-red-500' },
        'Notion': { status: 'no', icon: '❌', color: 'text-red-500' },
        'Vauntico': { status: 'yes', icon: '✅', color: 'text-green-500' }
      }
    },
    {
      name: 'One-Command Infrastructure',
      values: {
        'Jasper': { status: 'no', icon: '❌', color: 'text-red-500' },
        'ChatGPT': { status: 'no', icon: '❌', color: 'text-red-500' },
        'Notion': { status: 'no', icon: '❌', color: 'text-red-500' },
        'Vauntico': { status: 'yes', icon: '✅', color: 'text-green-500' }
      }
    },
    {
      name: 'Learns Your Voice',
      values: {
        'Jasper': { status: 'partial', icon: '⚠️', color: 'text-yellow-500', note: 'Templates only' },
        'ChatGPT': { status: 'no', icon: '❌', color: 'text-red-500' },
        'Notion': { status: 'no', icon: '❌', color: 'text-red-500' },
        'Vauntico': { status: 'yes', icon: '✅', color: 'text-green-500' }
      }
    },
    {
      name: 'Vault Organization',
      values: {
        'Jasper': { status: 'no', icon: '❌', color: 'text-red-500' },
        'ChatGPT': { status: 'no', icon: '❌', color: 'text-red-500' },
        'Notion': { status: 'yes', icon: '✅', color: 'text-green-500' },
        'Vauntico': { status: 'yes', icon: '✅', color: 'text-green-500' }
      }
    },
    {
      name: 'No Vendor Lock-in',
      values: {
        'Jasper': { status: 'no', icon: '❌', color: 'text-red-500' },
        'ChatGPT': { status: 'no', icon: '❌', color: 'text-red-500' },
        'Notion': { status: 'partial', icon: '⚠️', color: 'text-yellow-500', note: 'Limited export' },
        'Vauntico': { status: 'yes', icon: '✅', color: 'text-green-500' }
      }
    },
    {
      name: 'Export Everything',
      values: {
        'Jasper': { status: 'partial', icon: '⚠️', color: 'text-yellow-500', note: 'Copy/paste only' },
        'ChatGPT': { status: 'partial', icon: '⚠️', color: 'text-yellow-500', note: 'No history export' },
        'Notion': { status: 'partial', icon: '⚠️', color: 'text-yellow-500', note: 'Markdown only' },
        'Vauntico': { status: 'yes', icon: '✅', color: 'text-green-500' }
      }
    },
    {
      name: 'Monthly Cost',
      values: {
        'Jasper': { status: 'price', text: '$49+', color: 'text-gray-700', subtext: 'per month' },
        'ChatGPT': { status: 'price', text: '$20+', color: 'text-gray-700', subtext: 'per month' },
        'Notion': { status: 'price', text: 'Free-$10', color: 'text-gray-700', subtext: 'per month' },
        'Vauntico': { status: 'price', text: '$29', color: 'text-vault-purple font-bold', subtext: 'per month', badge: 'Best Value' }
      }
    }
  ]

  const handleCTAClick = () => {
    trackComparisonCTAClick('Start Free Trial', '/pricing')
  }

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold mb-4">
            How Vauntico Compares
          </h2>
          <p className="text-2xl text-gray-600 max-w-3xl mx-auto">
            Stop paying for 10 tools. Start creating with one OS.
          </p>
        </div>

        {/* Comparison Table - Desktop View */}
        <div className="hidden lg:block">
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-6 px-6 font-semibold text-gray-700 bg-gray-50">
                    Feature
                  </th>
                  {competitors.map((competitor) => (
                    <th
                      key={competitor.name}
                      className={`text-center py-6 px-4 font-semibold ${
                        competitor.highlighted
                          ? 'bg-gradient-to-br from-vault-purple/10 to-vault-blue/10 relative'
                          : 'bg-gray-50'
                      }`}
                    >
                      {competitor.highlighted && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-vault-purple text-white text-xs px-3 py-1 rounded-full whitespace-nowrap shadow-lg">
                          {competitor.badge}
                        </div>
                      )}
                      <div className="text-lg">{competitor.name}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {features.map((feature, index) => (
                  <tr
                    key={feature.name}
                    className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    }`}
                  >
                    <td className="py-5 px-6 font-medium text-gray-900">
                      {feature.name}
                    </td>
                    {competitors.map((competitor) => {
                      const value = feature.values[competitor.name]
                      return (
                        <td
                          key={competitor.name}
                          className={`text-center py-5 px-4 ${
                            competitor.highlighted
                              ? 'bg-gradient-to-br from-vault-purple/5 to-vault-blue/5'
                              : ''
                          }`}
                        >
                          {value.status === 'price' ? (
                            <div>
                              <div className={`text-xl ${value.color}`}>
                                {value.text}
                              </div>
                              <div className="text-sm text-gray-500">
                                {value.subtext}
                              </div>
                              {value.badge && (
                                <div className="mt-1">
                                  <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                                    {value.badge}
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <span className={`text-3xl ${value.color}`}>
                                {value.icon}
                              </span>
                              {value.note && (
                                <span className="text-xs text-gray-500 mt-1">
                                  {value.note}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Comparison Table - Mobile View (Horizontal Scroll) */}
        <div className="lg:hidden overflow-x-auto relative">
          {/* Scroll indicators */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-100 to-transparent pointer-events-none z-10" aria-hidden="true"></div>
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-100 to-transparent pointer-events-none z-10" aria-hidden="true"></div>
          
          <div className="card min-w-[800px] shadow-inner">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-700 bg-gray-50 sticky left-0 z-10">
                    Feature
                  </th>
                  {competitors.map((competitor) => (
                    <th
                      key={competitor.name}
                      className={`text-center py-4 px-3 font-semibold text-sm ${
                        competitor.highlighted
                          ? 'bg-gradient-to-br from-vault-purple/10 to-vault-blue/10 relative'
                          : 'bg-gray-50'
                      }`}
                    >
                      {competitor.highlighted && (
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-vault-purple text-white text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap">
                          {competitor.badge}
                        </div>
                      )}
                      <div className="text-sm">{competitor.name}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {features.map((feature, index) => (
                  <tr
                    key={feature.name}
                    className={`border-b border-gray-100 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    }`}
                  >
                    <td className="py-3 px-4 font-medium text-sm text-gray-900 sticky left-0 z-10 bg-inherit">
                      {feature.name}
                    </td>
                    {competitors.map((competitor) => {
                      const value = feature.values[competitor.name]
                      return (
                        <td
                          key={competitor.name}
                          className={`text-center py-3 px-3 ${
                            competitor.highlighted
                              ? 'bg-gradient-to-br from-vault-purple/5 to-vault-blue/5'
                              : ''
                          }`}
                        >
                          {value.status === 'price' ? (
                            <div>
                              <div className={`text-base ${value.color}`}>
                                {value.text}
                              </div>
                              {value.badge && (
                                <div className="text-[10px] text-green-600 mt-0.5">
                                  {value.badge}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div>
                              <span className={`text-2xl ${value.color}`}>
                                {value.icon}
                              </span>
                            </div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-center mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-gray-700 font-medium">
              👉 <span className="font-bold">Swipe left/right</span> to see all competitors
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12">
          <Link
            to="/pricing"
            onClick={handleCTAClick}
            className="btn-primary text-xl px-10 py-5 inline-flex items-center gap-2 shadow-xl hover:shadow-2xl"
          >
            Start Free Trial
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <p className="text-gray-500 mt-4">
            14-day free trial • No credit card required • Full Creator OS access
          </p>
        </div>

        {/* Additional Context */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="card bg-gradient-to-br from-green-50 to-white border-green-200">
            <div className="text-3xl mb-3">💰</div>
            <h3 className="font-bold text-lg mb-2">Save $500+/month</h3>
            <p className="text-gray-600 text-sm">
              Replace Jasper, ChatGPT Plus, Notion, Webflow, and more with one unified platform.
            </p>
          </div>
          <div className="card bg-gradient-to-br from-blue-50 to-white border-blue-200">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-bold text-lg mb-2">Ship 10x Faster</h3>
            <p className="text-gray-600 text-sm">
              One command generates complete infrastructure. Stop context-switching between 10 tools.
            </p>
          </div>
          <div className="card bg-gradient-to-br from-purple-50 to-white border-purple-200">
            <div className="text-3xl mb-3">🔓</div>
            <h3 className="font-bold text-lg mb-2">Own Your Work</h3>
            <p className="text-gray-600 text-sm">
              Export everything. No vendor lock-in. Your content lives in your vault forever.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ComparisonTable
