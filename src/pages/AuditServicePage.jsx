import { Link } from 'react-router-dom';
import { CheckCircle2, Shield, Clock, FileSearch, Zap, AlertTriangle, Lock, Activity } from 'lucide-react';

export default function AuditServicePage() {
  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Webhook Validation',
      description: 'Real-time verification of webhook signatures and payload integrity to ensure authentic requests only.'
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: 'Replay Protection',
      description: 'Advanced timestamp validation and nonce tracking to prevent replay attacks and duplicate processing.'
    },
    {
      icon: <FileSearch className="w-6 h-6" />,
      title: 'Forensic Logging',
      description: 'Comprehensive audit trails with cryptographic signatures for compliance and incident investigation.'
    },
    {
      icon: <Activity className="w-6 h-6" />,
      title: 'Real-Time Monitoring',
      description: '24/7 automated monitoring with instant alerts for suspicious patterns or security anomalies.'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Performance Analytics',
      description: 'Track webhook latency, success rates, and system health with detailed performance metrics.'
    },
    {
      icon: <AlertTriangle className="w-6 h-6" />,
      title: 'Threat Detection',
      description: 'Machine learning-powered anomaly detection to identify and block malicious webhook attempts.'
    }
  ];

  const slaGuarantees = [
    { metric: '99.9% Uptime', description: 'Enterprise-grade reliability' },
    { metric: '<100ms Response', description: 'Lightning-fast validation' },
    { metric: '24/7 Support', description: 'Expert security team on call' },
    { metric: 'SOC 2 Compliant', description: 'Industry-standard security' }
  ];

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Hero Section */}
      <section className="relative px-6 py-20 overflow-hidden">
        {/* Animated background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-vauntico-gold/5 via-transparent to-vauntico-pink/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.1),transparent_50%)] animate-pulse" />
        
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-vauntico-gold/10 border border-vauntico-gold/30 rounded-full mb-6">
            <Shield className="w-4 h-4 text-vauntico-gold" />
            <span className="text-sm text-vauntico-gold font-medium">Enterprise Security</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-vauntico-gold mb-6 animate-fade-in">
            Audit-as-a-Service
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
            Protect your webhooks with military-grade validation, forensic logging, and real-time threat detection.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/vault-success">
              <button className="bg-gradient-to-r from-vauntico-gold to-yellow-400 text-black font-bold px-8 py-4 rounded-lg shadow-xl hover:scale-105 transition-transform duration-300 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Start Free Trial
              </button>
            </Link>
            <Link to="/demo">
              <button className="bg-gray-900 text-white border border-vauntico-gold/30 font-semibold px-8 py-4 rounded-lg hover:bg-gray-800 transition-colors duration-300">
                View Dashboard Demo
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
                <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Monthly Subscription</p>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-6xl font-bold text-vauntico-gold">R999</span>
                  <span className="text-gray-400 text-xl">/month</span>
                </div>
                <p className="text-gray-500 text-sm mt-2">First 30 days free • Cancel anytime</p>
              </div>
              
              <div className="border-t border-vauntico-gold/20 pt-8">
                <h3 className="text-2xl font-semibold text-white mb-6 text-center">Everything Included</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-vauntico-gold flex-shrink-0 mt-1" />
                    <span className="text-gray-300">Unlimited webhook validations and monitoring</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-vauntico-gold flex-shrink-0 mt-1" />
                    <span className="text-gray-300">Real-time threat detection and automated blocking</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-vauntico-gold flex-shrink-0 mt-1" />
                    <span className="text-gray-300">90-day forensic log retention with encryption</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-vauntico-gold flex-shrink-0 mt-1" />
                    <span className="text-gray-300">Custom security rules and validation logic</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-vauntico-gold flex-shrink-0 mt-1" />
                    <span className="text-gray-300">Slack/Discord/Email alerts for security events</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-vauntico-gold flex-shrink-0 mt-1" />
                    <span className="text-gray-300">24/7 support with &lt;1hr response time</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-vauntico-gold flex-shrink-0 mt-1" />
                    <span className="text-gray-300">Monthly security reports and compliance documentation</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-vauntico-gold mb-4">Security Features</h2>
            <p className="text-gray-300 text-lg">Enterprise-grade protection for your webhook infrastructure</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* SLA Guarantees */}
      <section className="px-6 py-16 bg-gray-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-vauntico-gold mb-4">SLA Guarantees</h2>
            <p className="text-gray-300 text-lg">Our commitment to your security and uptime</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {slaGuarantees.map((sla, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-900 to-gray-800 border border-vauntico-gold/30 rounded-xl p-6 text-center hover:border-vauntico-gold/60 transition-all duration-300"
              >
                <div className="text-3xl font-bold text-vauntico-gold mb-2">{sla.metric}</div>
                <div className="text-gray-400">{sla.description}</div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Backed by our money-back guarantee • <Link to="/demo" className="text-vauntico-gold hover:underline">View full SLA terms</Link>
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-vauntico-gold mb-4">How It Works</h2>
            <p className="text-gray-300 text-lg">From integration to protection in minutes</p>
          </div>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-vauntico-gold/10 border border-vauntico-gold/30 rounded-full flex items-center justify-center text-vauntico-gold font-bold">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Install the SDK</h3>
                <p className="text-gray-400">Add our lightweight npm package to your project. Works with Express, Next.js, Fastify, and more.</p>
                <pre className="bg-gray-900 text-gray-300 p-3 rounded-lg mt-2 text-sm overflow-x-auto">
                  <code>npm install @vauntico/audit-sdk</code>
                </pre>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-vauntico-gold/10 border border-vauntico-gold/30 rounded-full flex items-center justify-center text-vauntico-gold font-bold">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Configure Security Rules</h3>
                <p className="text-gray-400">Set up validation rules, whitelist IPs, and define your security policies through our dashboard.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-vauntico-gold/10 border border-vauntico-gold/30 rounded-full flex items-center justify-center text-vauntico-gold font-bold">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Monitor & Protect</h3>
                <p className="text-gray-400">Watch real-time traffic, receive alerts, and review forensic logs. We handle the security, you focus on building.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="px-6 py-16 bg-gray-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-vauntico-gold mb-4">Perfect For</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-900 border border-vauntico-gold/20 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Payment Platforms</h3>
              <p className="text-gray-400">Secure Stripe, PayPal, and payment gateway webhooks with PCI-compliant logging.</p>
            </div>
            
            <div className="bg-gray-900 border border-vauntico-gold/20 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-3">SaaS Applications</h3>
              <p className="text-gray-400">Protect critical business logic triggered by third-party service webhooks.</p>
            </div>
            
            <div className="bg-gray-900 border border-vauntico-gold/20 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-3">E-commerce</h3>
              <p className="text-gray-400">Validate order updates, shipping notifications, and inventory sync webhooks.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-vauntico-gold/30 rounded-2xl p-8 md:p-12">
            <div className="flex items-start gap-4 mb-6">
              <div className="text-vauntico-gold text-6xl leading-none">"</div>
              <div>
                <p className="text-gray-300 text-lg italic mb-4">
                  Vauntico Audit stopped three attack attempts in our first week. The forensic logs 
                  helped us identify a compromised API key before any damage was done. Worth every penny.
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-vauntico-gold/20 rounded-full flex items-center justify-center text-vauntico-gold font-bold">
                    MR
                  </div>
                  <div>
                    <p className="text-white font-semibold">Maria Rodriguez</p>
                    <p className="text-gray-400 text-sm">CTO, PayFlow Systems</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-20 bg-gradient-to-b from-transparent via-vauntico-gold/5 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-vauntico-gold mb-6">
            Secure Your Webhooks Today
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Start with 30 days free. No credit card required.
          </p>
          <Link to="/vault-success">
            <button className="bg-gradient-to-r from-vauntico-gold to-yellow-400 text-black font-bold px-10 py-5 rounded-lg shadow-2xl hover:scale-105 transition-transform duration-300 text-lg flex items-center gap-2 mx-auto">
              <Shield className="w-6 h-6" />
              Start Free Trial
            </button>
          </Link>
          <p className="text-gray-400 text-sm mt-4">
            R999/month after trial • Cancel anytime • 24/7 support
          </p>
        </div>
      </section>
    </div>
  );
}
