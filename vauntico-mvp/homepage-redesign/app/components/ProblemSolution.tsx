'use client'

import { motion } from 'framer-motion'

export function ProblemSolution() {
  return (
    <section className="py-20 md:py-32 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Problem */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-12 items-center mb-20"
        >
          <div>
            <h2 className="text-4xl md:text-5xl font-semibold mb-6">
              Creators Waste Weeks<br />
              Building What Should Take <span className="text-accent-primary">Minutes</span>
            </h2>
            <ul className="space-y-4 text-lg text-text-secondary">
              <li className="flex items-start gap-3">
                <span className="text-accent-warning mt-1">✗</span>
                <span>Hiring expensive developers for simple workflows</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent-warning mt-1">✗</span>
                <span>Slow iterations killing momentum</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent-warning mt-1">✗</span>
                <span>Technical complexity blocking monetization</span>
              </li>
            </ul>
          </div>

          {/* Visual: Frustrated creator illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-background-surface border border-border-default rounded-xl p-12 flex items-center justify-center"
          >
            <div className="text-center">
              <div className="text-6xl opacity-20 mb-4">😤</div>
              <div className="text-sm text-text-tertiary">Traditional workflow frustration</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Solution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-12 items-center"
        >

          {/* Visual: Pipeline illustration */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-background-surface border border-border-default rounded-xl p-12"
          >
            {/* CLI → AI → Output flowchart */}
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="w-16 h-16 bg-accent-primary/20 rounded-lg flex items-center justify-center mb-2">
                  <span className="text-2xl">⌨️</span>
                </div>
                <div className="text-xs text-text-tertiary">CLI Input</div>
              </div>

              <div className="flex-1 h-px bg-gradient-to-r from-accent-primary to-accent-primaryHover mx-4"></div>

              <div className="text-center">
                <div className="w-16 h-16 bg-accent-primaryHover/20 rounded-lg flex items-center justify-center mb-2">
                  <span className="text-2xl">🤖</span>
                </div>
                <div className="text-xs text-text-tertiary">AI Processing</div>
              </div>

              <div className="flex-1 h-px bg-gradient-to-r from-accent-primaryHover to-accent-success mx-4"></div>

              <div className="text-center">
                <div className="w-16 h-16 bg-accent-success/20 rounded-lg flex items-center justify-center mb-2">
                  <span className="text-2xl">🚀</span>
                </div>
                <div className="text-xs text-text-tertiary">Live Site</div>
              </div>
            </div>
          </motion.div>

          <div>
            <h2 className="text-4xl md:text-5xl font-semibold mb-6">
              AI Automation.<br />
              CLI Speed.<br />
              <span className="text-accent-primary">Zero Code Required.</span>
            </h2>
            <ul className="space-y-4 text-lg text-text-secondary">
              <li className="flex items-start gap-3">
                <span className="text-accent-success mt-1">✓</span>
                <span>Generate landing pages, workshops, and payment flows in minutes</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent-success mt-1">✓</span>
                <span>AI-powered trust scoring builds your reputation automatically</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent-success mt-1">✓</span>
                <span>Deploy to production with a single command</span>
              </li>
            </ul>
          </div>

        </motion.div>

      </div>
    </section>
  )
}
