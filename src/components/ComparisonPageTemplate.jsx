import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import { trackCompetitorComparisonView, trackComparisonCTAClick } from '../utils/analytics'
import SEOHead from './SEOHead'

/**
 * ComparisonPageTemplate Component
 * 
 * Reusable template for competitor comparison pages (/vs/jasper, /vs/chatgpt, etc.)
 * Provides consistent structure while allowing customization for each competitor.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.competitorName - Name of competitor (e.g., "Jasper")
 * @param {string} props.heroTitle - H1 title for the page
 * @param {string} props.heroSubtitle - Subtitle explaining key difference
 * @param {Array} props.comparisonFeatures - Array of features to compare
 * @param {Object} props.strengths - What competitor does well
 * @param {Object} props.weaknesses - Where competitor falls short
 * @param {Object} props.howVaunticoDifferent - How Vauntico is different
 * @param {Object} props.whoShouldChoose - Who should choose each option
 * @param {Array} props.faqs - FAQ items
 * @param {Object} props.seo - SEO meta data
 */
function ComparisonPageTemplate({
  competitorName,
  heroTitle,
  heroSubtitle,
  comparisonFeatures,
  strengths,
  weaknesses,
  howVaunticoDifferent,
  whoShouldChoose,
  faqs,
  seo
}) {
  // Track competitor comparison page view
  useEffect(() => {
    trackCompetitorComparisonView(competitorName)
  }, [competitorName])

  const handleCTAClick = (ctaLocation) => {
    trackComparisonCTAClick(
      ctaLocation === 'hero' ? 'Try Vauntico Free' : 'Start Your Free Trial',
      '/pricing',
      competitorName
    )
  }

  return (
    <>
      {/* SEO Meta Tags */}
      {seo && (
        <SEOHead
          title={seo.title || `Vauntico vs ${competitorName}`}
          description={seo.description}
          canonicalUrl={seo.canonicalUrl || `https://vauntico.com${window.location.pathname}`}
          ogImage={seo.ogImage || 'https://vauntico.com/og-comparison.png'}
          type="article"
        />
      )}
      
      <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-vault-purple via-vault-blue to-vault-cyan text-white py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            {heroTitle}
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            {heroSubtitle}
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              to="/pricing"
              onClick={() => handleCTAClick('hero')}
              className="bg-white text-vault-purple hover:bg-gray-100 font-semibold py-4 px-8 rounded-lg text-lg transition-all shadow-xl hover:shadow-2xl"
            >
              Try Vauntico Free →
            </Link>
            <Link
              to="/"
              className="border-2 border-white text-white hover:bg-white hover:text-vault-purple font-semibold py-4 px-8 rounded-lg text-lg transition-all"
            >
              Learn More
            </Link>
          </div>
          <p className="text-sm mt-6 opacity-75">
            14-day free trial • No credit card required • Switch in minutes
          </p>
        </div>
      </section>

      {/* Quick Comparison Table */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">
            Quick Comparison
          </h2>
          
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-6 bg-gray-50 font-semibold">Feature</th>
                  <th className="text-center py-4 px-4 bg-gray-50 font-semibold">{competitorName}</th>
                  <th className="text-center py-4 px-4 bg-gradient-to-br from-vault-purple/10 to-vault-blue/10 font-semibold relative">
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-vault-purple text-white text-xs px-3 py-1 rounded-full">
                      ⚡ Better Choice
                    </div>
                    Vauntico
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((feature, index) => (
                  <tr
                    key={index}
                    className={`border-b border-gray-100 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    }`}
                  >
                    <td className="py-4 px-6 font-medium text-gray-900">
                      {feature.name}
                    </td>
                    <td className="text-center py-4 px-4">
                      <div className="flex flex-col items-center">
                        <span className={`text-3xl ${feature.competitor.color}`}>
                          {feature.competitor.icon}
                        </span>
                        {feature.competitor.note && (
                          <span className="text-xs text-gray-500 mt-1">
                            {feature.competitor.note}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="text-center py-4 px-4 bg-gradient-to-br from-vault-purple/5 to-vault-blue/5">
                      <div className="flex flex-col items-center">
                        <span className={`text-3xl ${feature.vauntico.color}`}>
                          {feature.vauntico.icon}
                        </span>
                        {feature.vauntico.note && (
                          <span className="text-xs text-gray-600 mt-1 font-medium">
                            {feature.vauntico.note}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Deep Dive Sections */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* What Competitor Does Well */}
          <div className="mb-16">
            <h2 className="text-4xl font-bold mb-8">
              What {competitorName} Does Well
            </h2>
            <div className="card">
              <div className="space-y-4">
                {strengths.points.map((point, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <span className="text-2xl text-green-500 flex-shrink-0">✓</span>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{point.title}</h3>
                      <p className="text-gray-600">{point.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Where Competitor Falls Short */}
          <div className="mb-16">
            <h2 className="text-4xl font-bold mb-8">
              Where {competitorName} Falls Short
            </h2>
            <div className="card bg-red-50 border-red-200">
              <div className="space-y-4">
                {weaknesses.points.map((point, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <span className="text-2xl text-red-500 flex-shrink-0">✗</span>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{point.title}</h3>
                      <p className="text-gray-700">{point.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* How Vauntico Is Different */}
          <div className="mb-16">
            <h2 className="text-4xl font-bold mb-8">
              How Vauntico Is Different
            </h2>
            <div className="card bg-gradient-to-br from-vault-purple/10 to-vault-blue/10 border-vault-purple/20">
              <div className="space-y-6">
                {howVaunticoDifferent.points.map((point, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-10 h-10 vault-gradient rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-2">{point.title}</h3>
                      <p className="text-gray-700 leading-relaxed">{point.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Who Should Choose What */}
          <div className="mb-16">
            <h2 className="text-4xl font-bold mb-8">
              Who Should Choose {competitorName} vs Vauntico?
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Choose Competitor */}
              <div className="card">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-3xl">{whoShouldChoose.competitor.icon}</span>
                  Choose {competitorName}
                </h3>
                <ul className="space-y-3">
                  {whoShouldChoose.competitor.points.map((point, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-gray-400 mt-1">•</span>
                      <span className="text-gray-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Choose Vauntico */}
              <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-green-300">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-3xl">{whoShouldChoose.vauntico.icon}</span>
                  Choose Vauntico
                </h3>
                <ul className="space-y-3">
                  {whoShouldChoose.vauntico.points.map((point, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-500 mt-1 font-bold">✓</span>
                      <span className="text-gray-700 font-medium">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="card">
                <h3 className="text-xl font-bold mb-3 flex items-start gap-2">
                  <span className="text-vault-purple">Q:</span>
                  {faq.question}
                </h3>
                <p className="text-gray-700 leading-relaxed pl-6">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-vault-purple via-vault-blue to-vault-cyan text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            See Why Creators Choose Vauntico
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join 2,500+ creators who switched from {competitorName} and never looked back.
          </p>
          <Link
            to="/pricing"
            onClick={() => handleCTAClick('final')}
            className="bg-white text-vault-purple hover:bg-gray-100 font-bold py-5 px-10 rounded-lg text-xl inline-flex items-center gap-2 shadow-2xl hover:shadow-3xl transition-all"
          >
            Start Your Free Trial
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <p className="text-sm mt-6 opacity-75">
            14-day free trial • No credit card required • Switch in minutes • Export from {competitorName} included
          </p>
        </div>
      </section>
    </div>
    </>
  )
}

export default ComparisonPageTemplate
