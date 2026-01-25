'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Navigation } from '../components/Navigation'
import { Footer } from '../components/Footer'
import { Button } from '../components/ui/Button'
import { PaystackButton } from '../components/PaystackButton'

// Validation schemas
const trustScoreSchema = z.object({
  platform: z.string().min(1, "Platform name is required"),
  followers: z.number().min(0, "Followers must be 0 or more"),
  engagementRate: z.number().min(0).max(100, "Engagement rate must be between 0-100%"),
  contentQuality: z.number().min(1).max(10, "Content quality must be 1-10"),
  audienceDemographics: z.string().min(10, "Please describe your audience"),
})

const billingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  company: z.string().optional(),
  tier: z.enum(["starter", "pro", "enterprise"]),
  billingCycle: z.enum(["monthly", "annual"]),
})

type TrustScoreForm = z.infer<typeof trustScoreSchema>
type BillingForm = z.infer<typeof billingSchema>

export default function CreatorPassPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedTier, setSelectedTier] = useState<'starter' | 'pro' | 'enterprise' | null>(null)
  const [calculatedScore, setCalculatedScore] = useState<number | null>(null)

  // Analytics tracking
  const trackEvent = (event: string, data: any) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event, data)
    }
    console.log('Analytics:', event, data)
  }

  const steps = [
    { number: 1, title: "Choose Your Tier", description: "Select the plan that fits your needs" },
    { number: 2, title: "Trust Score Calculator", description: "Get your personalized trust score" },
    { number: 3, title: "Billing Information", description: "Complete your subscription" },
    { number: 4, title: "Confirmation", description: "You're all set!" }
  ]

  const tiers = [
    {
      id: 'starter' as const,
      name: 'Starter',
      price: { monthly: 29, annual: 290 },
      description: 'Perfect for individual creators getting started',
      features: [
        'Basic trust score analysis',
        'Email automation templates',
        'Community support',
        'Basic reporting'
      ]
    },
    {
      id: 'pro' as const,
      name: 'Pro',
      price: { monthly: 79, annual: 790 },
      description: 'For serious creators building their brand',
      features: [
        'Advanced trust score calculator',
        'Unlimited automation workflows',
        'Priority support',
        'Advanced analytics',
        'Custom integrations'
      ]
    },
    {
      id: 'enterprise' as const,
      name: 'Enterprise',
      price: { monthly: null, annual: null },
      description: 'For agencies and large creator teams',
      features: [
        'Everything in Pro',
        'White-label solutions',
        'Dedicated account manager',
        'Custom development',
        'SLA guarantees'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-background-primary">
      <Navigation />

      <main className="pt-24 pb-16">
        {/* Progress Indicator */}
        <div className="max-w-4xl mx-auto px-6 mb-12">
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                  step.number <= currentStep
                    ? 'bg-accent-primary border-accent-primary text-text-primary'
                    : 'border-border-default text-text-tertiary'
                }`}>
                  {step.number}
                </div>
                <div className="ml-4 hidden md:block">
                  <div className={`text-sm font-medium ${
                    step.number <= currentStep ? 'text-text-primary' : 'text-text-tertiary'
                  }`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-text-tertiary">
                    {step.description}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-px mx-4 transition-colors ${
                    step.number < currentStep ? 'bg-accent-primary' : 'bg-border-default'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-4xl mx-auto px-6">
          {currentStep === 1 && (
            <Step1TierSelection
              tiers={tiers}
              selectedTier={selectedTier}
              onSelectTier={(tier) => {
                setSelectedTier(tier)
                trackEvent('tier_selected', { tier_name: tier })
              }}
              onNext={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 2 && (
            <Step2TrustScoreCalculator
              onCalculate={setCalculatedScore}
              onNext={() => setCurrentStep(3)}
              onBack={() => setCurrentStep(1)}
            />
          )}

          {currentStep === 3 && (
            <Step3Billing
              selectedTier={selectedTier!}
              onSubmit={(data) => {
                trackEvent('subscription_started', {
                  tier: selectedTier,
                  email: data.email
                })
                setCurrentStep(4)
              }}
              onBack={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 4 && (
            <Step4Confirmation
              selectedTier={selectedTier!}
              calculatedScore={calculatedScore}
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

// Step Components
function Step1TierSelection({
  tiers,
  selectedTier,
  onSelectTier,
  onNext
}: {
  tiers: any[],
  selectedTier: string | null,
  onSelectTier: (tier: any) => void,
  onNext: () => void
}) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Choose Your Creator Pass</h1>
        <p className="text-xl text-text-secondary">
          Unlock advanced creator tools and skyrocket your trust score
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {tiers.map((tier) => (
          <motion.div
            key={tier.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative bg-background-surface border-2 rounded-xl p-6 cursor-pointer transition-all ${
              selectedTier === tier.id
                ? 'border-accent-primary shadow-lg shadow-accent-primary/20'
                : 'border-border-default hover:border-accent-primary/50'
            }`}
            onClick={() => onSelectTier(tier.id)}
          >
            {tier.id === 'pro' && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-accent-primary text-text-primary text-xs font-medium px-3 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
              <div className="flex items-baseline justify-center gap-2 mb-2">
                {tier.price.monthly ? (
                  <>
                    <span className="text-3xl font-bold">${tier.price.monthly}</span>
                    <span className="text-text-secondary">/month</span>
                  </>
                ) : (
                  <span className="text-2xl font-bold">Custom</span>
                )}
              </div>
              <p className="text-text-secondary text-sm">{tier.description}</p>
            </div>

            <ul className="space-y-3 mb-6">
              {tier.features.map((feature: string, index: number) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-accent-success mt-0.5">✓</span>
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              variant={selectedTier === tier.id ? 'primary' : 'secondary'}
              className="w-full"
              onClick={() => onSelectTier(tier.id)}
            >
              {selectedTier === tier.id ? 'Selected' : 'Select Plan'}
            </Button>
          </motion.div>
        ))}
      </div>

      {selectedTier && (
        <div className="text-center">
          <Button variant="primary" size="lg" onClick={onNext}>
            Continue to Trust Score Calculator →
          </Button>
        </div>
      )}
    </div>
  )
}

