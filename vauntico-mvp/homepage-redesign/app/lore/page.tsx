'use client'

import { Navigation } from '../components/Navigation'
import { Footer } from '../components/Footer'
import { Button } from '../components/ui/Button'
import {
  BookOpenIcon,
  UsersIcon,
  ShieldIcon,
  SparklesIcon,
  HeartIcon,
  GlobeIcon,
  AwardIcon,
  LightbulbIcon
} from 'lucide-react'

export default function LorePage() {
  const stories = [
    {
      title: 'The Trust Crisis',
      content: 'In 2020, we witnessed the collapse of trust in digital platforms. Creators lost control of their content, users faced unprecedented privacy violations, and the internet became a place of suspicion rather than connection. This crisis sparked our founding question: what if we could rebuild the internet on a foundation of verifiable trust?',
      icon: <ShieldIcon className="w-8 h-8" />
    },
    {
      title: 'The Algorithm Awakening',
      content: 'Our journey began with a simple algorithm designed to measure trust in creator-audience relationships. What started as a research project evolved into a comprehensive trust scoring system that could authenticate digital interactions, verify creator authenticity, and protect intellectual property.',
      icon: <LightbulbIcon className="w-8 h-8" />
    },
    {
      title: 'The Community Vision',
      content: 'We realized early that technology alone couldn\'t solve the trust crisis. We needed a community of creators, technologists, and users who shared our vision. Today, our community spans 50+ countries and includes everyone from independent artists to Fortune 500 enterprises.',
      icon: <UsersIcon className="w-8 h-8" />
    },
    {
      title: 'The Ethical AI Declaration',
      content: 'As AI became central to our platform, we made a fundamental commitment: AI should serve humanity, not exploit it. Our AI systems are designed to enhance human creativity, protect privacy, and ensure fairness. We believe in transparent algorithms and accountable automation.',
      icon: <AwardIcon className="w-8 h-8" />
    },
    {
      title: 'The Digital Rights Revolution',
      content: 'In an era of rampant content theft and creator exploitation, we pioneered a new approach to digital ownership. Our platform ensures creators maintain control of their work, receive fair compensation, and build sustainable careers in the digital economy.',
      icon: <BookOpenIcon className="w-8 h-8" />
    },
    {
      title: 'The Future We\'re Building',
      content: 'Today, we\'re building more than a platform—we\'re building a movement. A future where trust is the default, where creativity flourishes without fear, and where technology serves the greater good. This is our lore, our legacy, and our ongoing story.',
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
              <span className="text-sm font-medium text-accent-primary">Our Story</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              The Lore of
              <span className="text-accent-primary block">Vauntico</span>
            </h1>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              Every great journey has its story. Ours began with a crisis of trust and evolved into a movement
              for digital integrity. This is our origin, our evolution, and the principles that guide us.
            </p>
          </div>
        </section>

        {/* Stories Timeline */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-6">
            <div className="space-y-16">
              {stories.map((story, index) => (
                <div key={index} className="flex gap-8">
                  {/* Timeline dot and line */}
                  <div className="flex flex-col items-center">
                    <div className="bg-accent-primary text-text-primary p-3 rounded-full">
                      {story.icon}
                    </div>
                    {index < stories.length - 1 && (
                      <div className="w-px h-16 bg-accent-primary/30 mt-4"></div>
                    )}
                  </div>

                  {/* Story content */}
                  <div className="flex-1 pb-8">
                    <h3 className="text-2xl font-bold mb-4">{story.title}</h3>
                    <p className="text-text-secondary text-lg leading-relaxed">{story.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cultural Values */}
        <section className="py-20 bg-background-surface">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Our Cultural DNA</h2>
              <p className="text-xl text-text-secondary max-w-2xl mx-auto">
                These values transcend technology—they define who we are and what we stand for.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-8">
                <ShieldIcon className="w-16 h-16 text-accent-primary mx-auto mb-6" />
                <h3 className="text-xl font-semibold mb-4">Radical Transparency</h3>
                <p className="text-text-secondary">
                  We believe in complete openness about our technology, our processes, and our challenges.
                  Transparency builds trust, and trust is our currency.
                </p>
              </div>

              <div className="text-center p-8">
                <HeartIcon className="w-16 h-16 text-accent-primary mx-auto mb-6" />
                <h3 className="text-xl font-semibold mb-4">Human-Centered Innovation</h3>
                <p className="text-text-secondary">
                  Every feature we build starts with real human needs. We innovate to empower, not to exploit.
                  Our success is measured by human flourishing.
                </p>
              </div>

              <div className="text-center p-8">
                <GlobeIcon className="w-16 h-16 text-accent-primary mx-auto mb-6" />
                <h3 className="text-xl font-semibold mb-4">Global Responsibility</h3>
                <p className="text-text-secondary">
                  Technology today shapes society tomorrow. We take our global responsibility seriously,
                  ensuring our platform serves the greater good of humanity.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="bg-gradient-to-r from-accent-primary to-accent-secondary rounded-2xl p-12 text-text-primary">
              <BookOpenIcon className="w-16 h-16 mx-auto mb-6" />
              <h2 className="text-4xl font-bold mb-4">Continue Our Story</h2>
              <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Our journey continues with creators, innovators, and dreamers who believe in a better digital world.
                Join us in writing the next chapter of this story.
              </p>
              <Button variant="secondary" size="lg" className="bg-background-primary text-text-primary hover:bg-background-surface">
                Be Part of Our Legacy →
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
