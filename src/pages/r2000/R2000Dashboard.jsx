import { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'

export default function R2000Dashboard() {
  const [hasAccess, setHasAccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [paymentData, setPaymentData] = useState(null)
  const [progress, setProgress] = useState([])

  useEffect(() => {
    // Check payment status
    const checkAccess = () => {
      const payment = localStorage.getItem('vauntico_workshop_kit_payment')
      
      if (payment) {
        try {
          const data = JSON.parse(payment)
          setPaymentData(data)
          setHasAccess(true)
        } catch (error) {
          console.error('Error parsing payment data:', error)
          setHasAccess(false)
        }
      } else {
        setHasAccess(false)
      }
      
      setIsLoading(false)
    }

    // Load progress
    const loadProgress = () => {
      const savedProgress = localStorage.getItem('r2k_progress')
      if (savedProgress) {
        try {
          setProgress(JSON.parse(savedProgress))
        } catch (error) {
          console.error('Error loading progress:', error)
          setProgress([])
        }
      }
    }

    checkAccess()
    loadProgress()
  }, [])

  // Redirect if no access
  if (!isLoading && !hasAccess) {
    return <Navigate to="/workshop-kit" replace />
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🦄</div>
          <p className="text-xl text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const completedDays = progress.length
  const percentComplete = Math.round((completedDays / 60) * 100)
  const currentPhase = completedDays <= 20 ? 'foundation' : completedDays <= 40 ? 'monetization' : 'scale'

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-green-50">
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 via-vault-purple to-green-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🦄</div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Welcome to The R2,000 Challenge!
            </h1>
            <p className="text-xl opacity-90">
              Your 60-day journey to R2,000/month starts now
            </p>
          </div>

          {/* Progress Bar */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 max-w-2xl mx-auto border border-white/20">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold">Your Progress</span>
              <span className="font-bold">{completedDays}/60 Days</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-4 mb-3">
              <div 
                className="bg-green-400 h-4 rounded-full transition-all duration-500"
                style={{ width: `${percentComplete}%` }}
              ></div>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{percentComplete}% Complete</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Dashboard */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          
          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            
            {/* Continue Learning */}
            <Link
              to={`/r2000-challenge/day/${completedDays + 1}`}
              className="bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-2xl p-8 hover:shadow-2xl transition-all transform hover:scale-105 group"
            >
              <div className="text-5xl mb-4">📱</div>
              <h3 className="text-2xl font-bold mb-2">
                {completedDays === 0 ? 'Start Day 1' : `Continue Day ${completedDays + 1}`}
              </h3>
              <p className="opacity-90 mb-4">
                {currentPhase === 'foundation' && 'Phase 1: Foundation'}
                {currentPhase === 'monetization' && 'Phase 2: Monetization'}
                {currentPhase === 'scale' && 'Phase 3: Scale to R2K'}
              </p>
              <div className="flex items-center gap-2 text-green-300 group-hover:gap-3 transition-all">
                <span>Continue Learning</span>
                <span>→</span>
              </div>
            </Link>

            {/* Bonuses */}
            <Link
              to="/r2000-challenge/bonuses"
              className="bg-gradient-to-br from-yellow-500 to-orange-600 text-white rounded-2xl p-8 hover:shadow-2xl transition-all transform hover:scale-105 group"
            >
              <div className="text-5xl mb-4">🎁</div>
              <h3 className="text-2xl font-bold mb-2">Bonuses</h3>
              <p className="opacity-90 mb-4">
                Templates, brands directory & resources
              </p>
              <div className="flex items-center gap-2 text-yellow-100 group-hover:gap-3 transition-all">
                <span>View Bonuses</span>
                <span>→</span>
              </div>
            </Link>

            {/* Community */}
            <a
              href="https://chat.whatsapp.com/YOUR_COMMUNITY_LINK"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-br from-green-500 to-green-700 text-white rounded-2xl p-8 hover:shadow-2xl transition-all transform hover:scale-105 group"
            >
              <div className="text-5xl mb-4">🦄</div>
              <h3 className="text-2xl font-bold mb-2">Community</h3>
              <p className="opacity-90 mb-4">
                Join Ubuntu R2K Creators Hub
              </p>
              <div className="flex items-center gap-2 text-green-100 group-hover:gap-3 transition-all">
                <span>Join WhatsApp</span>
                <span>→</span>
              </div>
            </a>
          </div>

          {/* Your Learning Path */}
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-12">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">Your 60-Day Journey</h2>
            
            <div className="space-y-6">
              
              {/* Phase 1: Foundation */}
              <div className={`border-2 rounded-xl p-6 transition-all ${
                completedDays < 20 ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-purple-900">
                      Phase 1: Foundation
                    </h3>
                    <p className="text-gray-600">Days 1-20</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-purple-600">
                      {Math.min(completedDays, 20)}/20
                    </p>
                    <p className="text-sm text-gray-600">Days Complete</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((completedDays / 20) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Phase 2: Monetization */}
              <div className={`border-2 rounded-xl p-6 transition-all ${
                completedDays >= 20 && completedDays < 40 ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-green-900">
                      Phase 2: Monetization
                    </h3>
                    <p className="text-gray-600">Days 21-40</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-green-600">
                      {Math.max(0, Math.min(completedDays - 20, 20))}/20
                    </p>
                    <p className="text-sm text-gray-600">Days Complete</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.max(0, Math.min(((completedDays - 20) / 20) * 100, 100))}%` }}
                  ></div>
                </div>
              </div>

              {/* Phase 3: Scale to R2K */}
              <div className={`border-2 rounded-xl p-6 transition-all ${
                completedDays >= 40 ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-yellow-900">
                      Phase 3: Scale to R2K
                    </h3>
                    <p className="text-gray-600">Days 41-60</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-yellow-600">
                      {Math.max(0, completedDays - 40)}/20
                    </p>
                    <p className="text-sm text-gray-600">Days Complete</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.max(0, ((completedDays - 40) / 20) * 100)}%` }}
                  ></div>
                </div>
              </div>

            </div>
          </div>

          {/* Resources Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Quick Links */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">Quick Links</h3>
              <div className="space-y-4">
                <Link 
                  to="/r2000-challenge/progress"
                  className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <span className="text-2xl">📊</span>
                  <div>
                    <p className="font-bold text-purple-900">Progress Tracker</p>
                    <p className="text-sm text-gray-600">View your completed lessons</p>
                  </div>
                </Link>
                
                <Link 
                  to="/r2000-challenge/bonuses"
                  className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
                >
                  <span className="text-2xl">🎁</span>
                  <div>
                    <p className="font-bold text-yellow-900">Bonuses (R2,588 value)</p>
                    <p className="text-sm text-gray-600">Templates & resources</p>
                  </div>
                </Link>
                
                <a 
                  href="https://chat.whatsapp.com/YOUR_COMMUNITY_LINK"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <span className="text-2xl">💬</span>
                  <div>
                    <p className="font-bold text-green-900">WhatsApp Community</p>
                    <p className="text-sm text-gray-600">Get support & share wins</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Support */}
            <div className="bg-gradient-to-br from-purple-900 to-green-900 text-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold mb-6">Need Help?</h3>
              <p className="mb-6 opacity-90">
                We're here to support you every step of the way on your journey to R2,000/month.
              </p>
              <div className="space-y-4">
                <a 
                  href="mailto:support@vauntico.com"
                  className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors"
                >
                  <span className="text-2xl">📧</span>
                  <div>
                    <p className="font-bold">Email Support</p>
                    <p className="text-sm opacity-75">support@vauntico.com</p>
                  </div>
                </a>
                
                <div className="p-4 bg-white/10 backdrop-blur-sm rounded-lg">
                  <p className="font-bold mb-2">🛡️ 60-Day Guarantee</p>
                  <p className="text-sm opacity-90">
                    Follow the system. If you don't make R2,000 in month 3, we'll refund every cent.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

    </div>
  )
}
