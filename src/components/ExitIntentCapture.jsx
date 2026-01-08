import { useState, useEffect } from 'react'

function ExitIntentCapture() {
  const [isVisible, setIsVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Check if user has already dismissed or signed up
    const dismissed = localStorage.getItem('exitIntentDismissed')
    const captured = localStorage.getItem('exitIntentCaptured')
    
    if (dismissed || captured) {
      return
    }

    // Exit intent detection
    const handleMouseLeave = (e) => {
      // Only trigger when mouse leaves from top of viewport
      if (e.clientY <= 0 && !isDismissed) {
        setIsVisible(true)
      }
    }

    // Add delay before enabling exit intent (5 seconds on page)
    const timer = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave)
    }, 5000)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [isDismissed])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Track email capture
    if (window.gtag) {
      window.gtag('event', 'email_capture', {
        event_category: 'engagement',
        event_label: 'exit_intent_popup'
      })
    }
    
    // Store email (in production, send to backend)
    console.log('Email captured:', email)
    localStorage.setItem('exitIntentCaptured', 'true')
    localStorage.setItem('capturedEmail', email)
    
    // Show success message
    alert('Thanks! Check your email for exclusive creator tips.')
    setIsVisible(false)
  }

  const handleDismiss = () => {
    localStorage.setItem('exitIntentDismissed', 'true')
    setIsDismissed(true)
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 relative shadow-2xl animate-slide-up">
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
          aria-label="Close"
        >
          ×
        </button>

        {/* Content */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">⏰</div>
          <h2 className="text-3xl font-bold mb-3">
            Wait! Before You Go...
          </h2>
          <p className="text-gray-600 text-lg">
            Get our <strong>free Creator Toolkit</strong> + exclusive tips to 10x your content workflow
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vault-purple focus:border-transparent"
          />
          <button type="submit" className="btn-primary w-full text-lg py-3">
            Send Me the Toolkit →
          </button>
        </form>

        {/* Benefits */}
        <div className="mt-6 space-y-2 text-sm text-gray-600">
          <div className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            <span>5 proven content templates</span>
          </div>
          <div className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            <span>Weekly AI workflow tips</span>
          </div>
          <div className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            <span>Early access to new features</span>
          </div>
        </div>

        {/* Privacy */}
        <p className="mt-4 text-xs text-gray-500 text-center">
          No spam. Unsubscribe anytime. We respect your privacy.
        </p>
      </div>
    </div>
  )
}

export default ExitIntentCapture
