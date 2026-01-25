'use client'

import { Navigation } from '../components/Navigation'
import { Footer } from '../components/Footer'
import { Button } from '../components/ui/Button'
import {
  UsersIcon,
  TargetIcon,
  LightbulbIcon,
  HeartIcon,
  AwardIcon,
  GlobeIcon,
  SparklesIcon,
  ShieldIcon
} from 'lucide-react'

export default function AboutPage() {
  const team = [
    {
      name: 'Dr. Maya Chen',
      role: 'Chief Trust Officer',
      bio: 'Former head of cybersecurity at Fortune 500 companies. PhD in Cryptography from MIT.',
      image: '/api/placeholder/200/200'
    },
    {
      name: 'James Rodriguez',
      role: 'VP of Engineering',
      bio: '15+ years building scalable platforms. Previously led engineering at Stripe and Airbnb.',
      image: '/api/placeholder/200/200'
    },
    {
      name: 'Sarah Kim',
      role: 'Head of Product',
      bio: 'Product visionary focused on creator economics. Former PM at YouTube and TikTok.',
      image: '/api/placeholder/200/200'
    },
    {
      name: 'Dr. Marcus Thompson',
      role: 'AI Ethics Lead',
      bio: 'Leading expert in AI safety and ethics. Published author and speaker at major AI conferences.',
      image: '/api/placeholder/200/200'
    }
  ]

  const values = [
    {
      icon: <ShieldIcon className="w-8 h-8" />,
      title: 'Trust First',
      description: 'We believe trust is the foundation of all digital relationships. Everything we build prioritizes security and reliability.'
    },
    {
      icon: <UsersIcon className="w-8 h-8" />,
      title: 'Creator Empowerment',
      description: 'We exist to empower creators with tools that amplify their voice and protect their intellectual property.'
    },
    {
      icon: <LightbulbIcon className="w-8 h-8" />,
      title: 'Innovation with Responsibility',
      description: 'We push the boundaries of what\'s possible while maintaining unwavering commitment to ethical AI practices.'
    },
    {
      icon: <HeartIcon className="w-8 h-8" />,
      title: 'Human-Centered Design',
      description: 'Every feature is designed with real users in mind, ensuring our platform serves human needs first.'
    }
  ]

  const milestones = [
    { year: '2020', event: 'Founded with mission to revolutionize creator trust' },
    { year: '2021', event: 'Launched first trust scoring algorithm' },
    { year: '2022', event: 'Reached 100K+ active users' },
    { year: '2023', event: 'Expanded to enterprise solutions' },
    { year: '2024', event: 'Achieved SOC 2 Type II compliance' },
    { year: '2025', event: 'Leading the industry in AI-powered trust solutions' }
  ]

  return (
    <div className="min-h-screen bg-background-primary">
      <Navigation />

      <main>
        {/* Hero Section */}
        <section className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-accent-primary/10 px-4 py-2 rounded-full mb-6">
                <SparklesIcon className="w-4 h-4 text-accent-primary" />
                <span className="text-sm font-medium text-accent-primary">Our Story</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-6">
                Building Trust in the
                <span className="text-accent-primary block">Digital Age</span>
              </h1>
              <p className="text-xl text-text-secondary max-w-3xl mx-auto mb-8">
                We're on a mission to restore trust in digital interactions. Founded by experts in cybersecurity,
                AI ethics, and creator economics, we build technology that protects, empowers, and connects.
              </p>
              <Button variant="primary" size="lg">
                Join Our Mission →
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-accent-primary mb-2">500K+</div>
                <div className="text-text-secondary">Trusted Users</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-accent-primary mb-2">$2.1B</div>
                <div className="text-text-secondary">Assets Protected</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-accent-primary mb-2">99.9%</div>
                <div className="text-text-secondary">Uptime SLA</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-accent-primary mb-2">50+</div>
                <div className="text-text-secondary">Countries Served</div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 bg-background-surface">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold mb-6">Our Mission</h2>
            <p className="text-xl text-text-secondary mb-8">
              To create a digital ecosystem where trust is automatic, security is invisible,
              and every creator can focus on what they do best: creating.
            </p>
            <blockquote className="text-2xl italic text-text-primary mb-6">
              "Trust is not given freely. It is earned through consistent action,
              transparency, and unwavering commitment to user safety."
            </blockquote>
            <cite className="text-accent-primary font-semibold">- Dr. Maya Chen, CTO</cite>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Our Values</h2>
              <p className="text-xl text-text-secondary max-w-2xl mx-auto">
                These principles guide every decision we make and every product we build.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {values.map((value, index) => (
                <div key={index} className="bg-background-surface border border-border-default rounded-xl p-8">
                  <div className="text-accent-primary mb-4">{value.icon}</div>
                  <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                  <p className="text-text-secondary">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-background-surface">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Meet Our Team</h2>
              <p className="text-xl text-text-secondary max-w-2xl mx-auto">
                World-class experts united by a shared vision of a more trustworthy digital world.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <div key={index} className="text-center">
                  <div className="w-32 h-32 bg-accent-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <UsersIcon className="w-16 h-16 text-accent-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                  <p className="text-accent-primary font-medium mb-3">{member.role}</p>
                  <p className="text-text-secondary text-sm">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Our Journey</h2>
              <p className="text-xl text-text-secondary">
                From humble beginnings to industry leadership, our story of innovation and impact.
              </p>
            </div>

            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex items-center gap-6">
                  <div className="bg-accent-primary text-text-primary font-bold text-lg w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0">
                    {milestone.year}
                  </div>
                  <div className="flex-1 bg-background-surface border border-border-default rounded-lg p-4">
                    <p className="text-text-secondary">{milestone.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-accent-primary to-accent-secondary">
          <div className="max-w-4xl mx-auto px-6 text-center text-text-primary">
            <AwardIcon className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-4">Join the Mission</h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Be part of the movement to rebuild trust in digital interactions. Whether you're a creator,
              developer, or business leader, there's a place for you in our community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" size="lg" className="bg-background-primary text-text-primary hover:bg-background-surface">
                View Careers →
              </Button>
              <Button variant="secondary" size="lg" className="bg-background-primary text-text-primary hover:bg-background-surface">
                Partner With Us →
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
