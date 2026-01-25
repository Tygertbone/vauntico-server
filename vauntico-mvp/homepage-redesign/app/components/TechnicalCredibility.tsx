'use client'

import { motion } from 'framer-motion'

export function TechnicalCredibility() {
  const technologies = [
    { name: 'Next.js', logo: '▲', description: 'React framework' },
    { name: 'Claude AI', logo: '🤖', description: 'AI automation' },
    { name: 'Vercel', logo: '▲', description: 'Deployment' },
    { name: 'Stripe', logo: '💳', description: 'Payments' },
    { name: 'TypeScript', logo: 'TS', description: 'Type safety' },
    { name: 'Tailwind', logo: '🎨', description: 'Styling' },
    { name: 'PostgreSQL', logo: '🐘', description: 'Database' },
    { name: 'Redis', logo: '⚡', description: 'Caching' },
  ]

  const securityBadges = [
    { text: 'SOC 2 Compliant', icon: '🔒' },
    { text: 'GDPR Ready', icon: '🔒' },
    { text: '256-bit Encryption', icon: '🔒' }
  ]

  return (
    <section className="py-20 md:py-32 px-6 bg-background-surface/50">
      <div className="max-w-7xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-semibold mb-4">
            Built on Modern Infrastructure
          </h2>
          <p className="text-xl text-text-secondary">
            Enterprise-grade stack for creators who move fast
          </p>
        </motion.div>

        {/* Tech Stack Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {technologies.map((tech, index) => (
            <div
              key={tech.name}
              className="bg-background-primary border border-border-default rounded-lg p-6 text-center hover:border-border-hover hover:shadow-lg transition-all group"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{tech.logo}</div>
              <div className="text-sm font-medium text-text-primary mb-1">{tech.name}</div>
              <div className="text-xs text-text-tertiary">{tech.description}</div>
            </div>
          ))}
        </motion.div>

        {/* Code Example */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="bg-background-primary border border-border-default rounded-xl overflow-hidden mb-12"
        >
          <div className="bg-background-surface border-b border-border-default px-6 py-3 flex items-center justify-between">
            <span className="text-sm text-text-tertiary font-medium">API Integration Example</span>
            <button className="text-xs text-accent-primary hover:underline font-medium">View Docs →</button>
          </div>
          <div className="p-6 font-mono text-sm overflow-x-auto">
            <div className="text-text-secondary">
              <div className="text-cyan-400">import {'{ Vauntico }'} from '@vauntico/sdk';</div>
              <br />
              <div className="text-text-secondary">const vauntico = new Vauntico({'{'}'</div>
              <div className="text-text-secondary ml-4">apiKey: process.env.VAUNTICO_API_KEY</div>
              <div className="text-text-secondary">{'}'});</div>
              <br />
              <div className="text-text-secondary">// Generate trust score</div>
              <div className="text-text-primary">const score = await vauntico.trustScore.calculate({'{'}'</div>
              <div className="text-text-primary ml-4">creatorId: 'user_123',</div>
              <div className="text-text-primary ml-4">metrics: {'{'} engagement: 5.2, posts: 20 {'}'}</div>
              <div className="text-text-primary">{'}'});</div>
              <br />
              <div className="text-text-secondary">// Generate landing page</div>
              <div className="text-text-primary">const page = await vauntico.pages.generate({'{'}'</div>
              <div className="text-text-primary ml-4">type: 'workshop',</div>
              <div className="text-text-primary ml-4">title: 'Creator Monetization',</div>
              <div className="text-text-primary ml-4">deploy: true</div>
              <div className="text-text-primary">{'}'});</div>
              <br />
              <div className="text-text-primary">console.log(`🚀 Deployed: ${'{'}page.url{'}'}`);</div>
            </div>
          </div>
        </motion.div>

        {/* Security Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-8 text-sm text-text-tertiary"
        >
          {securityBadges.map((badge, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-accent-success">{badge.icon}</span>
              <span>{badge.text}</span>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  )
}
