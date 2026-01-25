'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Check, X } from 'lucide-react';

export function PricingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const tiers = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      features: [
        { text: '3 projects', included: true },
        { text: 'Basic trust scoring', included: true },
        { text: 'Community support', included: true },
        { text: 'Advanced AI features', included: false },
        { text: 'API access', included: false },
        { text: 'Priority support', included: false },
      ],
      cta: 'Get Started',
      highlight: false,
    },
    {
      name: 'Pro',
      price: '$49',
      period: '/month',
      popular: true,
      features: [
        { text: 'Unlimited projects', included: true },
        { text: 'Advanced trust scoring', included: true },
        { text: 'Priority support', included: true },
        { text: 'API access', included: true },
        { text: 'Custom integrations', included: true },
      ],
      cta: 'Start Pro Trial',
      highlight: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      features: [
        { text: 'Everything in Pro', included: true },
        { text: 'White label options', included: true },
        { text: 'Dedicated account manager', included: true },
        { text: 'SLA guarantees', included: true },
      ],
      cta: 'Contact Sales',
      highlight: false,
    },
  ];

  return (
    <section ref={ref} id="pricing" className="py-32 relative overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-3xl"/>
      </div>

      <div className="relative max-w-7xl mx-auto px-6">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="text-white">Simple, </span>
            <span className="gradient-text">Transparent </span>
            <span className="text-white">Pricing</span>
          </h2>
          <p className="text-xl text-gray-400">Start free. Scale when you're ready.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">

          {tiers.map((tier, idx) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className={`
                relative
                glass
                card-hover
                glow-card
                rounded-3xl
                p-8
                ${tier.highlight
                  ? 'border-2 border-indigo-500/50 scale-105 shadow-[0_0_60px_rgba(102,126,234,0.3)]'
                  : 'hover:border-white/20'
                }
              `}
            >

              {/* Popular badge */}
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="px-4 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                </div>
              )}

              <h3 className="text-2xl font-semibold mb-2">{tier.name}</h3>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-5xl font-bold">{tier.price}</span>
                {tier.period && <span className="text-gray-400">{tier.period}</span>}
              </div>

              <ul className="space-y-4 mb-8">
                {tier.features.map((feature) => (
                  <li key={feature.text} className="flex items-center gap-3">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-gray-600 flex-shrink-0" />
                    )}
                    <span className={feature.included ? 'text-white' : 'text-gray-600'}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <button className={`
                w-full py-3 px-6
                rounded-xl
                font-semibold
                transition-all duration-300
                ${tier.highlight
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-105 hover:shadow-[0_0_40px_rgba(102,126,234,0.5)]'
                  : 'glass hover:bg-white/10'
                }
              `}>
                {tier.cta}
              </button>
            </motion.div>
          ))}

        </div>

      </div>

    </section>
  );
}
