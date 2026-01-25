'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Navigation } from '../components/Navigation'
import { Footer } from '../components/Footer'
import { Button } from '../components/ui/Button'
import {
  CalculatorIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  UsersIcon,
  MessageSquareIcon,
  StarIcon,
  DownloadIcon,
  ShareIcon,
  ClockIcon,
  TargetIcon,
  HeartIcon
} from 'lucide-react'

// Scoring algorithm configuration
const SCORING_WEIGHTS = {
  followers: {
    weight: 25,
    multiplier: 0.00001, // 10,000 followers = 1 point
    maxPoints: 25
  },
  engagement: {
    weight: 30,
    maxPoints: 30
  },
  contentQuality: {
    weight: 35,
    maxPoints: 35
  },
  demographics: {
    weight: 10,
    multiplier: 0.001, // 1000 chars = 1 point
    maxPoints: 10
  }
}

interface ScoreCalculation {
  totalScore: number
  breakdown: {
    followers: number
    engagement: number
    contentQuality: number
    demographics: number
  }
  grade: 'F' | 'D' | 'C' | 'B' | 'A' | 'S'
  percentile: number
  recommendations: string[]
}

export default function TrustScoreCalculatorPage() {
  const [formData, setFormData] = useState({
    platform: '',
    followers: '',
    engagementRate: '',
    contentQuality: '5',
    audienceDemographics: ''
  })

  const [showReport, setShowReport] = useState(false)
  const [calculatingScore, setCalculatingScore] = useState(false)

  // Analytics tracking
  const trackEvent = useCallback((event: string, data: any) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event, data)
    }
    console.log('Analytics:', event, data)
  }, [])

  // Calculate trust score
  const calculateScore = useCallback((data: typeof formData): ScoreCalculation => {
    const followersNum = parseInt(data.followers) || 0
    const engagementNum = parseFloat(data.engagementRate) || 0
    const qualityNum = parseInt(data.contentQuality) || 5
    const demographicsLength = data.audienceDemographics.length || 0

    // Followers score (max 25 points)
    const followersScore = Math.min(
      SCORING_WEIGHTS.followers.maxPoints,
      (followersNum * SCORING_WEIGHTS.followers.multiplier) * SCORING_WEIGHTS.followers.weight
    )

    // Engagement score (max 30 points) - 0-100% maps to 0-30 points
    const engagementScore = Math.min(
      SCORING_WEIGHTS.engagement.maxPoints,
      (engagementNum / 100) * SCORING_WEIGHTS.engagement.weight
    )

    // Content quality score (max 35 points) - 1-10 rating maps to 0-35 points
    const qualityScore = Math.min(
      SCORING_WEIGHTS.contentQuality.maxPoints,
      ((qualityNum - 1) / 9) * SCORING_WEIGHTS.contentQuality.weight
    )

    // Demographics score (max 10 points)
    const demographicsScore = Math.min(
      SCORING_WEIGHTS.demographics.maxPoints,
      demographicsLength * SCORING_WEIGHTS.demographics.multiplier * SCORING_WEIGHTS.demographics.weight
    )

    const totalScore = Math.round(
      followersScore + engagementScore + qualityScore + demographicsScore
    )

    // Determine grade and percentile
    const grade = getGrade(totalScore)
    const percentile = getPercentile(totalScore)

    // Generate recommendations
    const recommendations = generateRecommendations({
      followers: followersNum,
      engagementRate: engagementNum,
      contentQuality: qualityNum,
      audienceDemographics: demographicsLength
    })

    return {
      totalScore,
      breakdown: {
        followers: Math.round(followersScore),
        engagement: Math.round(engagementScore),
        contentQuality: Math.round(qualityScore),
        demographics: Math.round(demographicsScore)
      },
      grade,
      percentile,
      recommendations
    }
  }, [])

  // Get letter grade
  const getGrade = (score: number): ScoreCalculation['grade'] => {
    if (score >= 95) return 'S'
    if (score >= 85) return 'A'
    if (score >= 75) return 'B'
    if (score >= 65) return 'C'
    if (score >= 55) return 'D'
    return 'F'
  }

  // Get percentile ranking
  const getPercentile = (score: number): number => {
    if (score >= 95) return 99
    if (score >= 85) return 85
    if (score >= 75) return 70
    if (score >= 65) return 55
    if (score >= 55) return 35
    if (score >= 45) return 20
    if (score >= 35) return 10
    return 5
  }

  // Generate personalized recommendations
  const generateRecommendations = (data: {
    followers: number,
    engagementRate: number,
    contentQuality: number,
    audienceDemographics: number
  }): string[] => {
    const recommendations = []

    if (data.followers < 1000) {
      recommendations.push('Grow your follower base through consistent posting and network building')
    }

    if (data.engagementRate < 2) {
      recommendations.push('Increase engagement by asking questions and creating interactive content')
    }

    if (data.contentQuality < 7) {
      recommendations.push('Improve content quality with better production values and storytelling')
    }

    if (data.audienceDemographics < 100) {
      recommendations.push('Develop detailed audience personas to create more targeted content')
    }

    // Always include these general recommendations
    recommendations.push('Post consistently to maintain algorithm visibility')
    recommendations.push('Engage with your audience through comments and DMs')
    recommendations.push('Collaborate with creators in your niche for cross-promotion')
    recommendations.push('Use analytics to understand what content performs best')

    return recommendations.slice(0, 6) // Return top 6 recommendations
  }

  // Memoized calculation
  const currentScore = useMemo(() => calculateScore(formData), [formData, calculateScore])

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    trackEvent('calculator_input_changed', {
      field,
      value: field === 'followers' || field === 'engagementRate' ? parseFloat(value) || 0 : value
    })
  }, [trackEvent])

  const handleCalculate = useCallback(() => {
    setCalculatingScore(true)

    // Simulate calculation delay for better UX
    setTimeout(() => {
      setShowReport(true)
      setCalculatingScore(false)

      trackEvent('score_calculated', {
        totalScore: currentScore.totalScore,
        grade: currentScore.grade,
        percentile: currentScore.percentile
      })
    }, 800)
  }, [currentScore, trackEvent])

  const handleDownloadReport = useCallback(() => {
    trackEvent('report_downloaded', {
      score: currentScore.totalScore,
      grade: currentScore.grade
    })

    // Simulate PDF download
    const reportData = {
      timestamp: new Date().toISOString(),
      platform: formData.platform,
      score: currentScore,
      inputs: formData
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json'
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trust-score-report-${currentScore.totalScore}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [currentScore, formData, trackEvent])

  const handleShareResults = useCallback(() => {
    trackEvent('results_shared', {
      score: currentScore.totalScore,
      grade: currentScore.grade
    })

    const shareText = `I just got a ${currentScore.totalScore}/100 Trust Score with grade ${currentScore.grade}! Check yours at https://vauntico.com/trust-score-calculator`

    if (navigator.share) {
      navigator.share({
        title: 'My Trust Score Results',
        text: shareText
      })
    } else {
      navigator.clipboard.writeText(shareText)
      // Could show toast notification here
    }
  }, [currentScore, trackEvent])

  return (
    <div className="min-h-screen bg-background-primary">
      <Navigation />

      <main className="pt-24 pb-16">
        {/* Header */}
        <div className="max-w-4xl mx-auto px-6 mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <CalculatorIcon className="w-16 h-16 text-accent-primary mx-auto mb-6" />
            <h1 className="text-4xl font-bold mb-4">Trust Score Calculator</h1>
            <p className="text-xl text-text-secondary mb-4">
              Discover your creator credibility score and get personalized recommendations
            </p>
            <div className="bg-accent-primary/5 border border-accent-primary/20 rounded-lg p-4 max-w-2xl mx-auto">
              <p className="text-sm text-accent-primary">
                <TargetIcon className="w-4 h-4 inline mr-2" />
                Algorithm: Followers + Engagement + Content Quality + Audience Demographics
              </p>
            </div>
          </motion.div>
        </div>

        <div className="max-w-6xl mx-auto px-6">
          {!showReport ? (
            <CalculatorInterface
              formData={formData}
              onInputChange={handleInputChange}
              onCalculate={handleCalculate}
              calculatingScore={calculatingScore}
              currentScore={currentScore}
            />
          ) : (
            <ReportInterface
              score={currentScore}
              formData={formData}
              onDownloadReport={handleDownloadReport}
              onShareResults={handleShareResults}
              onRecalculate={() => setShowReport(false)}
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

// Calculator Input Interface
function CalculatorInterface({
  formData,
  onInputChange,
  onCalculate,
  calculatingScore,
  currentScore
}: {
  formData: any
  onInputChange: (field: string, value: string) => void
  onCalculate: () => void
  calculatingScore: boolean
  currentScore: ScoreCalculation
}) {
  const isFormValid = formData.platform.trim().length > 0 &&
                     parseInt(formData.followers) > 0 &&
                     parseFloat(formData.engagementRate) > 0

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Input Form */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="space-y-6"
      >
        <div className="bg-background-surface border border-border-default rounded-xl p-8">
          <h2 className="text-2xl font-semibold mb-6">Enter Your Metrics</h2>

          <div className="space-y-6">
            {/* Platform */}
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="platform">
                Platform <span className="text-accent-warning">*</span>
              </label>
              <select
                id="platform"
                value={formData.platform}
                onChange={(e) => onInputChange('platform', e.target.value)}
                className="w-full px-4 py-3 bg-background-primary border border-border-default rounded-lg focus:border-accent-primary focus:outline-none"
                aria-label="Select your social media platform"
              >
                <option value="">Select Platform</option>
                <option value="twitter">Twitter</option>
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="youtube">YouTube</option>
                <option value="linkedin">LinkedIn</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Followers */}
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="followers">
                Follower Count <span className="text-accent-warning">*</span>
              </label>
              <input
                id="followers"
                type="number"
                min="0"
                value={formData.followers}
                onChange={(e) => onInputChange('followers', e.target.value)}
                className="w-full px-4 py-3 bg-background-primary border border-border-default rounded-lg focus:border-accent-primary focus:outline-none"
                placeholder="e.g., 25000"
                aria-label="Enter your follower count"
              />
            </div>

            {/* Engagement Rate */}
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="engagementRate">
                Engagement Rate (%) <span className="text-accent-warning">*</span>
              </label>
              <input
                id="engagementRate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.engagementRate}
                onChange={(e) => onInputChange('engagementRate', e.target.value)}
                className="w-full px-4 py-3 bg-background-primary border border-border-default rounded-lg focus:border-accent-primary focus:outline-none"
                placeholder="e.g., 2.5"
                aria-label="Enter your engagement rate percentage"
              />
              <p className="text-xs text-text-tertiary mt-1">
                Likes + comments + shares + saves divided by reach, multiplied by 100
              </p>
            </div>

            {/* Content Quality */}
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="contentQuality">
                Content Quality Rating (1-10)
              </label>
              <input
                id="contentQuality"
                type="range"
                min="1"
                max="10"
                value={formData.contentQuality}
                onChange={(e) => onInputChange('contentQuality', e.target.value)}
                className="w-full h-2 bg-border-default rounded-lg appearance-none cursor-pointer"
                aria-label="Rate your content quality from 1 to 10"
              />
              <div className="flex justify-between text-xs text-text-tertiary mt-2">
                <span>1 - Poor</span>
                <span className="font-medium text-accent-primary">{formData.contentQuality}/10</span>
                <span>10 - Exceptional</span>
              </div>
            </div>

            {/* Audience Demographics */}
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="audienceDemographics">
                Audience Demographics
              </label>
              <textarea
                id="audienceDemographics"
                value={formData.audienceDemographics}
                onChange={(e) => onInputChange('audienceDemographics', e.target.value)}
                className="w-full px-4 py-3 bg-background-primary border border-border-default rounded-lg focus:border-accent-primary focus:outline-none resize-none"
                rows={4}
                placeholder="Describe your audience: age groups, interests, location, profession, etc."
                aria-label="Describe your audience demographics"
              />
              <p className="text-xs text-text-tertiary mt-1">
                More detailed description improves your score accuracy
              </p>
            </div>
          </div>

          {/* Calculate Button */}
          <div className="mt-8">
            <Button
              variant="primary"
              size="lg"
              onClick={onCalculate}
              disabled={!isFormValid}
              className="w-full"
            >
              {calculatingScore ? (
                <>
                  <ClockIcon className="w-5 h-5 mr-2 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <CalculatorIcon className="w-5 h-5 mr-2" />
                  Calculate My Trust Score
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Live Preview */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="space-y-6"
      >
        <div className="bg-background-surface border border-border-default rounded-xl p-8">
          <h2 className="text-2xl font-semibold mb-6">Live Preview</h2>

          <AnimatePresence mode="wait">
            {formData.platform && parseInt(formData.followers) > 0 ? (
              <motion.div
                key="score"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center"
              >
                <div className="relative mb-6">
                  <div className="w-32 h-32 mx-auto bg-accent-primary/10 rounded-full flex items-center justify-center">
                    <div className="text-4xl font-bold text-accent-primary">
                      {currentScore.totalScore}
                    </div>
                    <div className="absolute -top-2 -right-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-accent-primary text-white">
                        {currentScore.grade}
                      </span>
                    </div>
                  </div>
                  <div className="text-text-secondary">Estimated Score</div>
                  <div className="text-sm text-text-tertiary mt-1">
                    Top {currentScore.percentile}% of creators
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-background-primary p-4 rounded-lg">
                    <UsersIcon className="w-6 h-6 text-accent-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold">{formData.followers || 0}</div>
                    <div className="text-xs text-text-secondary">Followers</div>
                  </div>
                  <div className="bg-background-primary p-4 rounded-lg">
                    <HeartIcon className="w-6 h-6 text-accent-success mx-auto mb-2" />
                    <div className="text-2xl font-bold">{formData.engagementRate || 0}%</div>
                    <div className="text-xs text-text-secondary">Engagement</div>
                  </div>
                </div>

                {!isFormValid && (
                  <div className="bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 rounded-lg p-4">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      Complete all required fields to see your full score breakdown
                    </p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <TargetIcon className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Enter Your Data</h3>
                <p className="text-text-secondary text-sm">
                  Fill in your creator metrics to see your live trust score
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Algorithm Explanation */}
        <div className="bg-background-surface border border-border-default rounded-xl p-6">
          <h3 className="font-semibold mb-4">How It Works</h3>
          <div className="space-y-3 text-sm text-text-secondary">
            <div className="flex justify-between">
              <span>Followers (25%)</span>
              <span className="text-accent-primary font-medium">
                {currentScore.breakdown?.followers || 0}/25 pts
              </span>
            </div>
            <div className="flex justify-between">
              <span>Engagement (30%)</span>
              <span className="text-accent-success font-medium">
                {currentScore.breakdown?.engagement || 0}/30 pts
              </span>
            </div>
            <div className="flex justify-between">
              <span>Content Quality (35%)</span>
              <span className="text-accent-warning font-medium">
                {currentScore.breakdown?.contentQuality || 0}/35 pts
              </span>
            </div>
            <div className="flex justify-between">
              <span>Audience Quality (10%)</span>
              <span className="text-accent-secondary font-medium">
                {currentScore.breakdown?.demographics || 0}/10 pts
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// Report Interface
function ReportInterface({
  score,
  formData,
  onDownloadReport,
  onShareResults,
  onRecalculate
}: {
  score: ScoreCalculation
  formData: any
  onDownloadReport: () => void
  onShareResults: () => void
  onRecalculate: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      {/* Score Display */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.6, delay: 0.2 }}
          className="w-48 h-48 mx-auto bg-gradient-to-br from-accent-primary to-accent-secondary rounded-full flex items-center justify-center mb-8 shadow-2xl"
        >
          <div className="text-center">
            <div className="text-6xl font-bold text-white mb-2">{score.totalScore}</div>
            <div className="text-xl text-white/90">Trust Score</div>
            <div className="text-sm text-white/75">Grade {score.grade}</div>
          </div>
        </motion.div>

        <h2 className="text-3xl font-bold mb-2">Your Trust Score Results</h2>
        <p className="text-xl text-text-secondary mb-8">
          You're in the top {score.percentile}% of creators on {formData.platform}
        </p>

        {/* Grade Indicator */}
        <div className="inline-flex items-center gap-2 bg-background-surface border border-border-default rounded-full px-6 py-3 mb-8">
          <StarIcon className={`w-6 h-6 ${
            score.grade === 'S' ? 'text-yellow-500' :
            score.grade === 'A' ? 'text-green-500' :
            score.grade === 'B' ? 'text-blue-500' :
            'text-gray-500'
          }`} />
          <span className="text-lg font-semibold">
            {score.grade === 'S' && 'Exceptional Creator'}
            {score.grade === 'A' && 'High Trust Creator'}
            {score.grade === 'B' && 'Established Creator'}
            {score.grade === 'C' && 'Growing Creator'}
            {score.grade === 'D' && 'Emerging Creator'}
            {score.grade === 'F' && 'New Creator'}
          </span>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-background-surface border border-border-default rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-6">Score Breakdown</h3>
          <div className="space-y-4">
            {Object.entries(score.breakdown).map(([key, value]) => {
              const maxPoints = SCORING_WEIGHTS[key as keyof typeof SCORING_WEIGHTS].maxPoints
              const percentage = (value / maxPoints) * 100

              return (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize font-medium">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="text-accent-primary font-semibold">{value}/{maxPoints}</span>
                  </div>
                  <div className="w-full bg-background-primary rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="bg-accent-primary h-2 rounded-full"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-background-surface border border-border-default rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-6">Recommendations</h3>
          <div className="space-y-3">
            {score.recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex items-start gap-3"
              >
                <TrendingUpIcon className="w-5 h-5 text-accent-success mt-0.5 flex-shrink-0" />
                <p className="text-sm">{rec}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Input Summary */}
      <div className="bg-background-surface border border-border-default rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-6">Your Input Summary</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-accent-primary mb-1">{formData.followers || 0}</div>
            <div className="text-sm text-text-secondary">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent-success mb-1">{formData.engagementRate || 0}%</div>
            <div className="text-sm text-text-secondary">Engagement</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent-warning mb-1">{formData.contentQuality}/10</div>
            <div className="text-sm text-text-secondary">Quality Rating</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent-secondary mb-1">
              {formData.audienceDemographics.length}
            </div>
            <div className="text-sm text-text-secondary">Description Chars</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Button variant="secondary" onClick={onDownloadReport}>
          <DownloadIcon className="w-4 h-4 mr-2" />
          Download Report
        </Button>
        <Button variant="secondary" onClick={onShareResults}>
          <ShareIcon className="w-4 h-4 mr-2" />
          Share Results
        </Button>
        <Button variant="primary" onClick={onRecalculate}>
          <CalculatorIcon className="w-4 h-4 mr-2" />
          Recalculate Score
        </Button>
      </div>

      {/* Creator Pass Integration */}
      <div className="bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 border border-accent-primary/20 rounded-xl p-6 text-center">
        <MessageSquareIcon className="w-10 h-10 text-accent-primary mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Ready to Improve Your Score?</h3>
        <p className="text-text-secondary mb-4">
          Unlock advanced creator tools and personalized growth strategies with Creator Pass
        </p>
        <Button variant="primary" href="/creator-pass">
          Get Creator Pass
        </Button>
      </div>
    </motion.div>
  )
}
