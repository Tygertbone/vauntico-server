import { Link } from 'react-router-dom'
import SEO from '../components/SEO'

function VerificationLanding() {
  return (
    <>
      <SEO 
        title="Creator Verification - Build Trust with Brands"
        description="Get verified as a creator and build trust with brands. Free for creators, $99 for brand verification. Manual verification service for the creator economy."
        canonical="/services/verification"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">
            Creator <span className="text-gradient">Verification</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Build trust, unlock opportunities, and get verified. The credibility boost your creator career needs.
          </p>
        </div>

        {/* Problem Statement */}
        <div className="max-w-5xl mx-auto mb-20">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
            <div>
              <div className="w-full h-96 vault-gradient rounded-2xl flex items-center justify-center">
                <span className="text-white text-8xl">✅</span>
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-4">The Trust Gap Problem</h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                Brands are spending millions on influencer marketing, but 67% report difficulty 
                identifying genuine creators from fake accounts and bots.
              </p>
              <p className="text-gray-700 mb-4 leading-relaxed">
                As a creator, you're fighting for attention in a crowded space. Without verification, 
                you're losing deals to less qualified creators who simply look more legitimate.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Our verification service bridges this gap. We manually verify your identity, 
                audience quality, and content authenticity so brands can work with confidence.
              </p>
            </div>
          </div>
        </div>

        {/* Solution Section */}
        <div className="max-w-4xl mx-auto mb-20">
          <div className="card bg-gradient-to-r from-vault-purple/10 to-vault-blue/10 border-2 border-vault-purple/20">
            <h2 className="text-3xl font-bold mb-6 text-center">Our Verification Solution</h2>
            <p className="text-xl text-gray-700 text-center leading-relaxed mb-8">
              Manual verification by real humans. We don't rely on algorithms or automated systems. 
              Each creator is personally reviewed by our verification team.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl mb-3">👤</div>
                <h3 className="font-bold mb-2">Identity Verified</h3>
                <p className="text-gray-600 text-sm">Government ID check and video confirmation</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">👥</div>
                <h3 className="font-bold mb-2">Audience Authentic</h3>
                <p className="text-gray-600 text-sm">Real followers, genuine engagement</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">🎯</div>
                <h3 className="font-bold mb-2">Content Quality</h3>
                <p className="text-gray-600 text-sm">Original, high-quality creative work</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="max-w-6xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Transparent Pricing</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="card text-center border-2 border-green-500 relative">
              <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 rounded-bl-lg text-sm font-medium">
                Most Popular
              </div>
              <div className="text-5xl mb-4">🎨</div>
              <h3 className="text-2xl font-bold mb-4">Creator Verification</h3>
              <div className="text-4xl font-bold mb-4">FREE</div>
              <p className="text-gray-600 mb-6">For individual creators and influencers</p>
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Identity verification
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Audience authenticity check
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Verification badge on profile
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Priority in brand searches
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Access to exclusive brand campaigns
                </li>
              </ul>
              <Link to="/verification" className="btn-primary w-full">
                Get Verified Now
              </Link>
            </div>

            <div className="card text-center">
              <div className="text-5xl mb-4">🏢</div>
              <h3 className="text-2xl font-bold mb-4">Brand Verification</h3>
              <div className="text-4xl font-bold mb-4">$99</div>
              <p className="text-gray-600 mb-6">For brands and agencies</p>
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Business registration verification
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Brand authenticity check
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Verification badge on profile
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Enhanced credibility with creators
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Priority support
                </li>
              </ul>
              <a href="mailto:brands@vauntico.com" className="btn-outline w-full">
                Contact Sales
              </a>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="max-w-6xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">How Verification Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="card text-center">
              <div className="text-5xl mb-4">📝</div>
              <h3 className="text-xl font-bold mb-3">1. Apply</h3>
              <p className="text-gray-600 mb-4">
                Submit your verification application with basic information and social media profiles.
              </p>
              <div className="text-sm text-vault-purple font-medium">5 minutes</div>
            </div>
            <div className="card text-center">
              <div className="text-5xl mb-4">📋</div>
              <h3 className="text-xl font-bold mb-3">2. Submit Documents</h3>
              <p className="text-gray-600 mb-4">
                Provide government ID and complete video verification for identity confirmation.
              </p>
              <div className="text-sm text-vault-purple font-medium">10 minutes</div>
            </div>
            <div className="card text-center">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-bold mb-3">3. Review Process</h3>
              <p className="text-gray-600 mb-4">
                Our team manually reviews your application, audience, and content quality.
              </p>
              <div className="text-sm text-vault-purple font-medium">24-48 hours</div>
            </div>
            <div className="card text-center">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-xl font-bold mb-3">4. Get Verified</h3>
              <p className="text-gray-600 mb-4">
                Receive your verification badge and unlock exclusive opportunities.
              </p>
              <div className="text-sm text-vault-purple font-medium">Instant</div>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="max-w-6xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Why Get Verified?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="text-4xl mb-4">💼</div>
              <h3 className="text-lg font-bold mb-3">More Brand Deals</h3>
              <p className="text-gray-600 text-sm">
                Verified creators get 3x more collaboration requests from brands
              </p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-lg font-bold mb-3">Protection from Scams</h3>
              <p className="text-gray-600 text-sm">
                Verified badge protects your reputation and prevents impersonation
              </p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-lg font-bold mb-3">Higher Rates</h3>
              <p className="text-gray-600 text-sm">
                Verified creators command 25-40% higher rates for sponsored content
              </p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-lg font-bold mb-3">Better Matching</h3>
              <p className="text-gray-600 text-sm">
                Brands can easily find and verify you're the right fit for campaigns
              </p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-4">🌟</div>
              <h3 className="text-lg font-bold mb-3">Exclusive Access</h3>
              <p className="text-gray-600 text-sm">
                Get invited to premium campaigns and brand partnerships
              </p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-lg font-bold mb-3">Trust Building</h3>
              <p className="text-gray-600 text-sm">
                Build long-term relationships with reputable brands
              </p>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="max-w-4xl mx-auto mb-20">
          <div className="vault-gradient rounded-2xl p-12 text-white text-center">
            <h2 className="text-3xl font-bold mb-6">Trusted by the Creator Community</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="text-5xl font-bold mb-2">5,000+</div>
                <div className="text-lg opacity-90">Verified Creators</div>
              </div>
              <div>
                <div className="text-5xl font-bold mb-2">500+</div>
                <div className="text-lg opacity-90">Verified Brands</div>
              </div>
              <div>
                <div className="text-5xl font-bold mb-2">$10M+</div>
                <div className="text-lg opacity-90">In Verified Deals</div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto text-center mb-20">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Build <span className="text-gradient">Trust?</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of verified creators who are landing better deals and building sustainable careers
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/verification" className="btn-primary text-lg">
              Get Verified Now
            </Link>
            <a href="mailto:verify@vauntico.com" className="btn-outline text-lg">
              Learn More
            </a>
          </div>
          <p className="text-sm text-gray-500 mt-6">
            Free for all creators. Brand verification available for $99.
          </p>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-bold mb-3">Is creator verification really free?</h3>
              <p className="text-gray-600">
                Yes! Creator verification is completely free. We believe every genuine creator should have access 
                to verification tools to build their career and protect their brand.
              </p>
            </div>
            <div className="card">
              <h3 className="text-lg font-bold mb-3">What documents do I need for verification?</h3>
              <p className="text-gray-600">
                You'll need a valid government-issued ID (passport, driver's license, or national ID) and 
                complete a short video verification to confirm your identity matches your documents.
              </p>
            </div>
            <div className="card">
              <h3 className="text-lg font-bold mb-3">How long does verification take?</h3>
              <p className="text-gray-600">
                Most verifications are completed within 24-48 hours. Complex cases may take up to 5 business days. 
                You'll receive email updates throughout the process.
              </p>
            </div>
            <div className="card">
              <h3 className="text-lg font-bold mb-3">What if my verification is rejected?</h3>
              <p className="text-gray-600">
                If your application is rejected, we'll provide specific feedback and guidance on how to improve 
                your profile for future verification. You can reapply after 30 days.
              </p>
            </div>
            <div className="card">
              <h3 className="text-lg font-bold mb-3">Can brands see my verification status?</h3>
              <p className="text-gray-600">
                Yes! Verified creators and brands display a verification badge on their profile, making it easy 
                for potential partners to identify legitimate accounts at a glance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default VerificationLanding
