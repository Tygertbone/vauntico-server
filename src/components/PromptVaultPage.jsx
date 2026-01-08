import React from 'react'
import '../App.css'

const PromptVaultPage = () => {
  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <section className="hero-gradient text-center py-20 px-6">
        <h1 className="text-5xl font-bold text-vauntico-gold mb-4">Unlock Your Creative Power</h1>
        <p className="text-lg text-muted max-w-2xl mx-auto mb-6">
          Vauntico is a movement. A vault. A creator’s command center. Join us to build, monetize, and leave a legacy.
        </p>
        <a href="/creator-pass" className="vauntico-btn">Get Your Creator Pass</a>
      </section>

      {/* Feature Cards */}
      <section className="py-16 px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-[#111] border border-[var(--sidebar-border)] rounded-xl p-6 hover:shadow-xl transition-all duration-300"
          >
            <h3 className="text-xl font-semibold text-vauntico-gold mb-2">{feature.title}</h3>
            <p className="text-muted">{feature.description}</p>
          </div>
        ))}
      </section>

      {/* Social Proof */}
      <section className="text-center py-12 px-6 bg-[var(--sidebar)] text-[var(--sidebar-foreground)]">
        <h2 className="text-3xl font-bold mb-4">Built for Visionaries</h2>
        <p className="text-lg max-w-2xl mx-auto">
          Trusted by creators, powered by AI, and designed for legacy. Vauntico is where ideas become income.
        </p>
      </section>
    </div>
  )
}

const features = [
  {
    title: 'Prompt Vaults',
    description: 'Store, share, and sell your best AI prompts. Organize them into branded collections.',
  },
  {
    title: 'Creator Monetization',
    description: 'Turn your digital assets into income. Sell access, bundles, or subscriptions.',
  },
  {
    title: 'Brand Kits',
    description: 'Every creator gets a premium brand identity—logos, colors, and copy that convert.',
  },
  {
    title: 'Sprint Playbooks',
    description: 'Launch faster with guided sprints, execution clocks, and contributor onboarding.',
  },
  {
    title: 'Spiritual UX',
    description: 'Every page is designed to feel alive—clean, centered, and emotionally intelligent.',
  },
  {
    title: 'AI Collaboration',
    description: 'Work with AI agents like teammates. Delegate tasks, orchestrate workflows, and scale.',
  },
]

export default PromptVaultPage

