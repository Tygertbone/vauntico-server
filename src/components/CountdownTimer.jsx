import { useState, useEffect } from 'react'

export default function CountdownTimer({ deadline = null, title = "Limited Time Offer" }) {
  // If no deadline provided, set to 7 days from first visit
  const getDeadline = () => {
    if (deadline) return new Date(deadline)
    
    const stored = localStorage.getItem('vauntico_countdown_deadline')
    if (stored) return new Date(stored)
    
    // Set deadline to 7 days from now
    const newDeadline = new Date()
    newDeadline.setDate(newDeadline.getDate() + 7)
    localStorage.setItem('vauntico_countdown_deadline', newDeadline.toISOString())
    return newDeadline
  }

  const [timeLeft, setTimeLeft] = useState({})
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const targetDate = getDeadline()

    const calculateTimeLeft = () => {
      const difference = targetDate - new Date()

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        }
      } else {
        setIsExpired(true)
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0
        }
      }
    }

    // Initial calculation
    setTimeLeft(calculateTimeLeft())

    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [deadline])

  if (isExpired) {
    return (
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl p-6 text-center shadow-lg">
        <div className="text-4xl mb-2">⏰</div>
        <p className="text-xl font-bold mb-2">Offer Expired</p>
        <p className="text-sm opacity-90">But you can still join at regular price!</p>
      </div>
    )
  }

  const formatNumber = (num) => String(num).padStart(2, '0')

  return (
    <div className="bg-gradient-to-r from-purple-600 to-green-600 text-white rounded-2xl p-6 shadow-2xl">
      <div className="text-center mb-4">
        <div className="text-3xl mb-2">⏰</div>
        <h3 className="text-2xl font-bold mb-1">{title}</h3>
        <p className="text-sm opacity-90">Next cohort starts soon - don't miss out!</p>
      </div>

      {/* Countdown Display */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
          <div className="text-4xl font-bold mb-1">{formatNumber(timeLeft.days)}</div>
          <div className="text-xs uppercase opacity-80">Days</div>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
          <div className="text-4xl font-bold mb-1">{formatNumber(timeLeft.hours)}</div>
          <div className="text-xs uppercase opacity-80">Hours</div>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
          <div className="text-4xl font-bold mb-1">{formatNumber(timeLeft.minutes)}</div>
          <div className="text-xs uppercase opacity-80">Mins</div>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
          <div className="text-4xl font-bold mb-1 animate-pulse">{formatNumber(timeLeft.seconds)}</div>
          <div className="text-xs uppercase opacity-80">Secs</div>
        </div>
      </div>

      {/* Urgency Message */}
      <div className="bg-yellow-400 text-gray-900 rounded-lg p-3 text-center">
        <p className="font-bold text-sm">
          🔥 Join now to start with the next cohort!
        </p>
      </div>

      {/* CTA */}
      <div className="mt-4 text-center">
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault()
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          className="inline-block bg-white text-purple-600 hover:bg-gray-100 px-8 py-3 rounded-full font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          🚀 Secure My Spot Now
        </a>
      </div>
    </div>
  )
}
