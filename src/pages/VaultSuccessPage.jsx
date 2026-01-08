import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import SEO from '../components/SEO'

export default function VaultSuccessPage() {
  const [showConfetti, setShowConfetti] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Trigger confetti animation
    const timer1 = setTimeout(() => setShowConfetti(true), 500)
    const timer2 = setTimeout(() => setShowSuccess(true), 1000)

    // Track success page visit
    if (window.VaunticoAnalytics && window.VaunticoAnalytics.trackEvent) {
      window.VaunticoAnalytics.trackEvent('vault_success_page_view')
    }

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [])

  const nextSteps = [
    {
      icon: '🔑',
      title: 'Explore Your Vault',
      description: 'Access premium templates, workflows, and brand assets',
      action: 'Browse Vault',
      link: '/prompt-vault'
    },
    {
      icon: '⭐',
      title: 'Ascend to Creator Pass',
      description: 'Unlock unlimited access, AI tools, and scroll creation',
      action: 'View Covenants',
      link: '/creator-pass'
    },
    {
      icon: '📈',
      title: 'Track Your Progress',
      description: 'Monitor your trust score and creator metrics',
      action: 'View Dashboard',
      link: '/dashboard/trust-score'
    },
    {
      icon: '💬',
      title: 'Join the Community',
      description: 'Connect with 2,500+ creators scaling their legacy',
      action: 'Learn More',
      link: '/vaults'
    }
  ]

  return (
    <>
      <SEO
        title="Vault Unlocked - Welcome to Vauntico | Access Granted"
        description="Congratulations! Your vault access has been confirmed. Explore premium templates, workflows, and join thousands of creators scaling their legacy."
        canonical="/workshop-kit/success"
      />

      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-purple-900">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-green-400 rounded-full animate-pulse delay-300"></div>
          <div className="absolute top-1/2 left-3/4 w-3 h-3 bg-yellow-400 rounded-full animate-pulse delay-700"></div>
        </div>

        <div className="relative z-10 px-6 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Hero Success Section */}
            <div className="text-center mb-16">
              <div className={`transition-all duration-1000 ${showSuccess ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                <div className="text-6xl mb-6 animate-bounce">🎉</div>
                <h1 className="text-5xl font-bold text-vauntico-gold mb-4 animate-fade-in">
                  Vault Unlocked! Welcome to the Covenant.
                </h1>
                <p className="text-xl text-gray-300 mb-6 leading-relaxed">
                  Your ascension begins now. Premium tools, curated workflows,<br/>
                  and your first step toward creative sovereignty awaits.
                </p>
                <div className="inline-block bg-gradient-to-r from-purple-600 to-green-600 text-white px-8 py-3 rounded-full font-bold text-lg shadow-2xl">
                  ✨ Ascension Confirmed ✨
                </div>
              </div>
            </div>

            {/* Success Animation */}
            {showConfetti && (
              <div className="text-center mb-12">
                <div className="flex justify-center space-x-4 text-4xl">
                  <span className="animate-bounce">⭐</span>
                  <span className="animate-bounce delay-100">🎊</span>
                  <span className="animate-bounce delay-200">🎉</span>
                  <span className="animate-bounce delay-300">🎊</span>
                  <span className="animate-bounce delay-400">⭐</span>
                </div>
              </div>
            )}

            {/* What's Included Card */}
            <div className={`card bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-purple-500/30 mb-12 transition-all duration-1000 ${showSuccess ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <h2 className="text-2xl font-bold text-center text-vauntico-gold mb-6">
                Your Vault Contains:
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-purple-500/10 rounded-lg">
                  <div className="text-3xl mb-2">📱</div>
                  <h3 className="font-semibold mb-1">Mobile Templates</h3>
                  <p className="text-sm text-gray-400">CapCut + Canva workflows</p>
                </div>
                <div className="text-center p-4 bg-green-500/10 rounded-lg">
                  <div className="text-3xl mb-2">📋</div>
                  <h3 className="font-semibold mb-1">Content Plans</h3>
                  <p className="text-sm text-gray-400">7-day posting strategies</p>
                </div>
                <div className="text-center p-4 bg-yellow-500/10 rounded-lg">
                  <div className="text-3xl mb-2">🎨</div>
                  <h3 className="font-semibold mb-1">Brand Assets</h3>
                  <p className="text-sm text-gray-400">Ready-to-use graphics</p>
                </div>
                <div className="text-center p-4 bg-blue-500/10 rounded-lg">
                  <div className="text-3xl mb-2">🔄</div>
                  <h3 className="font-semibold mb-1">Automation Scripts</h3>
                  <p className="text-sm text-gray-400">Time-saving workflows</p>
                </div>
                <div className="text-center p-4 bg-pink-500/10 rounded-lg">
                  <div className="text-3xl mb-2">💰</div>
                  <h3 className="font-semibold mb-1">Monetization Guides</h3>
                  <p className="text-sm text-gray-400">Revenue optimization tips</p>
                </div>
                <div className="text-center p-4 bg-indigo-500/10 rounded-lg">
                  <div className="text-3xl mb-2">📈</div>
                  <h3 className="font-semibold mb-1">Growth Playbook</h3>
                  <p className="text-sm text-gray-400">Scale to 10K+ followers</p>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className={`transition-all duration-1000 delay-500 ${showSuccess ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <h2 className="text-3xl font-bold text-center mb-8 text-vauntico-gold">
                What Happens Next?
              </h2>
              <p className="text-center text-gray-300 mb-8 text-lg">
                Your ascension has just begun. Here's what's unlocked:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {nextSteps.map((step, index) => (
                  <Link
                    key={index}
                    to={step.link}
                    className="card bg-white/5 backdrop-blur-lg border border-white/10 hover:border-vauntico-gold/50 transition-all hover:scale-105"
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{step.icon}</div>
                      <div>
                        <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                        <p className="text-gray-400 mb-4">{step.description}</p>
                        <span className="inline-block bg-vauntico-gold text-black px-4 py-2 rounded font-semibold hover:bg-yellow-400 transition">
                          {step.action} →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Ascension CTA */}
              <div className="vault-gradient rounded-2xl p-8 text-center text-white">
                <h2 className="text-3xl font-bold mb-4">
                  Ready to Reach the Next Tier?
                </h2>
                <p className="text-xl mb-8 opacity-90">
                  Join 2,500+ creators who've ascended with Creator Pass.<br/>
                  Unlimited tools, AI workflows, and expert guidance await.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/creator-pass"
                    className="bg-white text-purple-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-lg transition-all text-lg shadow-lg"
                  >
                    View Creator Covenants →
                  </Link>
                  <button
                    onClick={() => navigate('/prompt-vault')}
                    className="border-2 border-white text-white hover:bg-white hover:text-purple-600 font-bold py-4 px-8 rounded-lg transition-all text-lg"
                  >
                    Explore Vault Now
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-16 text-center">
            <Link
              to="/"
              className="inline-block bg-white/10 text-white hover:bg-white/20 px-8 py-3 rounded-lg font-semibold transition-all"
            >
              Back to Homepage
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
