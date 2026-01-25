'use client'

import { motion } from 'framer-motion'

export function Footer() {
  const currentYear = new Date().getFullYear()

  const footerSections = [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '#features' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'Integrations', href: '#integrations' },
        { label: 'Changelog', href: '#changelog' }
      ]
    },
    {
      title: 'Resources',
      links: [
        { label: 'Documentation', href: '#docs' },
        { label: 'API Reference', href: '#api' },
        { label: 'Blog', href: '#blog' },
        { label: 'Case Studies', href: '#cases' }
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '#about' },
        { label: 'Careers', href: '#careers' },
        { label: 'Contact', href: '#contact' },
        { label: 'Privacy', href: '#privacy' }
      ]
    },
    {
      title: 'Community',
      links: [
        { label: 'Discord', href: '#discord', external: true },
        { label: 'Twitter', href: '#twitter', external: true },
        { label: 'GitHub', href: '#github', external: true },
        { label: 'Support', href: '#support' }
      ]
    }
  ]

  const socialLinks = [
    { label: 'Twitter', href: '#twitter', icon: '🐦' },
    { label: 'GitHub', href: '#github', icon: '💻' },
    { label: 'LinkedIn', href: '#linkedin', icon: '💼' },
    { label: 'Discord', href: '#discord', icon: '💬' }
  ]

  return (
    <footer className="border-t border-border-default bg-background-primary">
      <div className="max-w-7xl mx-auto px-6 py-16">

        <div className="grid md:grid-cols-5 gap-12 mb-12">

          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="md:col-span-1"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-accent-primary to-accent-primaryHover rounded-lg flex items-center justify-center">
                <span className="text-text-primary font-bold text-xl">V</span>
              </div>
              <span className="text-2xl font-bold">Vauntico</span>
            </div>
            <p className="text-text-tertiary text-sm leading-relaxed mb-6">
              CLI-first AI automation platform for creator economy. Ship landing pages, workshops, and trust scores—production-ready in minutes.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-8 h-8 bg-background-surface border border-border-default rounded-lg flex items-center justify-center hover:border-accent-primary hover:bg-accent-primary/5 transition-all text-text-tertiary hover:text-accent-primary"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </motion.div>

          {/* Footer Links */}
          {footerSections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: sectionIndex * 0.1 }}
              viewport={{ once: true }}
            >
              <h4 className="font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-text-tertiary hover:text-text-primary transition-colors text-sm"
                      target={link.external ? '_blank' : undefined}
                      rel={link.external ? 'noopener noreferrer' : undefined}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Enhanced Newsletter Signup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="border-t border-border-default pt-8 mb-8"
        >
          <div className="max-w-md mx-auto md:mx-0">
            <h4 className="font-semibold mb-2 text-lg">Stay updated</h4>
            <p className="text-text-tertiary text-sm mb-6 leading-relaxed">
              Get the latest features and creator insights delivered to your inbox.
            </p>
            <form className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label htmlFor="newsletter-email" className="form-label">
                    Email address
                  </label>
                  <input
                    id="newsletter-email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    className="form-input"
                    required
                  />
                </div>
                <div className="sm:mt-auto">
                  <button
                    type="submit"
                    className="btn-primary w-full sm:w-auto px-6 py-3"
                  >
                    Subscribe
                  </button>
                </div>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="pt-8 border-t border-border-default flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="text-2xl opacity-20">⚡</div>
            <span className="text-sm text-text-tertiary">We live by what we give</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-text-tertiary">
            <span>© {currentYear} Vauntico. All rights reserved.</span>
            <a href="#privacy" className="hover:text-text-primary transition-colors">Privacy</a>
            <a href="#terms" className="hover:text-text-primary transition-colors">Terms</a>
            <a href="#cookies" className="hover:text-text-primary transition-colors">Cookies</a>
          </div>
        </motion.div>

      </div>
    </footer>
  )
}
