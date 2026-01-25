import React from 'react';
import { motion } from 'framer-motion';

export function HowItWorks() {
  const steps = [
    {
      title: 'Connect Your Platforms',
      description: 'Link your YouTube, Google Analytics, and Stripe accounts securely',
      icon: '🔗',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      title: 'AI Analyzes Your Data',
      description: 'Claude AI examines your performance metrics and engagement patterns',
      icon: '🤖',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Get Your Trust Score',
      description: 'Receive a comprehensive score with actionable improvement insights',
      icon: '📊',
      color: 'from-pink-500 to-cyan-500'
    },
    {
      title: 'Optimize & Grow',
      description: 'Follow AI recommendations to boost your creator credibility',
      icon: '🚀',
      color: 'from-cyan-500 to-green-500'
    }
  ];

  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 w-2/3 h-1 aspect-square bg-indigo-600/5 rounded-full blur-3xl"/>
        <div className="absolute bottom-1/4 right-0 w-1/2 h-1 aspect-square bg-purple-600/5 rounded-full blur-3xl"/>
      </div>

      <div className="relative max-w-7xl mx-auto px-6">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-white">How It</span>{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              Works
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            From setup to score in under 5 minutes. We've made creator analytics as simple as possible.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative"
            >
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-px bg-gradient-to-r from-indigo-500/30 to-transparent transform translate-x-4"/>
              )}

              <div className="
                relative
                bg-gradient-to-br from-white/5 to-white/[0.02]
                backdrop-blur-xl
                border border-white/10
                rounded-3xl
                p-8
                h-full
                group-hover:border-white/20
                group-hover:shadow-[0_0_40px_rgba(102,126,234,0.1)]
                transition-all duration-500
              ">

                {/* Step Number */}
                <div className="flex items-center gap-4 mb-6">
                  <div className={`
                    w-12 h-12
                    rounded-full
                    bg-gradient-to-br ${step.color}
                    flex items-center justify-center
                    text-2xl
                    group-hover:scale-110
                    transition-transform duration-300
                  `}>
                    <span className="group-hover:rotate-12 transition-transform duration-300">
                      {step.icon}
                    </span>
                  </div>
                  <span className="text-sm text-cyan-400 font-mono">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>

                <h3 className="text-xl font-semibold mb-4 text-white">
                  {step.title}
                </h3>

                <p className="text-gray-400 leading-relaxed">
                  {step.description}
                </p>

              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 text-sm text-gray-500 mb-8">
            <span className="text-cyan-400">Ready to get your score?</span>
            <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>

          <div className="inline-flex items-center gap-4 px-6 py-3 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-full border border-white/10 backdrop-blur-sm">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"/>
            <span className="text-white font-medium">30-day free trial available</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
