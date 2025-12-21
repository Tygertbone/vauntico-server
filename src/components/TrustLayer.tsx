import React from 'react';

export default function TrustLayer() {
  const trustSignals = [
    { icon: "🔒", label: "256-bit SSL Encryption", value: "Military-grade" },
    { icon: "🛡️", label: "GDPR Compliant", value: "100%" },
    { icon: "⚡", label: "99.9% Uptime", value: "Enterprise" },
    { icon: "🌍", label: "SOC 2 Type II", value: "Certified" },
    { icon: "💳", label: "PCI DSS", value: "Level 1" },
    { icon: "🔐", label: "2FA Security", value: "Enforced" }
  ];

  return (
    <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-20 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-teal-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-0 left-1/3 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Enterprise-Grade Trust Layer
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-4xl mx-auto">
            Built with the same security standards as Fortune 500 companies
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-16">
          {trustSignals.map((signal, index) => (
            <div 
              key={index}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:bg-gray-700/50 transition-all duration-300 hover:scale-105"
            >
              <div className="text-3xl mb-3">{signal.icon}</div>
              <h3 className="font-semibold text-white mb-2">{signal.label}</h3>
              <p className="text-gray-300 text-sm">{signal.value}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <div className="inline-flex items-center gap-6 bg-gray-800 rounded-full px-8 py-4 border border-gray-700">
            <div className="text-green-400 text-2xl mr-3">✓</div>
            <div className="text-left">
              <p className="font-bold text-white text-lg">Trusted by 10,000+ Creators Worldwide</p>
              <p className="text-gray-400 text-sm">Bank-level security for your creative business</p>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <button className="bg-teal-500 hover:bg-teal-600 text-black font-bold px-8 py-4 rounded-lg text-lg transition-all duration-300 hover:scale-105 hover:shadow-teal-500/25">
            Verify Our Security →
          </button>
        </div>
      </div>
    </section>
  );
}
