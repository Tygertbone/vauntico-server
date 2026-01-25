'use client'

import { Navigation } from '../components/Navigation'
import { Footer } from '../components/Footer'
import { Button } from '../components/ui/Button'
import {
  Code2Icon,
  ZapIcon,
  ShieldIcon,
  UsersIcon,
  BarChart3Icon,
  SmartphoneIcon,
  GlobeIcon,
  SparklesIcon
} from 'lucide-react'

export default function ServicesPage() {
  const services = [
    {
      icon: <Code2Icon className="w-8 h-8" />,
      title: 'Custom Development',
      description: 'Tailored software solutions built with cutting-edge technologies for your unique business needs.',
      features: ['Full-stack development', 'API integration', 'Database design', 'Performance optimization']
    },
    {
      icon: <ZapIcon className="w-8 h-8" />,
      title: 'AI & Automation',
      description: 'Leverage artificial intelligence to automate workflows and enhance decision-making processes.',
      features: ['Machine learning models', 'Process automation', 'Intelligent assistants', 'Data analysis']
    },
    {
      icon: <ShieldIcon className="w-8 h-8" />,
      title: 'Security & Compliance',
      description: 'Comprehensive security solutions ensuring your data and systems remain protected.',
      features: ['Penetration testing', 'Security audits', 'Compliance frameworks', 'Encryption solutions']
    },
    {
      icon: <UsersIcon className="w-8 h-8" />,
      title: 'Team Augmentation',
      description: 'Scale your development team with skilled professionals who integrate seamlessly.',
      features: ['Remote developers', 'Tech leadership', 'Knowledge transfer', 'Flexible engagement']
    },
    {
      icon: <BarChart3Icon className="w-8 h-8" />,
      title: 'Business Intelligence',
      description: 'Transform your data into actionable insights with advanced analytics and reporting.',
      features: ['Data visualization', 'Predictive analytics', 'Custom dashboards', 'Real-time monitoring']
    },
    {
      icon: <SmartphoneIcon className="w-8 h-8" />,
      title: 'Mobile Development',
      description: 'Native and cross-platform mobile applications that deliver exceptional user experiences.',
      features: ['iOS development', 'Android development', 'React Native', 'Flutter apps']
    }
  ]

  const processes = [
    {
      step: '01',
      title: 'Discovery & Planning',
      description: 'We start with understanding your vision, goals, and requirements through collaborative workshops.'
    },
    {
      step: '02',
      title: 'Design & Architecture',
      description: 'Our experts design scalable solutions and create detailed technical architectures.'
    },
    {
      step: '03',
      title: 'Development & Testing',
      description: 'Agile development with continuous integration, automated testing, and regular deployments.'
    },
    {
      step: '04',
      title: 'Deployment & Support',
      description: 'Seamless deployment with ongoing monitoring, maintenance, and continuous improvement.'
    }
  ]

  return (
    <div className="min-h-screen bg-background-primary">
      <Navigation />

      <main>
        {/* Hero Section */}
        <section className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-accent-primary/10 px-4 py-2 rounded-full mb-6">
                <SparklesIcon className="w-4 h-4 text-accent-primary" />
                <span className="text-sm font-medium text-accent-primary">Our Services</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-6">
                Expert Solutions for
                <span className="text-accent-primary block">Modern Businesses</span>
              </h1>
              <p className="text-xl text-text-secondary max-w-3xl mx-auto">
                From custom development to AI integration, we provide comprehensive technology services
                that drive innovation and accelerate your business growth.
              </p>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <div key={index} className="bg-background-surface border border-border-default rounded-xl p-8 hover:shadow-lg transition-all">
                  <div className="text-accent-primary mb-4">{service.icon}</div>
                  <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                  <p className="text-text-secondary mb-6">{service.description}</p>
                  <ul className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2 text-sm text-text-secondary">
                        <div className="w-1.5 h-1.5 bg-accent-primary rounded-full flex-shrink-0"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-16 bg-background-surface">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Our Process</h2>
              <p className="text-xl text-text-secondary max-w-2xl mx-auto">
                We follow a proven methodology to ensure successful project delivery and long-term partnership.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {processes.map((process, index) => (
                <div key={index} className="text-center">
                  <div className="bg-accent-primary text-text-primary text-2xl font-bold w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    {process.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{process.title}</h3>
                  <p className="text-text-secondary">{process.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 rounded-2xl p-12">
              <GlobeIcon className="w-16 h-16 text-accent-primary mx-auto mb-6" />
              <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
                Let's discuss your project requirements and create a solution that drives your business forward.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="primary" size="lg">
                  Schedule Consultation →
                </Button>
                <Button variant="secondary" size="lg">
                  View Case Studies
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
