import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/Button';

export function Pricing() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Get started with basic trust scoring',
      features: [
        'Trust score calculation',
        'Basic performance metrics',
        'Limited AI insights',
        'Community support'
      ],
      cta: 'Get Started',
      popular: false,
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Pro',
      price: '$49',
      period: 'per month',
      description: 'Full creator analytics suite',
      features: [
        'Advanced trust scoring',
        'All platform integrations',
        'Detailed AI insights',
        'Priority email support',
        'Custom reporting',
        'API access'
      ],
      cta: 'Start Pro Trial',
      popular: true,
      gradient: 'from-indigo-600 to-purple-600'
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'pricing',
      description: 'White-label solution for agencies',
      features: [
        'Everything in Pro',
        'White-label dashboard',
        'Dedicated account manager',
        'SLA guarantees',
        'Multi-user accounts',
        'Advanced API limits'
      ],
      cta: 'Contact Sales',
      popular: false,
      gradient: 'from-purple-600 to-pink-600'
    }
  ];

  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/10 to-transparent">
        {/* Floating orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-indigo-600/5 to-purple-600/5 rounded-full blur-3xl"/>
        <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-gradient-to-r from-cyan-600/5 to-blue-600/5 rounded-full blur-3xl"/>
      </div>

      <div className="relative max-w-7xl mx-auto px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-white">Simple,</span>{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              Transparent
            </span>{' '}
            <span className="text-white">Pricing</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Start free. Scale when you're ready. No sneaky fees, no surprise limits.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`
                relative
                bg-gradient-to-br from-white/5 to-white/[0.02]
                backdrop-blur-xl
                border rounded-3xl
                p-8
                group
                transition-all duration-500
                hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)]
                ${plan.popular
                  ? 'border-indigo-500/50 shadow-[0_0_40px_rgba(102,126,234,0.2)]'
                  : 'border-white/10 hover:border-white/20'
                }
              `}
            >

              {/* Popular Badge */}
              {plan.popular && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="absolute -top-4 left-1/2 -translate-x-1/2"
                >
                  <div className={`
                    px-4 py-1
                    rounded-full
                    text-sm font-medium
                    bg-gradient-to-r ${plan.gradient}
                    text-white
                    border border-white/20
                    backdrop-blur-sm
                  `}>
                    ⭐ Most Popular
                  </div>
                </motion.div>
              )}

              {/* Glow Effect for Popular Plan */}
              {plan.popular && (
                <div className="
                  absolute inset-0
                  bg-gradient-to-br from-indigo-600/10 to-purple-600/10
                  rounded-3xl
                  blur-xl
                  -z-10
                  group-hover:blur-2xl
                  transition-all duration-500
                "/>
              )}

              <div className={`
                relative z-10
                ${plan.popular ? 'transform scale-105' : ''}
              `}>

                {/* Plan Name */}
                <h3 className="text-2xl font-semibold mb-4 text-white">
                  {plan.name}
                </h3>

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
                    {plan.price}
                  </span>
                  <span className="text-gray-400 text-lg">
                    {plan.period}
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-400 mb-8 leading-relaxed">
                  {plan.description}
                </p>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <motion.li
                      key={feature}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: featureIndex * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-5 h-5 rounded-full bg-green-400/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-green-400 text-sm font-bold">✓</span>
                      </div>
                      <span className={`text-gray-300 ${plan.popular ? 'text-white' : ''}`}>
                        {feature}
                      </span>
                    </motion.li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  variant={plan.popular ? 'fancy' : 'secondary'}
                  size="lg"
                  className="w-full"
                  href={plan.name === 'Enterprise' ? '#contact' : '#signup'}
                >
                  {plan.cta}
                </Button>

              </div>
            </motion.div>
          ))}
        </div>

        {/* Money Back Guarantee */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="
            inline-flex items-center gap-3
            px-6 py-3
            bg-white/5
            backdrop-blur-sm
            border border-white/10
            rounded-full
          ">
            <span className="text-2xl">🛡️</span>
            <span className="text-white font-medium">30-day money-back guarantee</span>
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-gray-400 mb-6">
            Need help choosing the right plan?{' '}
            <span className="text-gray-300 underline cursor-pointer hover:text-white transition-colors">
              Chat with our team →
            </span>
          </p>

          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>No setup fees</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>99.9% uptime</span>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
