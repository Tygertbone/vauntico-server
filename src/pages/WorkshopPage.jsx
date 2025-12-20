import { Link } from 'react-router-dom';
import { CheckCircle2, Sparkles, BookOpen, GitCommit, Shield } from 'lucide-react';

export default function WorkshopPage() {
  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'Onboarding Rituals',
      description: 'Sacred ceremonies to align your team with Vauntico principles and establish spiritual coding practices.'
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: 'JSX Purification',
      description: 'Transform your React components into blessed, semantically pure JSX that honors the ancient ways of the web.'
    },
    {
      icon: <GitCommit className="w-6 h-6" />,
      title: 'Lore-Sealing Commit Templates',
      description: 'Document your journey with commit messages that capture the essence of your transformation.'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Code Review Sanctuary',
      description: 'A dedicated session where we perform deep architectural reviews and seal vulnerabilities.'
    }
  ];

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Hero Section */}
      <section className="relative px-6 py-20 overflow-hidden">
        {/* Animated background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-vauntico-gold/5 via-transparent to-vauntico-pink/5 animate-pulse" />
        
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-vauntico-gold/10 border border-vauntico-gold/30 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-vauntico-gold" />
            <span className="text-sm text-vauntico-gold font-medium">Once-Off Workshop Kit</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-vauntico-gold mb-6 animate-fade-in">
            The Sacred Workshop
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
            Transform your codebase into a spiritual sanctuary. One intensive session to purify, align, and transcend.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/vault-success">
              <button className="bg-gradient-to-r from-vauntico-gold to-yellow-400 text-black font-bold px-8 py-4 rounded-lg shadow-xl hover:scale-105 transition-transform duration-300 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Book Your Workshop
              </button>
            </Link>
            <Link to="/demo">
              <button className="bg-gray-900 text-white border border-vauntico-gold/30 font-semibold px-8 py-4 rounded-lg hover:bg-gray-800 transition-colors duration-300">
                See Examples
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="px-6 py-16 bg-gradient-to-b from-transparent to-gray-900/50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-900 border-2 border-vauntico-gold/30 rounded-2xl p-8 md:p-12 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-vauntico-gold/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-vauntico-pink/5 rounded-full blur-3xl" />
            
            <div className="relative">
              <div className="text-center mb-8">
                <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">One-Time Investment</p>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-6xl font-bold text-vauntico-gold">R499</span>
                  <span className="text-gray-400 text-xl">once-off</span>
                </div>
              </div>
              
              <div className="border-t border-vauntico-gold/20 pt-8">
                <h3 className="text-2xl font-semibold text-white mb-6 text-center">What You Receive</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-vauntico-gold flex-shrink-0 mt-1" />
                    <span className="text-gray-300">3-hour intensive workshop session via video call</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-vauntico-gold flex-shrink-0 mt-1" />
                    <span className="text-gray-300">Complete codebase review and purification ritual</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-vauntico-gold flex-shrink-0 mt-1" />
                    <span className="text-gray-300">Custom commit templates aligned with your project's lore</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-vauntico-gold flex-shrink-0 mt-1" />
                    <span className="text-gray-300">Documentation of spiritual coding practices for your team</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-vauntico-gold flex-shrink-0 mt-1" />
                    <span className="text-gray-300">30-day email support for implementation questions</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-vauntico-gold mb-4">Workshop Ceremonies</h2>
            <p className="text-gray-300 text-lg">Each ritual designed to elevate your code to its highest form</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-900 border border-vauntico-gold/20 rounded-xl p-6 hover:border-vauntico-gold/50 transition-all duration-300 hover:shadow-lg hover:shadow-vauntico-gold/10 group"
              >
                <div className="bg-vauntico-gold/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-vauntico-gold group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="px-6 py-16 bg-gray-900/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-vauntico-gold mb-4">The Sacred Process</h2>
            <p className="text-gray-300 text-lg">How we transform your code in three hours</p>
          </div>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-vauntico-gold/10 border border-vauntico-gold/30 rounded-full flex items-center justify-center text-vauntico-gold font-bold">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Discovery & Alignment</h3>
                <p className="text-gray-400">We explore your codebase, understand your project's essence, and identify areas for spiritual elevation.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-vauntico-gold/10 border border-vauntico-gold/30 rounded-full flex items-center justify-center text-vauntico-gold font-bold">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Purification Ritual</h3>
                <p className="text-gray-400">Together, we refactor critical components, establish patterns, and seal the architecture with intention.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-vauntico-gold/10 border border-vauntico-gold/30 rounded-full flex items-center justify-center text-vauntico-gold font-bold">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Lore Documentation</h3>
                <p className="text-gray-400">We create lasting documentation, commit templates, and team rituals to maintain the elevated state.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-vauntico-gold/30 rounded-2xl p-8 md:p-12">
            <div className="flex items-start gap-4 mb-6">
              <div className="text-vauntico-gold text-6xl leading-none">"</div>
              <div>
                <p className="text-gray-300 text-lg italic mb-4">
                  The workshop transformed not just our code, but our entire approach to development. 
                  We now build with intention and purpose. Every commit feels meaningful.
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-vauntico-gold/20 rounded-full flex items-center justify-center text-vauntico-gold font-bold">
                    AS
                  </div>
                  <div>
                    <p className="text-white font-semibold">Alex Sterling</p>
                    <p className="text-gray-400 text-sm">Lead Developer, TechFlow</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-gradient-to-b from-transparent via-vauntico-gold/5 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-vauntico-gold mb-6">
            Ready to Transform Your Code?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Begin your journey to spiritual code excellence today.
          </p>
          <Link to="/vault-success">
            <button className="bg-gradient-to-r from-vauntico-gold to-yellow-400 text-black font-bold px-10 py-5 rounded-lg shadow-2xl hover:scale-105 transition-transform duration-300 text-lg flex items-center gap-2 mx-auto">
              <CheckCircle2 className="w-6 h-6" />
              Book Workshop for R499
            </button>
          </Link>
          <p className="text-gray-400 text-sm mt-4">
            Limited availability • Response within 24 hours
          </p>
        </div>
      </section>
    </div>
  );
}
