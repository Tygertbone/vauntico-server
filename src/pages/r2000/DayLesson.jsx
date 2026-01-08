import { useState, useEffect } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'

export default function DayLesson() {
  const { dayNumber } = useParams()
  const [hasAccess, setHasAccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isCompleted, setIsCompleted] = useState(false)
  const [progress, setProgress] = useState([])

  useEffect(() => {
    // Check payment access
    const checkAccess = () => {
      const payment = localStorage.getItem('vauntico_workshop_kit_payment')
      setHasAccess(!!payment)
      setIsLoading(false)
    }

    // Load progress
    const loadProgress = () => {
      const savedProgress = localStorage.getItem('r2k_progress')
      if (savedProgress) {
        try {
          const progressArray = JSON.parse(savedProgress)
          setProgress(progressArray)
          setIsCompleted(progressArray.includes(parseInt(dayNumber)))
        } catch (error) {
          console.error('Error loading progress:', error)
        }
      }
    }

    checkAccess()
    loadProgress()
  }, [dayNumber])

  // Mark day as complete
  const handleComplete = () => {
    const day = parseInt(dayNumber)
    const savedProgress = localStorage.getItem('r2k_progress')
    let progressArray = savedProgress ? JSON.parse(savedProgress) : []
    
    if (!progressArray.includes(day)) {
      progressArray.push(day)
      progressArray.sort((a, b) => a - b)
      localStorage.setItem('r2k_progress', JSON.stringify(progressArray))
      setIsCompleted(true)
      setProgress(progressArray)
      
      // Celebrate!
      alert(`🎉 Day ${day} Complete! Keep going!`)
    }
  }

  // Redirect if no access
  if (!isLoading && !hasAccess) {
    return <Navigate to="/workshop-kit" replace />
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">📱</div>
          <p className="text-xl text-gray-600">Loading lesson...</p>
        </div>
      </div>
    )
  }

  const day = parseInt(dayNumber)
  const phase = day <= 20 ? 'foundation' : day <= 40 ? 'monetization' : 'scale'
  const phaseColor = phase === 'foundation' ? 'purple' : phase === 'monetization' ? 'green' : 'yellow'
  
  // Placeholder lesson content (will be replaced with markdown later)
  const lessonTitle = `Day ${day}: Coming Soon`
  const lessonContent = `
    This lesson is currently being created.
    
    In the meantime, join the Ubuntu R2K Creators Hub on WhatsApp to connect with other creators!
  `

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-green-50">
      
      {/* Header */}
      <section className={`bg-gradient-to-r from-${phaseColor}-600 to-${phaseColor}-800 text-white py-12`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link 
            to="/r2000-challenge/dashboard"
            className="inline-flex items-center gap-2 mb-6 text-white/80 hover:text-white transition-colors"
          >
            <span>←</span>
            <span>Back to Dashboard</span>
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold">
              Day {day} of 60
            </span>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold capitalize">
              Phase: {phase}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {lessonTitle}
          </h1>
          
          <p className="text-xl opacity-90">
            Duration: 60 minutes
          </p>
        </div>
      </section>

      {/* Lesson Content */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          
          {/* Lesson Body */}
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
            <div className="prose prose-lg max-w-none">
              <h2>Today's Mission</h2>
              <p>{lessonContent}</p>
              
              <h2>Coming Soon</h2>
              <p>This lesson is being created. Check back soon!</p>
              
              <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6 mt-8">
                <p className="font-bold text-purple-900 mb-2">📱 In the Meantime:</p>
                <ul className="space-y-2 text-purple-800">
                  <li>Join the Ubuntu R2K Creators Hub on WhatsApp</li>
                  <li>Introduce yourself to the community</li>
                  <li>Share what you're excited to learn</li>
                  <li>Connect with other creators from your country</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mb-8">
            {day > 1 ? (
              <Link
                to={`/r2000-challenge/day/${day - 1}`}
                className="flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-xl font-bold transition-colors"
              >
                <span>←</span>
                <span>Previous Day</span>
              </Link>
            ) : (
              <div></div>
            )}

            {!isCompleted && (
              <button
                onClick={handleComplete}
                className={`px-8 py-3 bg-gradient-to-r from-${phaseColor}-600 to-${phaseColor}-700 hover:from-${phaseColor}-700 hover:to-${phaseColor}-800 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105`}
              >
                ✓ Mark as Complete
              </button>
            )}

            {isCompleted && (
              <div className="px-8 py-3 bg-green-100 text-green-800 rounded-xl font-bold flex items-center gap-2">
                <span>✓</span>
                <span>Completed!</span>
              </div>
            )}

            {day < 60 && (
              <Link
                to={`/r2000-challenge/day/${day + 1}`}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-colors"
              >
                <span>Next Day</span>
                <span>→</span>
              </Link>
            )}
          </div>

          {/* Progress Summary */}
          <div className="bg-gradient-to-br from-purple-900 to-green-900 text-white rounded-2xl p-8 text-center">
            <p className="text-3xl font-bold mb-2">{progress.length}/60 Days Complete</p>
            <p className="text-lg opacity-90 mb-4">
              {Math.round((progress.length / 60) * 100)}% of your journey to R2,000/month
            </p>
            <Link
              to="/r2000-challenge/dashboard"
              className="inline-block bg-white text-purple-600 px-8 py-3 rounded-full font-bold hover:bg-purple-50 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>

        </div>
      </section>

    </div>
  )
}
