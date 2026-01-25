'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

export function Features() {
  const [activeTab, setActiveTab] = useState<'trust' | 'workshops' | 'payments' | 'audits'>('trust')

  const tabs = [
    { id: 'trust', label: 'Trust Scoring', icon: '🛡️' },
    { id: 'workshops', label: 'Workshop Automation', icon: '🎯' },
    { id: 'payments', label: 'Payment Integration', icon: '💳' },
    { id: 'audits', label: 'Audit Reports', icon: '📊' }
  ]

  const features = {
    trust: {
      title: 'AI-Powered Trust Scoring',
      description: 'Claude AI analyzes your creator metrics—engagement, consistency, audience growth—to generate a dynamic trust score that builds credibility with your audience.',
      benefits: [
        'Real-time reputation analysis',
        'Historical performance tracking',
        'Actionable improvement recommendations'
      ],
      visual: (
        <div className="bg-background-primary border border-border-default rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-text-secondary font-medium">Trust Score</span>
            <span className="text-2xl font-bold text-accent-success">87/100</span>
          </div>
          <div className="h-2 bg-border-default rounded-full overflow-hidden mb-6">
            <div className="h-full bg-gradient-to-r from-accent-success to-accent-success rounded-full" style={{width: '87%'}}></div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-tertiary">Engagement Rate</span>
              <span className="text-accent-success">Excellent</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-tertiary">Content Consistency</span>
              <span className="text-accent-success">Strong</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-tertiary">Audience Growth</span>
              <span className="text-accent-warning">Good</span>
            </div>
          </div>
        </div>
      )
    },
    workshops: {
      title: 'Workshop Automation',
      description: 'Generate complete workshop experiences with curriculum generation, email sequences, content planning, and booking flows—all from a single command.',
      benefits: [
        'Full workshop curriculum in minutes',
        'Automated email sequences',
        'Integrated booking and payment flows',
        'Content planning and outlines'
      ],
      visual: (
        <div className="bg-background-primary border border-border-default rounded-lg p-6">
          <div className="text-center mb-4">
            <div className="text-2xl font-bold text-accent-primary mb-2">Workshop Kit Generated</div>
            <div className="text-sm text-text-tertiary mb-4">23 components created in 45 seconds</div>
          </div>
          <div className="space-y-3">
            {['Landing Page', 'Email Sequence', 'Workbook PDF', 'Booking Flow', 'Certificate', 'Analytics Dashboard'].map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-2 h-2 bg-accent-success rounded-full"></div>
                <span className="text-sm text-text-secondary">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    payments: {
      title: 'Payment Integration',
      description: 'Stripe and PayStack integration with automatic pricing pages, subscription management, and monetization strategies optimized for creators.',
      benefits: [
        'One-click Stripe & PayStack setup',
        'Multiple pricing models supported',
        'Automated subscription management',
        'Global payment processing'
      ],
      visual: (
        <div className="bg-background-primary border border-border-default rounded-lg p-6">
          <div className="text-center mb-6">
            <div className="text-3xl font-bold text-accent-primary mb-2">$2,340</div>
            <div className="text-sm text-text-tertiary">Revenue this month</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-accent-success/10 rounded-lg">
              <div className="text-lg font-bold text-accent-success">156</div>
              <div className="text-xs text-text-tertiary">Payments</div>
            </div>
            <div className="text-center p-3 bg-accent-primary/10 rounded-lg">
              <div className="text-lg font-bold text-accent-primary">98%</div>
              <div className="text-xs text-text-tertiary">Success Rate</div>
            </div>
          </div>
        </div>
      )
    },
    audits: {
      title: 'Audit Reports',
      description: 'Comprehensive creator audits that analyze your entire online presence, providing actionable insights to boost conversions and engagement.',
      benefits: [
        '360° creator assessment',
        'Competitor analysis included',
        'Conversion optimization suggestions',
        'Performance tracking over time'
      ],
      visual: (
        <div className="bg-background-primary border border-border-default rounded-lg p-6">
          <div className="text-center mb-6">
            <h4 className="font-semibold text-accent-primary mb-2">Creator Audit Report</h4>
            <div className="text-sm text-text-tertiary">Generated in 30 seconds</div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Content Quality</span>
              <span className="text-accent-success font-medium">9.2/10</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Engagement Potential</span>
              <span className="text-accent-warning font-medium">7.8/10</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Monetization Readiness</span>
              <span className="text-accent-success font-medium">8.5/10</span>
            </div>
          </div>
        </div>
      )
    }
  }

  return (
    <section className="py-20 md:py-32 px-6">
      <div className="max-w-7xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-semibold mb-4">
            Everything You Need to Monetize
          </h2>
          <p className="text-xl text-text-secondary">
            AI-powered features for the modern creator
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="flex flex-wrap gap-4 justify-center mb-12"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-6 py-3 rounded-lg transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-accent-primary text-text-primary shadow-lg'
                  : 'bg-background-surface text-text-secondary hover:text-text-primary hover:bg-background-elevated'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-background-surface border border-border-default rounded-xl p-8 md:p-12"
        >
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-semibold mb-4">{features[activeTab].title}</h3>
              <p className="text-lg text-text-secondary mb-6 leading-relaxed">
                {features[activeTab].description}
              </p>
              <ul className="space-y-3">
                {features[activeTab].benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-accent-success mt-1">✓</span>
                    <span className="text-text-secondary">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Visual Demo */}
            <div>
              {features[activeTab].visual}
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
