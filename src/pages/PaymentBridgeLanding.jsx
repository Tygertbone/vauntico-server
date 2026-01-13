import { Link } from "react-router-dom";
import SEO from "../components/SEO";

function PaymentBridgeLanding() {
  return (
    <>
      <SEO
        title="Payment Bridge - Cross-Border Payments for African Creators"
        description="Seamless cross-border payment solutions for African creators. Get paid globally with our 10% fee payment bridge service."
        canonical="/services/payment-bridge"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">
            Payment <span className="text-gradient">Bridge</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Break down borders, not your bank account. Cross-border payments
            designed for African creators.
          </p>
        </div>

        {/* Problem Statement */}
        <div className="max-w-5xl mx-auto mb-20">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
            <div>
              <div className="w-full h-96 vault-gradient rounded-2xl flex items-center justify-center">
                <span className="text-white text-8xl">🌍</span>
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-4">
                The African Creator Challenge
              </h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                As an African creator, getting paid from international clients
                shouldn't feel like navigating a maze. High fees, complex
                regulations, and limited payment options stand between you and
                global opportunities.
              </p>
              <p className="text-gray-700 mb-4 leading-relaxed">
                Traditional payment processors charge exorbitant fees (15-30%)
                and take weeks to process. Banks impose strict limits and
                endless paperwork. Your creativity deserves better.
              </p>
              <p className="text-gray-700 leading-relaxed">
                We've built the Payment Bridge to connect you directly with
                global brands, ensuring you get paid quickly, fairly, and
                without the headache.
              </p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="max-w-6xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="text-5xl mb-4">📝</div>
              <h3 className="text-xl font-bold mb-3">1. Submit Request</h3>
              <p className="text-gray-600 mb-4">
                Fill out your payment details with client information and
                amount. Our secure form captures everything needed.
              </p>
              <div className="text-sm text-vault-purple font-medium">
                Takes 2 minutes
              </div>
            </div>
            <div className="card text-center">
              <div className="text-5xl mb-4">🔄</div>
              <h3 className="text-xl font-bold mb-3">2. We Process</h3>
              <p className="text-gray-600 mb-4">
                Our team handles currency conversion, compliance checks, and
                routing through our global payment network.
              </p>
              <div className="text-sm text-vault-purple font-medium">
                24-48 hours
              </div>
            </div>
            <div className="card text-center">
              <div className="text-5xl mb-4">💰</div>
              <h3 className="text-xl font-bold mb-3">3. Get Paid</h3>
              <p className="text-gray-600 mb-4">
                Funds appear directly in your local bank account. No hidden
                fees, no delays, no complications.
              </p>
              <div className="text-sm text-vault-purple font-medium">
                Instant access
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="max-w-4xl mx-auto mb-20">
          <div className="vault-gradient rounded-2xl p-12 text-white text-center">
            <h2 className="text-3xl font-bold mb-6">
              Simple, Transparent Pricing
            </h2>
            <div className="mb-8">
              <div className="text-6xl font-bold mb-4">10%</div>
              <div className="text-xl opacity-90">Transaction Fee</div>
            </div>
            <div className="grid md:grid-cols-2 gap-8 text-left max-w-3xl mx-auto">
              <div>
                <h3 className="font-bold mb-3">What's Included</h3>
                <ul className="space-y-2 text-sm">
                  <li>✓ Currency conversion at real rates</li>
                  <li>✓ Compliance and tax handling</li>
                  <li>✓ Bank transfer to your local account</li>
                  <li>✓ Payment tracking and notifications</li>
                  <li>✓ 24/7 customer support</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-3">No Hidden Costs</h3>
                <ul className="space-y-2 text-sm">
                  <li>✗ No setup fees</li>
                  <li>✗ No monthly subscriptions</li>
                  <li>✗ No withdrawal limits</li>
                  <li>✗ No currency conversion markup</li>
                  <li>✗ No maintenance fees</li>
                </ul>
              </div>
            </div>
            <div className="mt-8 p-4 bg-white/10 rounded-lg">
              <p className="text-sm opacity-90">
                <strong>Compare:</strong> Traditional processors charge 15-30% +
                hidden fees. We charge just 10% total.
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="max-w-6xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose Payment Bridge?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="card text-center">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-lg font-bold mb-3">Global Coverage</h3>
              <p className="text-gray-600 text-sm">
                Accept payments from 195+ countries and 50+ currencies
              </p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-lg font-bold mb-3">Fast Processing</h3>
              <p className="text-gray-600 text-sm">
                Most payments processed within 48 hours
              </p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-lg font-bold mb-3">Bank-Level Security</h3>
              <p className="text-gray-600 text-sm">
                End-to-end encryption and compliance with international
                standards
              </p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-lg font-bold mb-3">Real-time Tracking</h3>
              <p className="text-gray-600 text-sm">
                Monitor your payments from submission to delivery
              </p>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="max-w-4xl mx-auto mb-20">
          <div className="card bg-gradient-to-r from-vault-purple/10 to-vault-blue/10 border-2 border-vault-purple/20">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Trusted by African Creators
            </h2>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-vault-purple mb-2">
                  $2.5M+
                </div>
                <div className="text-gray-600">Payments Processed</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-vault-purple mb-2">
                  1,200+
                </div>
                <div className="text-gray-600">Active Creators</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-vault-purple mb-2">
                  45+
                </div>
                <div className="text-gray-600">African Countries</div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto text-center mb-20">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Get Paid <span className="text-gradient">Globally?</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of African creators who've simplified their
            cross-border payments
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/payment-bridge" className="btn-primary text-lg">
              Access Payment Bridge
            </Link>
            <a
              href="mailto:payments@vauntico.com"
              className="btn-outline text-lg"
            >
              Ask Questions
            </a>
          </div>
          <p className="text-sm text-gray-500 mt-6">
            Authentication required. Only available to verified Vauntico
            creators.
          </p>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-bold mb-3">
                How long does payment processing take?
              </h3>
              <p className="text-gray-600">
                Most payments are processed within 24-48 hours after submission.
                Complex cases may take up to 5 business days depending on the
                source country and currency.
              </p>
            </div>
            <div className="card">
              <h3 className="text-lg font-bold mb-3">
                What countries do you support?
              </h3>
              <p className="text-gray-600">
                We support payouts to 45+ African countries including Nigeria,
                Kenya, South Africa, Ghana, Egypt, and more. Contact us if your
                country isn't listed.
              </p>
            </div>
            <div className="card">
              <h3 className="text-lg font-bold mb-3">
                Are there any minimum or maximum limits?
              </h3>
              <p className="text-gray-600">
                Minimum payment amount is $50 USD. Maximum is $50,000 USD per
                transaction. Higher amounts can be arranged on a case-by-case
                basis.
              </p>
            </div>
            <div className="card">
              <h3 className="text-lg font-bold mb-3">
                How does the 10% fee compare to alternatives?
              </h3>
              <p className="text-gray-600">
                Traditional processors like PayPal charge 15-30% + currency
                conversion fees. Bank transfers can cost 20-40% with
                intermediary fees. Our 10% is all-inclusive with no hidden
                charges.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PaymentBridgeLanding;
