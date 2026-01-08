import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FullLogo } from '../components/Logo';
import {
  Check,
  Star,
  Users,
  Zap,
  Shield,
  TrendingUp,
  ArrowRight,
  Crown,
  Sparkles,
  Gift,
  Rocket
} from 'lucide-react';

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [activePlan, setActivePlan] = useState('creator');

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: { monthly: 9, yearly: 90 },
      icon: <Sparkles className="w-8 h-8" />,
      color: 'from-gray-600 to-gray-700',
      features: [
        'Basic Trust Score tracking',
        'Up to 3 social platforms',
        'Monthly analytics report',
        'Email support',
        'Basic fraud detection'
      ],
      cta: 'Perfect for emerging creators',
      popular: false
    },
    {
      id: 'creator',
      name: 'Creator',
      price: { monthly: 29, yearly: 290 },
      icon: <Star className="w-8 h-8" />,
      color: 'from-purple-600 to-pink-600',
      features: [
        'Advanced Trust Score analytics',
        'Unlimited social platforms',
        'Real-time notifications',
        'Priority email support',
        'Advanced fraud detection',
        'API access',
        'Custom branding'
      ],
      cta: 'Most popular for serious creators',
      popular: true
    },
    {
      id: 'business',
      name: 'Business',
      price: { monthly: 79, yearly: 790 },
      icon: <Crown className="w-8 h-8" />,
      color: 'from-yellow-500 to-orange-500',
      features: [
        'Everything in Creator plan',
        'White-label dashboard',
        'Dedicated account manager',
        'Custom integrations',
        'Phone support',
        'SLA guarantee',
        'Advanced analytics suite'
      ],
      cta: 'For agencies and established creators',
      popular: false
    }
  ];

  const addOns = [
    {
      name: 'Platform Integrations',
      description: 'Connect additional social media platforms beyond the included ones',
      price: '$5/month per platform',
      icon: <Users className="w-6 h-6" />
    },
    {
      name: 'Advanced Analytics',
      description: 'Deep dive into your performance metrics with AI-powered insights',
      price: '$15/month',
      icon: <TrendingUp className="w-6 h-6" />
    },
    {
      name: 'Priority Support',
      description: 'Get 24/7 priority support with guaranteed response times',
      price: '$25/month',
      icon: <Shield className="w-6 h-6" />
    }
  ];

  const faqs = [
    {
      question: 'What platforms do you support?',
      answer: 'We currently support Instagram, YouTube, TikTok, Twitter, and LinkedIn. More platforms are coming soon!'
    },
    {
      question: 'Can I change plans anytime?',
      answer: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect at the next billing cycle.'
    },
    {
      question: 'How does the Trust Score work?',
      answer: 'Our AI analyzes your engagement patterns, content consistency, audience growth, and authenticity metrics to generate a dynamic trust score.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Absolutely. We use bank-level encryption, comply with GDPR/POPIA, and never share your data without consent.'
    }
  ];

  const getYearlySavings = (monthlyPrice, yearlyPrice) => {
    const yearlyMonthly = yearlyPrice / 12;
    const savings = monthlyPrice * 12 - yearlyPrice;
    return Math.round((savings / (monthlyPrice * 12)) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl animate-float"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center">
              <FullLogo size="md" />
            </Link>
            <div className="flex items-center space-x-6">
              <Link to="/" className="text-gray-300 hover:text-white transition-colors">Home</Link>
              <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors">Dashboard</Link>
              <Link to="/pricing" className="text-white font-medium">Pricing</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center space-x-2 bg-purple-600/20 rounded-full px-4 py-2 border border-purple-500/30">
            <Gift className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-purple-300">Simple, Transparent Pricing</span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
            <span className="block text-white">Choose Your</span>
            <span className="block text-gradient">Perfect Plan</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            No hidden fees. Cancel anytime. 30-day money-back guarantee.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-white/10 backdrop-blur-lg rounded-xl p-1 border border-white/20">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/20'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/20'
              }`}
            >
              Yearly
              <span className="ml-2 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <div key={plan.id} className="relative">
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 right-1/2">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-bold text-center">
                    Most Popular
                  </div>
                </div>
              )}
              
              <div className={`bg-white/5 backdrop-blur-lg rounded-2xl p-8 border-2 relative overflow-hidden transition-all duration-300 hover:scale-105 ${
                plan.popular ? 'border-purple-500' : 'border-white/20'
              }`}>
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${plan.color} opacity-10`}></div>
                
                {/* Plan Header */}
                <div className="text-center mb-6">
                  <div className="inline-flex p-4 rounded-2xl bg-gradient-to-r mb-4">
                    {plan.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="text-gray-400 text-sm mb-4">
                    {billingCycle === 'yearly' && (
                      <div className="flex items-center justify-center space-x-2">
                        <span className="line-through text-gray-500">${plan.price.monthly}/mo</span>
                        <span className="text-3xl font-bold text-white">${plan.price.yearly}/mo</span>
                      </div>
                    )}
                    {billingCycle === 'monthly' && (
                      <div className="text-3xl font-bold text-white">${plan.price.monthly}/mo</div>
                    )}
                    {billingCycle === 'yearly' && (
                      <div className="text-sm text-green-300">
                        Save {getYearlySavings(plan.price.monthly, plan.price.yearly)}%
                      </div>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="text-center">
                  <button
                    onClick={() => setActivePlan(plan.id)}
                    className={`w-full btn-primary text-lg py-4 ${
                      activePlan === plan.id ? 'ring-2 ring-white ring-offset-2' : ''
                    }`}
                  >
                    {activePlan === plan.id ? 'Current Plan' : `Choose ${plan.name}`}
                  </button>
                </div>

                {/* Plan Description */}
                <div className="text-center mt-4">
                  <p className="text-sm text-gray-400 italic">{plan.cta}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add-ons Section */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 mb-16">
          <h2 className="text-2xl font-semibold text-white mb-8 text-center">Enhance Your Experience</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {addOns.map((addOn, index) => (
              <div key={index} className="bg-white/10 rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all">
                <div className="flex items-center mb-4">
                  <div className="p-3 rounded-lg bg-purple-600/20 text-purple-400">
                    {addOn.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{addOn.name}</h3>
                    <p className="text-3xl font-bold text-purple-400 mb-1">{addOn.price}</p>
                    <p className="text-sm text-gray-400">{addOn.description}</p>
                  </div>
                </div>
                <button className="w-full btn-outline text-sm py-3">
                  Learn More
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="space-y-8">
          <h2 className="text-3xl font-semibold text-white text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">{faq.question}</h3>
                <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-32 translate-x-32"></div>
            
            <div className="relative z-10 space-y-6">
              <Rocket className="w-16 h-16 text-white mx-auto animate-bounce" />
              <h2 className="text-3xl font-bold text-white">
                Ready to Start Your Journey?
              </h2>
              <p className="text-xl text-white/90">
                Join thousands of creators who trust Vauntico for their success
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/signup" className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-lg">
                  Start Free Trial
                </Link>
                <Link to="/demo" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors text-lg">
                  Schedule Demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
