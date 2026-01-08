import { Link } from 'react-router-dom';
import VaultCard from '../components/VaultCard';

export default function Homepage() {
  return (
    <div className="bg-black text-white min-h-screen px-6 py-12">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-vauntico-gold">Awaken. Build. Transcend.</h1>
        <p className="mt-4 text-lg text-gray-300">Vauntico is where ideas become income.</p>
        <Link to="/creator-pass">
          <button className="mt-6 bg-vauntico-gold text-black px-6 py-3 rounded hover:bg-yellow-400 transition">
            Get Your Creator Pass
          </button>
        </Link>
      </header>

      <section className="grid md:grid-cols-2 gap-6 mb-16">
        <Link to="/vaults">
          <div className="bg-gray-900 p-6 rounded-lg hover:scale-105 transition-transform">
            <h3 className="text-xl font-bold text-white mb-2">Prompt Vaults</h3>
            <p className="text-gray-400">Store, share, and sell your best AI prompts. Organize them into branded collections.</p>
          </div>
        </Link>
        <Link to="/pricing">
          <div className="bg-gray-900 p-6 rounded-lg hover:scale-105 transition-transform">
            <h3 className="text-xl font-bold text-white mb-2">Creator Monetization</h3>
            <p className="text-gray-400">Turn your digital assets into income. Sell access, bundles, or subscriptions.</p>
          </div>
        </Link>
        <Link to="/creator-pass">
          <div className="bg-gray-900 p-6 rounded-lg hover:scale-105 transition-transform">
            <h3 className="text-xl font-bold text-white mb-2">Brand Vaults</h3>
            <p className="text-gray-400">Every creator gets a premium brand identity—logos, colors, and copy that convert.</p>
          </div>
        </Link>
        <Link to="/onboarding">
          <div className="bg-gray-900 p-6 rounded-lg hover:scale-105 transition-transform">
            <h3 className="text-xl font-bold text-white mb-2">Sprint Playbooks</h3>
            <p className="text-gray-400">Launch faster with guided sprints, execution clocks, and contributor onboarding.</p>
          </div>
        </Link>
        <Link to="/demo">
          <div className="bg-gray-900 p-6 rounded-lg hover:scale-105 transition-transform">
            <h3 className="text-xl font-bold text-white mb-2">System UX</h3>
            <p className="text-gray-400">Every page is designed to feel alive—clean, centered, and emotionally intelligent.</p>
          </div>
        </Link>
        <Link to="/delegation">
          <div className="bg-gray-900 p-6 rounded-lg hover:scale-105 transition-transform">
            <h3 className="text-xl font-bold text-white mb-2">AI Collaboration</h3>
            <p className="text-gray-400">Work with AI agents like teammates. Delegate tasks, orchestrate workflows, and scale.</p>
          </div>
        </Link>
      </section>

      <section className="grid md:grid-cols-3 gap-6 mb-24">
        <VaultCard
          title="Creator’s Toolkit"
          price="$49"
          description="Prompts and templates for influencers, creators, and personal brands."
          buttonText="Unlock Vault"
          slug="creators-toolkit"
        />
        <VaultCard
          title="Agency Arsenal"
          price="$99"
          description="Client-ready workflows, pitch decks, and automation templates."
          buttonText="Unlock Vault"
          slug="agency-arsenal"
        />
        <VaultCard
          title="E-commerce Empire"
          price="$149"
          description="Product descriptions, ad copy, and branding kits for online stores."
          buttonText="Unlock Vault"
          slug="ecommerce-empire"
        />
      </section>

      {/* Email Capture Section */}
      <div className="mt-24 px-6">
        <h2 className="text-3xl font-bold text-vauntico-gold mb-4 text-center">
          Join the Vauntico Movement
        </h2>
        <p className="text-gray-300 mb-6 text-center">
          Get early access to new vaults, creator tools, and exclusive drops.
        </p>
        <form
          name="vauntico-email-capture"
          method="POST"
          data-netlify="true"
          className="max-w-xl mx-auto"
        >
          <input type="hidden" name="form-name" value="vauntico-email-capture" />
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            required
            className="w-full px-4 py-3 rounded bg-white text-black border border-vauntico-gold placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-vauntico-gold"
          />
          <button
            type="submit"
            className="mt-4 bg-vauntico-gold text-black px-6 py-3 rounded font-semibold hover:bg-yellow-400 transition w-full"
          >
            Subscribe
          </button>
        </form>
      </div>
    </div>
  );
}