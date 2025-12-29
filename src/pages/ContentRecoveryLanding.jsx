import { Link } from 'react-router-dom'
import SEO from '../components/SEO'

function ContentRecoveryLanding() {
  return (
    <>
      <SEO 
        title="Content Recovery Service - Get Paid for Stolen Content"
        description="47% of creators have content stolen. We help you recover payments for stolen content. 30% fee only if we recover your money. No upfront costs."
        canonical="/services/content-recovery"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">
            Content <span className="text-gradient">Recovery</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            When your content gets stolen, we get you paid. Fight back against content theft with our recovery service.
          </p>
        </div>

        {/* Problem Statement */}
        <div className="max-w-5xl mx-auto mb-20">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
            <div>
              <div className="w-full h-96 vault-gradient rounded-2xl flex items-center justify-center">
                <span className="text-white text-8xl">🛡️</span>
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-4">The Content Theft Crisis</h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                <strong>47% of creators have had their content stolen.</strong> That's nearly half of all creators 
                losing income to theft, plagiarism, and unauthorized use.
              </p>
              <p className="text-gray-700 mb-4 leading-relaxed">
                Content thieves operate with impunity across platforms. They steal your videos, articles, designs, 
                and music, monetizing them without your permission while you're left powerless.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Legal action is expensive and time-consuming. DMCA takedowns are often ignored. 
                We've built a recovery service that actually gets results and puts money back in your pocket.
              </p>
            </div>
          </div>
        </div>

        {/* Shocking Stats */}
        <div className="max-w-4xl mx-auto mb-20">
          <div className="card bg-gradient-to-r from-red-500/10 to-orange-500/10 border-2 border-red-500/20">
            <h2 className="text-3xl font-bold mb-6 text-center">The Reality of Content Theft</h2>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-red-600 mb-2">47%</div>
                <div className="text-gray-600">Of creators experience content theft</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-red-600 mb-2">$12.8B</div>
                <div className="text-gray-600">Lost annually to content theft</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-red-600 mb-2">89%</div>
                <div className="text-gray-600">Never recover their losses</div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="max-w-6xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">How Recovery Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="card text-center">
              <div className="text-5xl mb-4">📋</div>
              <h3 className="text-xl font-bold mb-3">1. Submit Case</h3>
              <p className="text-gray-600 mb-4">
                Document your stolen content with evidence and file a recovery case. No upfront costs.
              </p>
              <div className="text-sm text-vault-purple font-medium">10 minutes</div>
            </div>
            <div className="card text-center">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-bold mb-3">2. Investigation</h3>
              <p className="text-gray-600 mb-4">
                Our team traces the theft, identifies perpetrators, and builds a legal case.
              </p>
              <div className="text-sm text-vault-purple font-medium">24-72 hours</div>
            </div>
            <div className="card text-center">
              <div className="text-5xl mb-4">⚖️</div>
              <h3 className="text-xl font-bold mb-3">3. Legal Action</h3>
              <p className="text-gray-600 mb-4">
                We pursue legal remedies, DMCA takedowns, and payment recovery through multiple channels.
              </p>
              <div className="text-sm text-vault-purple font-medium">7-30 days</div>
            </div>
            <div className="card text-center">
              <div className="text-5xl mb-4">💰</div>
              <h3 className="text-xl font-bold mb-3">4. Get Paid</h3>
              <p className="text-gray-600 mb-4">
                Receive 70% of recovered funds. We only get paid if you get paid.
              </p>
              <div className="text-sm text-vault-purple font-medium">Instant</div>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="max-w-4xl mx-auto mb-20">
          <div className="vault-gradient rounded-2xl p-12 text-white text-center">
            <h2 className="text-3xl font-bold mb-6">Risk-Free Recovery</h2>
            <div className="mb-8">
              <div className="text-6xl font-bold mb-4">30%</div>
              <div className="text-xl opacity-90">Success Fee Only</div>
            </div>
            <div className="grid md:grid-cols-2 gap-8 text-left max-w-3xl mx-auto">
              <div>
                <h3 className="font-bold mb-3">What This Means</h3>
                <ul className="space-y-2 text-sm">
                  <li>✓ No upfront costs or fees</li>
                  <li>✓ We only get paid if you recover money</li>
                  <li>✓ 70% of recovered funds goes to you</li>
                  <li>✓ No monthly subscriptions</li>
                  <li>✓ No hidden charges</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-3">What We Recover</h3>
                <ul className="space-y-2 text-sm">
                  <li>✓ Stolen content revenue</li>
                  <li>✓ Copyright infringement damages</li>
                  <li>✓ Licensing fees for unauthorized use</li>
                  <li>✓ Legal costs from offenders</li>
                  <li>✓ Platform compensation claims</li>
                </ul>
              </div>
            </div>
            <div className="mt-8 p-4 bg-white/10 rounded-lg">
              <p className="text-sm opacity-90">
                <strong>Compare:</strong> Lawyers charge $200-500/hour plus 30-40% contingency. 
                We charge 30% total with no hourly fees.
              </p>
            </div>
          </div>
        </div>

        {/* Types of Content We Recover */}
        <div className="max-w-6xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Content Types We Recover</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="card text-center">
              <div className="text-4xl mb-4">🎥</div>
              <h3 className="text-lg font-bold mb-3">Video Content</h3>
              <p className="text-gray-600 text-sm">
                YouTube videos, TikTok, Instagram Reels, course content
              </p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-lg font-bold mb-3">Written Content</h3>
              <p className="text-gray-600 text-sm">
                Blog posts, articles, books, newsletters, research papers
              </p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-lg font-bold mb-3">Visual Art</h3>
              <p className="text-gray-600 text-sm">
                Digital art, photography, designs, illustrations, NFTs
              </p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-4">🎵</div>
              <h3 className="text-lg font-bold mb-3">Audio Content</h3>
              <p className="text-gray-600 text-sm">
                Music, podcasts, sound effects, voice recordings
              </p>
            </div>
          </div>
        </div>

        {/* Success Stories */}
        <div className="max-w-6xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Recovery Success Stories</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card">
              <div className="flex items-center mb-4">
                <div className="text-2xl mr-3">🎬</div>
                <h3 className="font-bold">Video Creator</h3>
              </div>
              <p className="text-gray-600 mb-4">
                "Someone stole my entire course and was selling it on 5 different platforms. 
                Vauntico recovered $18,500 in lost revenue and got all copies removed."
              </p>
              <div className="text-sm text-vault-purple font-medium">
                Recovered: $18,500 | Creator received: $12,950
              </div>
            </div>
            <div className="card">
              <div className="flex items-center mb-4">
                <div className="text-2xl mr-3">✍️</div>
                <h3 className="font-bold">Writer</h3>
              </div>
              <p className="text-gray-600 mb-4">
                "My blog posts were being copied by AI content farms. Vauntico tracked down 
                27 sites using my work and recovered $4,200 in damages."
              </p>
              <div className="text-sm text-vault-purple font-medium">
                Recovered: $4,200 | Creator received: $2,940
              </div>
            </div>
            <div className="card">
              <div className="flex items-center mb-4">
                <div className="text-2xl mr-3">🎨</div>
                <h3 className="font-bold">Digital Artist</h3>
              </div>
              <p className="text-gray-600 mb-4">
                "People were selling my art as NFTs without permission. Vauntico not only 
                stopped the sales but recovered $12,800 in unauthorized profits."
              </p>
              <div className="text-sm text-vault-purple font-medium">
                Recovered: $12,800 | Creator received: $8,960
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="max-w-4xl mx-auto mb-20">
          <div className="card bg-gradient-to-r from-vault-purple/10 to-vault-blue/10 border-2 border-vault-purple/20">
            <h2 className="text-2xl font-bold mb-6 text-center">Recovery by the Numbers</h2>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-vault-purple mb-2">$3.2M+</div>
                <div className="text-gray-600">Recovered for Creators</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-vault-purple mb-2">89%</div>
                <div className="text-gray-600">Success Rate</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-vault-purple mb-2">14 days</div>
                <div className="text-gray-600">Average Recovery Time</div>
              </div>
            </div>
          </div>
        </div>

        {/* Process Details */}
        <div className="max-w-6xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Our Recovery Process</h2>
          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-16 h-16 vault-gradient rounded-full flex items-center justify-center text-white font-bold text-xl">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Evidence Collection</h3>
                <p className="text-gray-600">
                  We help you gather comprehensive evidence including timestamps, original files, 
                  registration dates, and proof of ownership. The stronger your case, the better our results.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0 w-16 h-16 vault-gradient rounded-full flex items-center justify-center text-white font-bold text-xl">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Digital Forensics</h3>
                <p className="text-gray-600">
                  Our team uses advanced digital forensics to trace the theft, identify perpetrators, 
                  and document the full scope of unauthorized use across platforms.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0 w-16 h-16 vault-gradient rounded-full flex items-center justify-center text-white font-bold text-xl">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Legal Action</h3>
                <p className="text-gray-600">
                  We pursue multiple legal channels simultaneously: DMCA takedowns, copyright claims, 
                  cease and desist letters, and when necessary, litigation.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0 w-16 h-16 vault-gradient rounded-full flex items-center justify-center text-white font-bold text-xl">
                4
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Payment Recovery</h3>
                <p className="text-gray-600">
                  We negotiate settlements, recover stolen revenue, and ensure you receive your rightful 
                  compensation as quickly as possible.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto text-center mb-20">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Fight <span className="text-gradient">Content Theft?</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Don't let content thieves profit from your hard work. We'll help you recover what's yours.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/content-recovery" className="btn-primary text-lg">
              Submit Recovery Case
            </Link>
            <a href="mailto:recovery@vauntico.com" className="btn-outline text-lg">
              Ask Questions
            </a>
          </div>
          <p className="text-sm text-gray-500 mt-6">
            No upfront costs. We only get paid when you recover your money.
          </p>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-bold mb-3">What types of content theft do you handle?</h3>
              <p className="text-gray-600">
                We handle all forms of content theft including video plagiarism, article copying, 
                art theft, music piracy, course content theft, and unauthorized commercial use.
              </p>
            </div>
            <div className="card">
              <h3 className="text-lg font-bold mb-3">What evidence do I need to provide?</h3>
              <p className="text-gray-600">
                You'll need original files, creation dates, registration information (if available), 
                and examples of the stolen content. Our team will guide you through gathering complete evidence.
              </p>
            </div>
            <div className="card">
              <h3 className="text-lg font-bold mb-3">How long does recovery take?</h3>
              <p className="text-gray-600">
                Simple cases can be resolved in 7-14 days. Complex cases involving multiple platforms 
                or legal action may take 30-90 days. We provide regular updates throughout the process.
              </p>
            </div>
            <div className="card">
              <h3 className="text-lg font-bold mb-3">What if you can't recover my money?</h3>
              <p className="text-gray-600">
                If we can't recover any funds, you pay nothing. We'll still attempt to get the content 
                removed and provide you with documentation for your records.
              </p>
            </div>
            <div className="card">
              <h3 className="text-lg font-bold mb-3">Do you handle international cases?</h3>
              <p className="text-gray-600">
                Yes! We have experience with international copyright law and work with legal partners 
                worldwide to recover content across borders and platforms.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ContentRecoveryLanding
