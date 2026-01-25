'use client'

import { useState } from 'react'
import { Navigation } from '../components/Navigation'
import { Footer } from '../components/Footer'
import { Button } from '../components/ui/Button'
import {
  CheckIcon,
  StarIcon,
  ZapIcon,
  ShieldIcon,
  UsersIcon,
  CrownIcon,
  SparklesIcon
} from 'lucide-react'

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly')

  const plans = [
    {
      name: 'Starter',
      description: 'Perfect for creators getting started',
      price: billingCycle === 'monthly' ? 29 : 19,
      originalPrice: billingCycle === 'monthly' ? null : 29,
      features: [
        'Up to 5 vaults',
        'Basic analytics',
        'Community support',
        'Mobile app access',
        'Basic integrations'
      ],
      limitations: [
        'Limited collaborators',
        'Standard themes only'
      ],
      popular: false,
      icon: <StarIcon className="w-6 h-6" />
    },
    {
      name: 'Creator',
      description: 'Most popular for growing creators',
      price: billingCycle === 'monthly' ? 79 : 59,
      originalPrice: billingCycle === 'monthly' ? null : 79,
      features: [
        'Unlimited vaults',
        'Advanced analytics',
        'Priority support',
        'Custom branding',
        'Advanced integrations',
        'API access',
        'Team collaboration'
      ],
      limitations: [],
      popular: true,
      icon: <ZapIcon className="w-6 h-6" />
    },
    {
      name: 'Enterprise',
      description: 'For large teams and organizations',
      price: billingCycle === 'monthly' ? 199 : 149,
      originalPrice: billingCycle === 'monthly' ? null : 199,
      features: [
        'Everything in Creator',
        'Unlimited collaborators',
        'Priority phone support',
        'Enterprise security',
        'Custom integrations',
        'Dedicated account manager',
        'SLA guarantee'
      ],
      limitations: [],
      popular: false,
      icon: <CrownIcon className="w-6 h-6" />
    }
  ]

  const faqs = [
    {
      question: 'Can I change my plan at any time?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate any billing adjustments.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, PayPal, and bank transfers for Enterprise plans. All payments are processed securely.'
    },
    {
      question: 'Is there a free trial available?',
      answer: 'Yes! We offer a 14-day free trial for all plans. No credit card required to get started.'
    },
    {
      question: 'What happens if I exceed my vault limit?',
      answer: 'You\'ll be notified when approaching your limit. You can upgrade your plan or purchase additional vault slots as needed.'
    },
    {
      question: 'Do you offer discounts for annual billing?',
      answer: 'Yes! Save 20% when you choose annual billing. This discount is automatically applied at checkout.'
    }
  ]

  return (
    <div className="min-h-screen bg-background-primary">
      <Navigation />

      <main>
        {/* Hero Section */}
        <section className="pt-24 pb-16">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 bg-accent-primary/10 px-4 py-2 rounded-full mb-6">
              <SparklesIcon className="w-4 h-4 text-accent-primary" />
              <span className="text-sm font-medium text-accent-primary">Simple, Transparent Pricing</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              Choose the Perfect Plan for
              <span className="text-accent-primary block">Your Journey</span>
            </h1>
            <p className="text-xl text-text-secondary mb-12">
              Start free, scale as you grow. All plans include core features with transparent pricing.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center bg-background-surface border border-border-default rounded-lg p-1 mb-8">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-3 rounded-md transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-accent-primary text-text-primary'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-3 rounded-md transition-colors relative ${
                  billingCycle === 'yearly'
                    ? 'bg-accent-primary text-text-primary'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Yearly
                <span className="absolute -top-2 -right-2 bg-accent-warning text-text-primary text-xs px-2 py-1 rounded-full font-semibold">
                  20% OFF
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="pb-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <div
                  key={index}
                  className={`relative bg-background-surface border rounded-2xl p-8 transition-all ${
                    plan.popular
                      ? 'border-accent-primary shadow-xl scale-105'
                      : 'border-border-default hover:shadow-lg'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <div className="bg-accent-primary text-text-primary px-4 py-2 rounded-full text-sm font-semibold">
                        Most Popular
                      </div>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${
                      plan.popular ? 'bg-accent-primary/10' : 'bg-background-elevated'
                    }`}>
                      <div className={plan.popular ? 'text-accent-primary' : 'text-text-secondary'}>
                        {plan.icon}
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-text-secondary">{plan.description}</p>
                  </div>

                  <div className="text-center mb-8">
                    <div className="flex items-baseline justify-center gap-1 mb-2">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className="text-text-secondary">/{billingCycle === 'monthly' ? 'mo' : 'mo'}</span>
                    </div>
                    {plan.originalPrice && (
                      <div className="text-text-tertiary line-through">
                        ${plan.originalPrice}/{billingCycle === 'monthly' ? 'mo' : 'mo'}
                      </div>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3">
                        <CheckIcon className="w-5 h-5 text-accent-success flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                    {plan.limitations.map((limitation, limitIndex) => (
                      <li key={limitIndex} className="flex items-center gap-3">
                        <ShieldIcon className="w-5 h-5 text-text-tertiary flex-shrink-0" />
                        <span className="text-sm text-text-tertiary">{limitation}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={plan.popular ? 'primary' : 'secondary'}
                    className="w-full"
                    size="lg"
                  >
                    {plan.name === 'Free' ? 'Get Started Free' : `Start ${billingCycle === 'yearly' ? 'Annual' : 'Monthly'} Plan`}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-background-surface">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-xl text-text-secondary">
                Everything you need to know about our pricing and plans.
              </p>
            </div>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-background-primary border border-border-default rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-3">{faq.question}</h3>
                  <p className="text-text-secondary">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="bg-gradient-to-r from-accent-primary to-accent-secondary rounded-2xl p-12 text-text-primary">
              <UsersIcon className="w-16 h-16 mx-auto mb-6" />
              <h2 className="text-4xl font-bold mb-4">Need a Custom Solution?</h2>
              <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Have unique requirements? Let's discuss a tailored plan that fits your specific needs.
              </p>
              <Button variant="secondary" size="lg" className="bg-background-primary text-text-primary hover:bg-background-surface">
                Contact Sales Team →
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
