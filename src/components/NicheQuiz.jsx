import { useState } from 'react'

export default function NicheQuiz() {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)

  const questions = [
    {
      id: 'passion',
      question: "What topics could you talk about for hours? 💭",
      options: [
        { value: 'money', label: '💰 Money, investing, side hustles', niches: ['finance', 'entrepreneur'] },
        { value: 'beauty', label: '💄 Beauty, fashion, styling', niches: ['beauty', 'lifestyle'] },
        { value: 'tech', label: '📱 Tech, gadgets, apps', niches: ['tech', 'productivity'] },
        { value: 'comedy', label: '😂 Comedy, skits, entertainment', niches: ['comedy', 'entertainment'] },
        { value: 'food', label: '🍳 Cooking, recipes, food culture', niches: ['food', 'lifestyle'] },
        { value: 'fitness', label: '💪 Fitness, health, wellness', niches: ['fitness', 'lifestyle'] },
      ]
    },
    {
      id: 'experience',
      question: "What do people ask YOU for advice about? 🤔",
      options: [
        { value: 'making_money', label: 'Making money or starting businesses', niches: ['finance', 'entrepreneur'] },
        { value: 'looking_good', label: 'Looking good or dressing well', niches: ['beauty', 'fashion'] },
        { value: 'tech_help', label: 'Phone tips or tech troubleshooting', niches: ['tech', 'education'] },
        { value: 'entertainment', label: 'Making people laugh or storytelling', niches: ['comedy', 'entertainment'] },
        { value: 'cooking', label: 'Cooking or food recommendations', niches: ['food', 'lifestyle'] },
        { value: 'motivation', label: 'Motivation or personal development', niches: ['motivation', 'lifestyle'] },
      ]
    },
    {
      id: 'content_type',
      question: "Which content would you ENJOY creating? 🎬",
      options: [
        { value: 'tutorials', label: '📚 Tutorials & how-to guides', niches: ['education', 'tech'] },
        { value: 'reviews', label: '⭐ Product reviews & recommendations', niches: ['tech', 'beauty'] },
        { value: 'skits', label: '🎭 Skits & comedy videos', niches: ['comedy', 'entertainment'] },
        { value: 'tips', label: '💡 Tips & quick hacks', niches: ['finance', 'productivity'] },
        { value: 'vlogs', label: '📹 Daily vlogs & lifestyle', niches: ['lifestyle', 'entrepreneur'] },
        { value: 'motivational', label: '🔥 Motivational & inspirational', niches: ['motivation', 'fitness'] },
      ]
    },
    {
      id: 'goal',
      question: "What's your MAIN income goal? 💸",
      options: [
        { value: 'affiliate', label: 'Affiliate commissions (recommend products)', niches: ['tech', 'beauty', 'finance'] },
        { value: 'sponsorships', label: 'Brand sponsorships & partnerships', niches: ['lifestyle', 'beauty', 'fitness'] },
        { value: 'coaching', label: 'Coaching or consulting services', niches: ['finance', 'motivation', 'fitness'] },
        { value: 'products', label: 'Selling my own digital products', niches: ['education', 'entrepreneur', 'tech'] },
        { value: 'ads', label: 'Ad revenue from views', niches: ['comedy', 'entertainment', 'lifestyle'] },
        { value: 'mixed', label: 'All of the above!', niches: ['entrepreneur', 'lifestyle'] },
      ]
    }
  ]

  const nicheProfiles = {
    finance: {
      name: "Personal Finance Creator 💰",
      description: "Teach budgeting, investing, and money management to Africans building wealth.",
      earning_potential: "R3,000-R8,000/month",
      difficulty: "Medium",
      best_platforms: "TikTok, YouTube, Instagram",
      monetization: "Affiliate (banking apps, investment platforms), Courses, Coaching",
      african_angle: "Focus on mobile money, African investment platforms, local hustles",
      emoji: "💰"
    },
    beauty: {
      name: "Beauty & Fashion Creator 💄",
      description: "Share makeup tutorials, fashion tips, and product reviews for African markets.",
      earning_potential: "R2,500-R10,000/month",
      difficulty: "Easy",
      best_platforms: "Instagram, TikTok, YouTube",
      monetization: "Brand deals, Affiliate (beauty products), Sponsored posts",
      african_angle: "Highlight local brands, melanin-friendly products, African fashion",
      emoji: "💄"
    },
    tech: {
      name: "Tech Tips Creator 📱",
      description: "Teach phone tips, app reviews, and tech hacks for everyday Africans.",
      earning_potential: "R2,000-R6,000/month",
      difficulty: "Easy",
      best_platforms: "TikTok, YouTube, Instagram",
      monetization: "Affiliate (phones, apps, accessories), Sponsored content, Courses",
      african_angle: "Budget phones, data-saving tips, African fintech apps",
      emoji: "📱"
    },
    comedy: {
      name: "Comedy & Entertainment Creator 😂",
      description: "Make people laugh with skits, relatable jokes, and African humor.",
      earning_potential: "R1,500-R7,000/month",
      difficulty: "Medium",
      best_platforms: "TikTok, Instagram Reels, YouTube Shorts",
      monetization: "Brand deals, Ad revenue, Merchandise, Sponsored skits",
      african_angle: "African relatable humor, local language skits, cultural comedy",
      emoji: "😂"
    },
    entrepreneur: {
      name: "Business & Hustle Creator 🚀",
      description: "Share business tips, side hustle ideas, and entrepreneurship motivation.",
      earning_potential: "R3,500-R12,000/month",
      difficulty: "Hard",
      best_platforms: "YouTube, Instagram, TikTok",
      monetization: "Coaching, Digital products, Affiliate, Courses, Consulting",
      african_angle: "Local hustles, African business stories, mobile-first businesses",
      emoji: "🚀"
    },
    lifestyle: {
      name: "Lifestyle & Vlog Creator 🌟",
      description: "Document your life, share experiences, and build a personal brand.",
      earning_potential: "R2,000-R9,000/month",
      difficulty: "Medium",
      best_platforms: "Instagram, TikTok, YouTube",
      monetization: "Brand partnerships, Sponsored content, Affiliate, Ad revenue",
      african_angle: "African lifestyle, local experiences, cultural stories",
      emoji: "🌟"
    },
    education: {
      name: "Educational Content Creator 📚",
      description: "Teach skills, share knowledge, and help others learn new things.",
      earning_potential: "R2,500-R8,000/month",
      difficulty: "Medium",
      best_platforms: "YouTube, TikTok, Instagram",
      monetization: "Courses, Coaching, Affiliate (learning tools), Sponsorships",
      african_angle: "African education, local languages, practical skills",
      emoji: "📚"
    },
    motivation: {
      name: "Motivation & Growth Creator 🔥",
      description: "Inspire and motivate others with personal development content.",
      earning_potential: "R2,000-R7,000/month",
      difficulty: "Easy",
      best_platforms: "Instagram, TikTok, YouTube",
      monetization: "Coaching, Digital products, Speaking, Affiliate (books, courses)",
      african_angle: "Ubuntu philosophy, African success stories, community upliftment",
      emoji: "🔥"
    },
    fitness: {
      name: "Fitness & Wellness Creator 💪",
      description: "Share workout routines, health tips, and fitness motivation.",
      earning_potential: "R2,500-R8,000/month",
      difficulty: "Easy",
      best_platforms: "Instagram, TikTok, YouTube",
      monetization: "Coaching, Meal plans, Affiliate (supplements, equipment), Brand deals",
      african_angle: "Home workouts, African diets, budget fitness",
      emoji: "💪"
    }
  }

  const calculateNiche = () => {
    const nicheScores = {}
    
    // Count niche mentions across all answers
    Object.values(answers).forEach(answer => {
      answer.niches.forEach(niche => {
        nicheScores[niche] = (nicheScores[niche] || 0) + 1
      })
    })

    // Find top niche
    const topNiche = Object.entries(nicheScores)
      .sort(([,a], [,b]) => b - a)[0][0]

    setResult(nicheProfiles[topNiche])

    // Track completion
    if (window.VaunticoAnalytics && window.VaunticoAnalytics.trackEvent) {
      window.VaunticoAnalytics.trackEvent('niche_quiz_completed', {
        result: topNiche
      })
    }
  }

  const handleAnswer = (option) => {
    const newAnswers = {
      ...answers,
      [questions[currentStep].id]: option
    }
    setAnswers(newAnswers)

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Quiz complete - calculate result
      setTimeout(() => calculateNiche(), 500)
    }
  }

  const handleReset = () => {
    setCurrentStep(0)
    setAnswers({})
    setResult(null)
  }

  // Result Screen
  if (result) {
    return (
      <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-green-900 text-white rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="text-7xl mb-4">{result.emoji}</div>
          <h2 className="text-4xl font-bold mb-2">Your Perfect Niche:</h2>
          <p className="text-3xl text-green-300 font-bold">{result.name}</p>
        </div>

        <div className="space-y-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <p className="text-lg mb-4">{result.description}</p>
            
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-purple-300 font-semibold mb-1">💰 Earning Potential:</p>
                <p className="text-lg font-bold">{result.earning_potential}</p>
              </div>
              <div>
                <p className="text-purple-300 font-semibold mb-1">📊 Difficulty:</p>
                <p className="text-lg font-bold">{result.difficulty}</p>
              </div>
              <div>
                <p className="text-purple-300 font-semibold mb-1">📱 Best Platforms:</p>
                <p>{result.best_platforms}</p>
              </div>
              <div>
                <p className="text-purple-300 font-semibold mb-1">💸 Monetization:</p>
                <p>{result.monetization}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-500/20 rounded-xl p-6 border border-green-500/30">
            <p className="font-bold mb-2 text-green-300">🌍 Your African Angle:</p>
            <p>{result.african_angle}</p>
          </div>

          <div className="text-center space-y-4">
            <p className="text-lg font-semibold">
              Ready to build your {result.name.split(' ')[0]} empire?
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="#hero"
                onClick={(e) => {
                  e.preventDefault()
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-3 rounded-full font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                🚀 Join R2K Challenge Now
              </a>
              <button
                onClick={handleReset}
                className="bg-white/10 hover:bg-white/20 px-8 py-3 rounded-full font-bold transition-colors border border-white/30"
              >
                🔄 Retake Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Quiz Screen
  const currentQuestion = questions[currentStep]
  const progress = ((currentStep + 1) / questions.length) * 100

  return (
    <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-green-900 text-white rounded-2xl p-8 shadow-2xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold mb-2">🎯 Find Your Perfect Niche</h3>
        <p className="text-purple-200">Answer 4 quick questions to discover your ideal creator path</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm mb-2">
          <span>Question {currentStep + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-green-400 to-cyan-400 h-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="mb-8">
        <h4 className="text-2xl font-bold mb-6 text-center">{currentQuestion.question}</h4>
        
        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(option)}
              className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-4 text-left transition-all duration-200 border-2 border-white/20 hover:border-green-400 hover:shadow-lg transform hover:scale-105"
            >
              <span className="text-lg">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      {currentStep > 0 && (
        <div className="text-center">
          <button
            onClick={() => setCurrentStep(currentStep - 1)}
            className="text-purple-300 hover:text-white transition-colors text-sm"
          >
            ← Go Back
          </button>
        </div>
      )}
    </div>
  )
}