function Step2TrustScoreCalculator({
  onCalculate,
  onNext,
  onBack
}: {
  onCalculate: (score: number) => void,
  onNext: () => void,
  onBack: () => void
}) {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<TrustScoreForm>({
    resolver: zodResolver(trustScoreSchema)
  })

  const watchedValues = watch()

  const calculateScore = (data: TrustScoreForm) => {
    // Simple algorithmic scoring
    const score = Math.min(100, Math.round(
      (data.followers / 10000 * 20) +
      (data.engagementRate * 0.8) +
      (data.contentQuality * 10) +
      (data.audienceDemographics.length / 100 * 10)
    ))
    return score
  }

  const onSubmit = (data: TrustScoreForm) => {
    const score = calculateScore(data)
    onCalculate(score)

    // Trigger analytics
    console.log('Trust score calculated:', score)

    onNext()
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Calculate Your Trust Score</h1>
        <p className="text-xl text-text-secondary">
          Get a personalized trust score to understand your creator credibility
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2" htmlFor="platform">
            Platform Name <span className="text-accent-warning">*</span>
          </label>
          <input
            {...register('platform')}
            id="platform"
            type="text"
            className="w-full px-4 py-3 bg-background-surface border border-border-default rounded-lg focus:border-accent-primary focus:outline-none"
            placeholder="e.g., Twitter, YouTube, LinkedIn"
          />
          {errors.platform && (
            <p className="mt-1 text-accent-warning text-sm" role="alert">{errors.platform.message}</p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="followers">
              Follower Count <span className="text-accent-warning">*</span>
            </label>
            <input
              {...register('followers', { valueAsNumber: true })}
              id="followers"
              type="number"
              className="w-full px-4 py-3 bg-background-surface border border-border-default rounded-lg focus:border-accent-primary focus:outline-none"
              placeholder="0"
            />
            {errors.followers && (
              <p className="mt-1 text-accent-warning text-sm" role="alert">{errors.followers.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="engagementRate">
              Engagement Rate (%) <span className="text-accent-warning">*</span>
            </label>
            <input
              {...register('engagementRate', { valueAsNumber: true })}
              id="engagementRate"
              type="number"
              step="0.1"
              min="0"
              max="100"
              className="w-full px-4 py-3 bg-background-surface border border-border-default rounded-lg focus:border-accent-primary focus:outline-none"
              placeholder="0.0"
            />
            {errors.engagementRate && (
              <p className="mt-1 text-accent-warning text-sm" role="alert">{errors.engagementRate.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" htmlFor="contentQuality">
            Content Quality (1-10) <span className="text-accent-warning">*</span>
          </label>
          <input
            {...register('contentQuality', { valueAsNumber: true })}
            id="contentQuality"
            type="range"
            min="1"
            max="10"
            className="w-full"
          />
          <div className="flex justify-between text-xs text-text-tertiary mt-1">
            <span>Poor</span>
            <span>Exceptional</span>
          </div>
          {errors.contentQuality && (
            <p className="mt-1 text-accent-warning text-sm" role="alert">{errors.contentQuality.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" htmlFor="audienceDemographics">
            Audience Demographics <span className="text-accent-warning">*</span>
          </label>
          <textarea
            {...register('audienceDemographics')}
            id="audienceDemographics"
            rows={4}
            className="w-full px-4 py-3 bg-background-surface border border-border-default rounded-lg focus:border-accent-primary focus:outline-none resize-none"
            placeholder="Describe your audience demographics, interests, age groups, location, etc."
          />
          {errors.audienceDemographics && (
            <p className="mt-1 text-accent-warning text-sm" role="alert">{errors.audienceDemographics.message}</p>
          )}
        </div>

        {/* Live Preview */}
        {watchedValues.platform && watchedValues.followers !== undefined && (
          <div className="bg-background-surface border border-border-default rounded-lg p-6">
            <h3 className="font-semibold mb-4">Live Trust Score Preview</h3>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">
                {Math.min(100, Math.round(
                  (watchedValues.followers / 10000 * 20) +
                  ((watchedValues.engagementRate || 0) * 0.8) +
                  ((watchedValues.contentQuality || 5) * 10)
                )) || 0}/100
              </div>
              <div className="text-text-secondary">Estimated Trust Score</div>
            </div>
          </div>
        )}

        <div className="flex justify-between">
          <Button variant="secondary" onClick={onBack}>
            ← Back
          </Button>
          <Button variant="primary" type="submit">
            Calculate & Continue →
          </Button>
        </div>
      </form>
    </div>
  )
}

function Step3Billing({
  selectedTier,
  onSubmit,
  onBack
}: {
  selectedTier: string,
  onSubmit: (data: BillingForm) => void,
  onBack: () => void
}) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')
  const [billingData, setBillingData] = useState<Partial<BillingForm> | null>(null)
  const { register, handleSubmit, formState: { errors } } = useForm<BillingForm>({
    resolver: zodResolver(billingSchema)
  })

  // Analytics tracking
  const trackEvent = (event: string, data: any) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event, data)
    }
    console.log('Analytics:', event, data)
  }

  // Calculate price based on tier
  const getPrice = () => {
    const tiersPrice = {
      starter: { monthly: 29, annual: 290 },
      pro: { monthly: 79, annual: 790 },
      enterprise: { monthly: null, annual: null }
    }
    const selectedTierPrice = tiersPrice[selectedTier as keyof typeof tiersPrice]
    if (!selectedTierPrice) return null

    return billingCycle === 'monthly' ? selectedTierPrice.monthly : selectedTierPrice.annual
  }

  const price = getPrice()
  const priceInKobo = price ? price * 100 : 0 // Paystack expects amount in kobo

  const onFormSubmit = (data: BillingForm) => {
    data.tier = selectedTier as any
    data.billingCycle = billingCycle
    setBillingData(data)
    // Don't call onSubmit yet - we'll call it after payment success
  }

  const handlePaymentSuccess = (reference: string) => {
    console.log('Payment successful:', reference)
    trackEvent('payment_success', {
      tier: selectedTier,
      billingCycle,
      reference,
      amount: price
    })

    if (billingData) {
      onSubmit(billingData as BillingForm)
    }
  }

  const handlePaymentClose = () => {
    console.log('Payment modal closed')
    trackEvent('payment_closed', { tier: selectedTier, billingCycle })
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Complete Your Subscription</h1>
        <p className="text-xl text-text-secondary">
          Enter your billing information to get started
        </p>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="max-w-2xl mx-auto space-y-6">
        {/* Billing Cycle Toggle */}
        <div className="bg-background-surface border border-border-default rounded-lg p-6">
          <h3 className="font-semibold mb-4">Billing Cycle</h3>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="billingCycle"
                value="monthly"
                checked={billingCycle === 'monthly'}
                onChange={(e) => setBillingCycle(e.target.value as 'monthly' | 'annual')}
                className="mr-2"
              />
              Monthly
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="billingCycle"
                value="annual"
                checked={billingCycle === 'annual'}
                onChange={(e) => setBillingCycle(e.target.value as 'monthly' | 'annual')}
                className="mr-2"
              />
              Annual (Save 17%)
            </label>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="name">
              Full Name <span className="text-accent-warning">*</span>
            </label>
            <input
              {...register('name')}
              id="name"
              type="text"
              className="w-full px-4 py-3 bg-background-surface border border-border-default rounded-lg focus:border-accent-primary focus:outline-none"
              placeholder="John Doe"
            />
            {errors.name && (
              <p className="mt-1 text-accent-warning text-sm" role="alert">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="email">
              Email Address <span className="text-accent-warning">*</span>
            </label>
            <input
              {...register('email')}
              id="email"
              type="email"
              className="w-full px-4 py-3 bg-background-surface border border-border-default rounded-lg focus:border-accent-primary focus:outline-none"
              placeholder="john@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-accent-warning text-sm" role="alert">{errors.email.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" htmlFor="company">
            Company (Optional)
          </label>
          <input
            {...register('company')}
            id="company"
            type="text"
            className="w-full px-4 py-3 bg-background-surface border border-border-default rounded-lg focus:border-accent-primary focus:outline-none"
            placeholder="Your Company Name"
          />
        </div>

        {/* Payment Summary */}
        <div className="bg-background-surface border border-border-default rounded-lg p-6">
          <h3 className="font-semibold mb-4">Payment Summary</h3>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium capitalize">{selectedTier} Plan</p>
              <p className="text-sm text-text-tertiary capitalize">{billingCycle} billing</p>
            </div>
            <div className="text-right">
              {price ? (
                <p className="text-2xl font-bold">₦{price.toLocaleString()}</p>
              ) : (
                <p className="text-lg font-bold">Contact Sales</p>
              )}
            </div>
          </div>
          {billingCycle === 'annual' && price && (
            <p className="text-sm text-accent-success mt-2">
              You save ₦{((price / 12 * 0.17) * 12).toFixed(0)} with annual billing
            </p>
          )}
        </div>

        <div className="flex justify-between">
          <Button variant="secondary" onClick={onBack}>
            ← Back
          </Button>
          {billingData ? (
            <PaystackButton
              email={billingData.email}
              name={billingData.name}
              amount={priceInKobo}
              tier={selectedTier}
              billingCycle={billingCycle}
              onSuccess={handlePaymentSuccess}
              onClose={handlePaymentClose}
            >
              Complete Payment →
            </PaystackButton>
          ) : (
            <Button variant="primary" type="submit">
              Continue to Payment →
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}

function Step4Confirmation({
  selectedTier,
  calculatedScore
}: {
  selectedTier: string,
  calculatedScore: number | null
}) {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="w-20 h-20 bg-accent-success rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">✓</span>
        </div>
        <h1 className="text-4xl font-bold mb-4 text-accent-success">Welcome to Creator Pass!</h1>
        <p className="text-xl text-text-secondary mb-8">
          Your subscription has been activated successfully
        </p>
      </motion.div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Receipt */}
        <div className="bg-background-surface border border-border-default rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-4">Subscription Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Plan:</span>
              <span className="font-medium capitalize">{selectedTier}</span>
            </div>
            {calculatedScore && (
              <div className="flex justify-between">
                <span>Current Trust Score:</span>
                <span className="font-medium text-accent-success">{calculatedScore}/100</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="font-medium text-accent-success">Active</span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-background-surface border border-border-default rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-4">Next Steps</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-accent-primary rounded-full flex items-center justify-center text-text-primary text-sm font-bold mt-0.5">
                1
              </div>
              <div>
                <p className="font-medium">Access Your Dashboard</p>
                <p className="text-sm text-text-secondary">Log into your account to access advanced creator tools</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-accent-primary rounded-full flex items-center justify-center text-text-primary text-sm font-bold mt-0.5">
                2
              </div>
              <div>
                <p className="font-medium">Run Trust Score Analysis</p>
                <p className="text-sm text-text-secondary">Use your personalized trust score to improve audience engagement</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-accent-primary rounded-full flex items-center justify-center text-text-primary text-sm font-bold mt-0.5">
                3
              </div>
              <div>
                <p className="font-medium">Explore Automation Tools</p>
                <p className="text-sm text-text-secondary">Set up email sequences and workflow automation</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Button variant="primary" size="lg" href="/dashboard">
            Go to Dashboard →
          </Button>
        </div>
      </div>
    </div>
  )
}
