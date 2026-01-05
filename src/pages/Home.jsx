import React from 'react';
import TrustScoreCalculator from './TrustScoreCalculator';
import WaitlistSystem from '../components/WaitlistSystem';

const Home = () => {
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            AI-Powered Creator Platform
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Launching Soon
          </p>
          <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
            Calculate your trust score, automate workflows, monetize content.
            Built with Ubuntu philosophy.
          </p>
        </div>
      </section>

      {/* Trust Score Calculator */}
      <section className="py-20 px-6 bg-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Try It Free</h2>
            <p className="text-xl text-gray-300">
              Calculate your creator trust score in 60 seconds
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <TrustScoreCalculator />
          </div>
        </div>
      </section>

      {/* Waitlist */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Join the Waitlist</h2>
            <p className="text-xl text-gray-300">
              Be the first to experience Vauntico's creator platform
            </p>
          </div>
          <WaitlistSystem />
        </div>
      </section>

      {/* Features Preview */}
      <section className="py-20 px-6 bg-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Sacred Features Coming Soon</h2>
            <p className="text-xl text-gray-300">
              Explore our collection of creator tools
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Legacy Tree', desc: 'Quantum branching narratives', badge: 'Beta' },
              { name: 'Code Sanctification', desc: 'Security ritual simulator', badge: 'Beta' },
              { name: 'Ubuntu Echo', desc: 'Community wisdom forum', badge: 'Beta' },
              { name: 'Love Loops', desc: 'Collaborative art canvas', badge: 'Beta' }
            ].map((feature, i) => (
              <div key={i} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-white">{feature.name}</h3>
                  <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full font-medium">
                    {feature.badge}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-purple-900/50 to-blue-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Creator Journey?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of creators waiting for early access to Vauntico
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#waitlist" className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
              Join Waitlist
            </a>
            <a href="/terms" className="px-8 py-4 border border-gray-600 text-white rounded-lg font-semibold hover:bg-gray-800 transition-all">
              Learn More
            </a>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
