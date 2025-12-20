import { Link } from 'react-router-dom'

import SEO from '../components/SEO'

function About() {
  return (
    <>
      <SEO 
        title="About Vauntico - The Story Behind the Creator OS"
        description="Built by a creator, for creators. Learn the story behind Vauntico and why we're building the CLI-first content creation platform that actually ships."
        canonical="/about"
      />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section with Founder Story */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h1 className="text-5xl font-bold mb-6">
          Built by a <span className="text-gradient">Creator, For Creators</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Vauntico was born from a simple frustration: content creation tools were either too complex or too limiting. 
          There had to be a better way.
        </p>
      </div>

      {/* Founder Story */}
      <div className="max-w-5xl mx-auto mb-20">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
          <div>
            <div className="w-full h-96 vault-gradient rounded-2xl flex items-center justify-center">
              <span className="text-white text-8xl">👨‍💻</span>
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-4">The Problem Was Personal</h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              After years of juggling multiple platforms, losing content in scattered folders, and watching creative ideas 
              slip away because the tools got in the way, I knew something had to change.
            </p>
            <p className="text-gray-700 mb-4 leading-relaxed">
              I built Vauntico for the creator who's tired of fighting with their tools. For the agency owner drowning in 
              client content. For the team that needs to move fast without sacrificing quality.
            </p>
            <p className="text-gray-700 leading-relaxed">
              This isn't just another SaaS product—it's the system I wish I had when I started.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Statement */}
      <div className="max-w-4xl mx-auto mb-20 card bg-gradient-to-r from-vault-purple/10 to-vault-blue/10 border-2 border-vault-purple/20">
        <h2 className="text-3xl font-bold mb-6 text-center">Our Mission</h2>
        <p className="text-xl text-gray-700 text-center leading-relaxed">
          To empower creators with intelligent tools that amplify their creativity—not complicate it. 
          We believe great content should flow naturally, collaboration should be effortless, and technology 
          should work for you, not against you.
        </p>
      </div>

      {/* Values */}
      <div className="max-w-6xl mx-auto mb-20">
        <h2 className="text-3xl font-bold text-center mb-12">What We Stand For</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="card text-center">
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="text-xl font-bold mb-3">Creator-First</h3>
            <p className="text-gray-600">
              Every feature is designed with real creators in mind. No bloat, no complexity—just tools that work.
            </p>
          </div>
          <div className="card text-center">
            <div className="text-5xl mb-4">🚀</div>
            <h3 className="text-xl font-bold mb-3">Speed & Quality</h3>
            <p className="text-gray-600">
              Create faster without compromising on quality. AI assistance that enhances your voice, not replaces it.
            </p>
          </div>
          <div className="card text-center">
            <div className="text-5xl mb-4">🤝</div>
            <h3 className="text-xl font-bold mb-3">Transparent & Fair</h3>
            <p className="text-gray-600">
              No hidden fees, no surprises. Simple pricing that scales with you, not against you.
            </p>
          </div>
        </div>
      </div>

      {/* The Journey */}
      <div className="max-w-4xl mx-auto mb-20">
        <h2 className="text-3xl font-bold text-center mb-12">Our Journey</h2>
        <div className="space-y-8">
          <div className="flex gap-6">
            <div className="flex-shrink-0 w-16 h-16 vault-gradient rounded-full flex items-center justify-center text-white font-bold text-xl">
              1
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">The Spark (Early 2023)</h3>
              <p className="text-gray-600">
                Fed up with juggling 10+ tools for content creation, the first prototype was sketched on a napkin. 
                The vision: one platform that does it all, intelligently.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex-shrink-0 w-16 h-16 vault-gradient rounded-full flex items-center justify-center text-white font-bold text-xl">
              2
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Early Believers (Mid 2023)</h3>
              <p className="text-gray-600">
                Invited 50 creators to test the beta. Their feedback transformed Vauntico from a personal tool 
                into something that could help thousands.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex-shrink-0 w-16 h-16 vault-gradient rounded-full flex items-center justify-center text-white font-bold text-xl">
              3
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Launch & Growth (Late 2023)</h3>
              <p className="text-gray-600">
                Official launch with Creator Pass, Workshop Kit, and vault technology. The response exceeded all expectations.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex-shrink-0 w-16 h-16 vault-gradient rounded-full flex items-center justify-center text-white font-bold text-xl">
              4
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Today & Tomorrow (2024)</h3>
              <p className="text-gray-600">
                Thousands of creators trust Vauntico daily. But we're just getting started—scroll marketplace, 
                advanced collaboration, and AI enhancements are on the horizon.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-6xl mx-auto mb-20">
        <div className="vault-gradient rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold text-center mb-12">By the Numbers</h2>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">2,500+</div>
              <div className="text-lg opacity-90">Active Creators</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">50K+</div>
              <div className="text-lg opacity-90">Vaults Created</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">1M+</div>
              <div className="text-lg opacity-90">AI Generations</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">98%</div>
              <div className="text-lg opacity-90">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="max-w-4xl mx-auto mb-20">
        <h2 className="text-3xl font-bold text-center mb-6">Small Team, Big Vision</h2>
        <p className="text-center text-gray-600 mb-12 text-lg">
          We're a lean, focused team dedicated to building the best creator platform in the world. 
          No corporate bloat, no committees—just passionate builders who care deeply about your success.
        </p>
        <div className="card bg-gradient-to-r from-vault-purple/10 to-vault-blue/10 border-2 border-vault-purple/20 text-center">
          <p className="text-xl text-gray-700 mb-6">
            <strong>Want to join the mission?</strong> We're always looking for talented people who share our vision.
          </p>
          <a href="mailto:careers@vauntico.com" className="btn-primary inline-block">
            View Open Positions
          </a>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-6">
          Ready to Create <span className="text-gradient">Without Limits?</span>
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Join thousands of creators who've found their flow with Vauntico
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/pricing" className="btn-primary text-lg">
            Start Free Trial
          </Link>
          <Link to="/lore" className="btn-outline text-lg">
            Explore Features
          </Link>
        </div>
      </div>
      </div>
    </>
  )
}

export default About
