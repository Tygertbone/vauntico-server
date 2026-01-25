'use client'

import { Navigation } from '../components/Navigation'
import { Footer } from '../components/Footer'
import { Button } from '../components/ui/Button'
import {
  ShieldIcon,
  UsersIcon,
  LightbulbIcon,
  HeartIcon,
  GlobeIcon,
  SparklesIcon,
  TargetIcon,
  AwardIcon
} from 'lucide-react'

export default function PhilosophyPage() {
  const principles = [
    {
      title: 'Trust is Earned, Not Given',
      description: 'We believe that digital trust must be continuously earned through transparency, reliability, and ethical behavior. Trust is not a feature—it\'s the foundation of everything we build.',
      icon: <ShieldIcon className="w-8 h-8" />
    },
    {
      title: 'Security by Design',
      description: 'Security is not an afterthought but the fundamental principle that guides every decision. We build systems that are secure by default, with privacy and protection as core requirements.',
      icon: <TargetIcon className="w-8 h-8" />
    },
    {
      title: 'Creators Deserve Better',
      description: 'The current digital landscape exploits creators while platforms profit. We believe creators should own their work, their audience, and their economic destiny.',
      icon: <UsersIcon className="w-8 h-8" />
    },
    {
      title: 'AI Should Serve Humanity',
      description: 'Artificial intelligence has tremendous potential to enhance human creativity and connection. We ensure AI serves ethical purposes and augments, rather than replaces, human judgment.',
      icon: <LightbulbIcon className="w-8 h-8" />
    },
    {
      title: 'Transparency Builds Confidence',
      description: 'We believe in radical transparency. Our algorithms, our processes, and our decisions should be understandable and accountable to those we serve.',
      icon: <AwardIcon className="w-8 h-8" />
    },
    {
      title: 'Community Drives Innovation',
      description: 'The best solutions come from diverse perspectives working together. We foster communities where creators, technologists, and users collaborate to shape the future.',
      icon: <HeartIcon className="w-8 h-8" />
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
              <span className="text-sm font-medium text-accent-primary">Our Philosophy</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              Principles That
              <span className="text-accent-primary block">Guide Everything</span>
            </h1>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              Our philosophy shapes how we think about trust, security, and the future of digital interaction.
              These principles are not slogans—they're commitments that drive every decision we make.
            </p>
          </div>
        </section>

        {/* Principles Grid */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {principles.map((principle, index) => (
                <div key={index} className="bg-background-surface border border-border-default rounded-xl p-8 hover:shadow-lg transition-all">
                  <div className="text-accent-primary mb-4">{principle.icon}</div>
                  <h3 className="text-xl font-semibold mb-3">{principle.title}</h3>
                  <p className="text-text-secondary">{principle.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Vision Section */}
        <section className="py-20 bg-background-surface">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <GlobeIcon className="w-16 h-16 text-accent-primary mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-6">A Vision for the Future</h2>
            <p className="text-xl text-text-secondary mb-8">
              We envision a digital world where trust is automatic, where creators thrive without exploitation,
              and where technology serves humanity's highest aspirations rather than corporate profits.
            </p>
            <blockquote className="text-3xl italic text-text-primary mb-6">
              "The measure of a society is not its wealth, but how it treats its most vulnerable members.
              In the digital age, 'vulnerable' means anyone who creates, shares, or connects online."
            </blockquote>
            <cite className="text-accent-primary font-semibold text-lg">- Our Founding Manifesto</cite>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="bg-gradient-to-r from-accent-primary to-accent-secondary rounded-2xl p-12 text-text-primary">
              <TargetIcon className="w-16 h-16 mx-auto mb-6" />
              <h2 className="text-4xl font-bold mb-4">Join Us in This Vision</h2>
              <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Be part of building a more trustworthy digital world. Whether you create, code, or care about the future of the internet, there's a place for you here.
              </p>
              <Button variant="secondary" size="lg" className="bg-background-primary text-text-primary hover:bg-background-surface">
                Learn More About Our Mission →
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
