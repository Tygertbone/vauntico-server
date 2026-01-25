'use client'

import { Navigation } from './components/Navigation'
import { HeroSection } from './components/HeroSection'
import { TrustScoreWidget } from './components/TrustScoreWidget'
import { PricingSection } from './components/PricingSection'
import { Footer } from './components/Footer'
import { AnimatedSection } from './components/AnimatedSection'
import { ProblemSolution } from './components/ProblemSolution'
import { HowItWorks } from './components/HowItWorks'
import { Features } from './components/Features'
import { InteractiveDemo } from './components/InteractiveDemo'
import { TechnicalCredibility } from './components/TechnicalCredibility'
import { FinalCTA } from './components/FinalCTA'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navigation />
      <HeroSection />

      {/* Problem/Solution sections wrapped with AnimatedSection */}
      <AnimatedSection>
        <ProblemSolution />
      </AnimatedSection>

      <AnimatedSection delay={0.2}>
        <HowItWorks />
      </AnimatedSection>

      <TrustScoreWidget />

      <AnimatedSection delay={0.3}>
        <Features />
      </AnimatedSection>

      <AnimatedSection delay={0.4}>
        <InteractiveDemo />
      </AnimatedSection>

      <PricingSection />

      <AnimatedSection delay={0.5}>
        <TechnicalCredibility />
      </AnimatedSection>

      <AnimatedSection delay={0.6}>
        <FinalCTA />
      </AnimatedSection>

      <Footer />
    </main>
  )
}
