import React from 'react';
import { CheckIcon, CloudIcon, ShieldCheckIcon, CogIcon, DocumentTextIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import WaitlistSystem from '../components/WaitlistSystem';

const Home = () => {
  const services = [
    {
      icon: CloudIcon,
      title: "Enterprise-grade Cloud Migrations",
      description: "Seamless migration of your infrastructure to enterprise-grade cloud platforms with zero downtime.",
      features: ["Zero-downtime migrations", "Automated backups", "Rollback capabilities", "24/7 monitoring"]
    },
    {
      icon: ShieldCheckIcon,
      title: "Terraform Automation & Policy Management",
      description: "Infrastructure as Code with automated policy enforcement and compliance checks.",
      features: ["IaC automation", "Policy enforcement", "Compliance scanning", "Multi-cloud support"]
    },
    {
      icon: CogIcon,
      title: "Contributor Onboarding Workflows",
      description: "Streamlined contributor workflows with automated onboarding and access management.",
      features: ["Automated onboarding", "Access management", "Role-based permissions", "Audit trails"]
    },
    {
      icon: DocumentTextIcon,
      title: "SSL Lifecycle Automation",
      description: "Automated SSL certificate management with proactive renewal and deployment.",
      features: ["Auto-renewal", "Multi-provider support", "Certificate monitoring", "Compliance reporting"]
    },
    {
      icon: CloudIcon,
      title: "OCI Bastion Secure Backend Deployment",
      description: "Secure backend deployment through OCI Bastion with enhanced security controls.",
      features: ["Bastion access", "Secure tunnels", "Audit logging", "Access controls"]
    },
    {
      icon: CheckIcon,
      title: "Cloudflare CDN Integration",
      description: "Global CDN integration with DDoS protection and performance optimization.",
      features: ["Global CDN", "DDoS protection", "Performance optimization", "Analytics integration"]
    },
    {
      icon: ShieldCheckIcon,
      title: "Monitoring & Alerting",
      description: "Comprehensive monitoring with Sentry integration and Slack alerting.",
      features: ["Sentry error tracking", "Slack notifications", "Performance metrics", "Uptime monitoring"]
    },
    {
      icon: CurrencyDollarIcon,
      title: "Payment Processing",
      description: "Integrated payment processing with Paystack and Stripe scaffolding.",
      features: ["Paystack integration", "Stripe scaffold", "Multi-currency support", "Webhook handling"]
    }
  ];

  const pricingTiers = [
    {
      name: "Starter",
      price: "$99",
      period: "/month",
      description: "Perfect for individual creators starting their journey",
      features: [
        "Up to 3 projects",
        "Basic monitoring",
        "Email support",
        "Community access",
        "SSL certificates (5)"
      ],
      highlighted: false,
      cta: "Start Free Trial"
    },
    {
      name: "Growth",
      price: "$299",
      period: "/month",
      description: "Ideal for growing creator businesses and teams",
      features: [
        "Up to 10 projects",
        "Advanced monitoring",
        "Priority email support",
        "Team collaboration (5 users)",
        "SSL certificates (20)",
        "API access",
        "Custom integrations"
      ],
      highlighted: true,
      cta: "Most Popular"
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "Comprehensive solution for large organizations",
      features: [
        "Unlimited projects",
        "Enterprise monitoring",
        "24/7 phone support",
        "Unlimited team members",
        "Unlimited SSL certificates",
        "Advanced API access",
        "Custom integrations",
        "Dedicated account manager",
        "SLA guarantees"
      ],
      highlighted: false,
      cta: "Contact Sales"
    }
  ];

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Vauntico: Enterprise Creator Platform
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto">
            Professional-grade infrastructure automation, cloud migration, and creator tools for modern content businesses.
            Built by creators, for creators.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <div className="flex items-center">
              <CheckIcon className="h-6 w-6 text-green-400 mr-2" />
              <span className="text-lg text-gray-300">Enterprise Security</span>
            </div>
            <div className="flex items-center">
              <CheckIcon className="h-6 w-6 text-green-400 mr-2" />
              <span className="text-lg text-gray-300">100% Uptime SLA</span>
            </div>
            <div className="flex items-center">
              <CheckIcon className="h-6 w-6 text-green-400 mr-2" />
              <span className="text-lg text-gray-300">24/7 Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-6 bg-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Our Services</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Comprehensive infrastructure and creator tools designed for scale and reliability
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-all duration-300">
                <service.icon className="h-12 w-12 text-purple-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
                <p className="text-gray-400 mb-4">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-purple-900/50 to-blue-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Transparent Pricing</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Choose the perfect plan for your creator business needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <div key={index} className={`relative bg-gray-800 rounded-2xl p-8 border ${tier.highlighted ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-gray-700'} hover:border-purple-400 transition-all duration-300`}>
                {tier.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {tier.cta}
                    </span>
                  </div>
                }
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-white">{tier.price}</span>
                    <span className="text-gray-400 ml-1">{tier.period}</span>
                  </div>
                </div>
                
                <p className="text-gray-300 mb-6">{tier.description}</p>
                
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                  <button className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                  tier.highlighted 
                    ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}>
                  {tier.name === 'Enterprise' ? 'Contact Sales' : tier.name === 'Starter' ? 'Start Free Trial' : 'Get Started'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Score Calculator */}
      <section className="py-20 px-6 bg-gray-800/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Calculate Your Creator Trust Score</h2>
            <p className="text-xl text-gray-300">
              Get instant insights into your creator reputation and platform credibility
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <WaitlistSystem />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-purple-900/50 to-blue-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Scale Your Creator Business?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of creators who trust Vauntico for their infrastructure needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#pricing" className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
              View Pricing Plans
            </a>
            <a href="#services" className="px-8 py-4 border border-gray-600 text-white rounded-lg font-semibold hover:bg-gray-800 transition-all">
              Explore Services
            </a>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
