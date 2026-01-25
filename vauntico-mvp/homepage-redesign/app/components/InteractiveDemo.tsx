'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

export function InteractiveDemo() {
  const [formData, setFormData] = useState({
    posts: 20,
    engagement: 5.2,
    followers: 10000
  })
  const [showResults, setShowResults] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)

  const handleInputChange = (field: string, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const calculateTrustScore = () => {
    setIsCalculating(true)
    setShowResults(false)

    // Simulate AI calculation
    setTimeout(() => {
      setIsCalculating(false)
      setShowResults(true)
    }, 2000)
  }

  // Simple trust score calculation (for demo purposes)
  const trustScore = Math.min(100, Math.round(
    (formData.engagement * 15) +
    (formData.posts * 2) +
    (Math.log10(formData.followers) * 20) +
    20
  ))

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-accent-success'
    if (score >= 60) return 'text-accent-warning'
    return 'text-red-400'
  }

  const getScoreDescription = (score: number) => {
    if (score >= 80) return 'You have an excellent trust score!'
    if (score >= 60) return 'Your trust score is good, with room for improvement.'
    return 'Consider focusing on engagement to boost your trust score.'
  }

  return (
    <section className="py-20 md:py-32 px-6 bg-background-surface/50">
      <div className="max-w-4xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-semibold mb-4">
            Try It Yourself
          </h2>
          <p className="text-xl text-text-secondary">
            See AI automation in action
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="bg-background-primary border border-border-default rounded-xl p-8 md:p-12"
        >

          <h3 className="text-2xl font-semibold mb-6 text-center">
            {showResults ? 'Your Trust Score Results' : 'Calculate Your Trust Score'}
          </h3>

          {!showResults && (
            <form
              onSubmit={(e) => { e.preventDefault(); calculateTrustScore(); }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm text-text-secondary mb-2">
                  Monthly Content Posts
                </label>
                <input
                  type="number"
                  value={formData.posts}
                  onChange={(e) => handleInputChange('posts', parseInt(e.target.value) || 0)}
                  className="w-full bg-background-surface border border-border-default rounded-lg px-4 py-3 text-text-primary focus:border-accent-primary focus:outline-none transition-colors"
                  placeholder="e.g., 20"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2">
                  Average Engagement Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.engagement}
                  onChange={(e) => handleInputChange('engagement', parseFloat(e.target.value) || 0)}
                  className="w-full bg-background-surface border border-border-default rounded-lg px-4 py-3 text-text-primary focus:border-accent-primary focus:outline-none transition-colors"
                  placeholder="e.g., 5.2"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2">
                  Follower Count
                </label>
                <input
                  type="number"
                  value={formData.followers}
                  onChange={(e) => handleInputChange('followers', parseInt(e.target.value) || 0)}
                  className="w-full bg-background-surface border border-border-default rounded-lg px-4 py-3 text-text-primary focus:border-accent-primary focus:outline-none transition-colors"
                  placeholder="e.g., 10000"
                  min="0"
                />
              </div>

              <button
                type="submit"
                disabled={isCalculating}
                className={`w-full py-4 rounded-lg font-medium transition-all ${
                  isCalculating
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-accent-primary to-accent-primaryHover hover:scale-105 text-text-primary shadow-lg shadow-accent-primary/25'
                }`}
              >
                {isCalculating ? 'Calculating with AI...' : 'Calculate My Trust Score'}
              </button>
            </form>
          )}

          {/* Results */}
          {showResults && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="p-6 bg-background-surface border border-accent-success/20 rounded-lg text-center"
            >
              <div className="flex flex-col items-center gap-4 mb-4">
                <div className={`text-6xl md:text-7xl font-bold ${getScoreColor(trustScore)}`}>
                  {trustScore}
                </div>
                <div className="text-sm text-text-tertiary">Your Trust Score</div>
                <div className="text-sm text-text-secondary max-w-md">
                  {getScoreDescription(trustScore)}
                </div>
              </div>

              <div className="h-3 bg-border-default rounded-full overflow-hidden mb-6">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${trustScore}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className={`h-full rounded-full ${
                    trustScore >= 80 ? 'bg-accent-success' :
                    trustScore >= 60 ? 'bg-accent-warning' : 'bg-red-400'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-lg font-semibold text-accent-success">87%</div>
                  <div className="text-xs text-text-tertiary">Average Score</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-accent-primary">{trustScore >= 80 ? 'Above' : trustScore >= 60 ? 'At' : 'Below'}</div>
                  <div className="text-xs text-text-tertiary">Creator Average</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-accent-warning">+{Math.max(0, Math.round((trustScore - 70) * 0.5))}%</div>
                  <div className="text-xs text-text-tertiary">Conversion Boost</div>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <p className="text-text-secondary">
                  {trustScore >= 80
                    ? "Excellent! Your content builds strong trust with your audience."
                    : trustScore >= 60
                    ? "Good start! Focus on consistent posting and engagement to improve."
                    : "There's room for growth. AI recommends increasing your engagement rate and content frequency."
                  }
                </p>
              </div>

              <button
                onClick={() => setShowResults(false)}
                className="mt-6 px-6 py-2 bg-accent-primary hover:bg-accent-primaryHover text-text-primary rounded-lg transition-colors font-medium"
              >
                Try Different Numbers
              </button>
            </motion.div>
          )}

        </motion.div>

      </div>
    </section>
  )
}
