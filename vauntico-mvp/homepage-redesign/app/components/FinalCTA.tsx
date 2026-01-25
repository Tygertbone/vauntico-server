'use client'

import { motion } from 'framer-motion'
import { Button } from './ui/Button'

export function FinalCTA() {
  return (
    <section className="py-20 md:py-32 px-6">
      <div className="max-w-4xl mx-auto text-center">

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-4xl md:text-6xl font-semibold mb-6"
        >
          Start Building Your<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-accent-primaryHover">
            Creator Platform Today
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-xl text-text-secondary mb-10 max-w-2xl mx-auto"
        >
          No credit card required. Deploy your first project in under 10 minutes.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
        >
          <Button variant="primary" size="xl" href="#get-started">
            Get Started Free →
          </Button>
          <Button variant="secondary" size="xl" href="#demo">
            Book a Demo
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-text-tertiary"
        >
          Join 500+ creators building with Vauntico
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="mt-12 flex flex-wrap justify-center items-center gap-8 text-sm text-text-tertiary"
        >
          <div className="flex items-center gap-2">
            <span className="text-accent-success">✓</span>
            <span>Free tier available</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-accent-success">✓</span>
            <span>14-day trial</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-accent-success">✓</span>
            <span>Cancel anytime</span>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
