'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Button } from './ui/Button'

interface NavigationProps {
  variant?: 'A' | 'B' | 'C'
  onVariantChange?: (variant: 'A' | 'B' | 'C') => void
}

export function Navigation({ variant, onVariantChange }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)

  const navItems = [
    { label: 'Product', href: '#product' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Docs', href: '#docs' },
    { label: 'Blog', href: '#blog' }
  ]

  const services = [
    { label: 'Workshop Kit', href: '#workshop' },
    { label: 'Audit Service', href: '#audit' },
    { label: 'Add-ons', href: '#addons' }
  ]

  return (
    <>
      {/* Skip link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus-visible bg-accent-primary text-text-primary px-4 py-2 rounded-lg focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary"
      >
        Skip to main content
      </a>

      {/* Enhanced Sticky Navigation Bar */}
      <nav className="sticky-nav bg-background-primary/80 backdrop-blur-lg border-b border-border-default" role="navigation" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-6 md:px-8 h-16 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-accent-primary to-accent-primary rounded-lg flex items-center justify-center">
              <span className="text-text-primary font-bold text-xl">V</span>
            </div>
            <span className="text-2xl font-bold">Vauntico</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-text-secondary hover:text-accent-primary font-medium transition-all duration-300 hover:scale-105 px-3 py-2 rounded-md relative group"
              >
                {item.label}
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-accent-primary transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
              </a>
            ))}

            {/* Services Dropdown */}
            <div className="relative group">
              <button
                className="text-text-secondary hover:text-text-primary font-medium transition-colors flex items-center gap-1"
                aria-label="Services menu"
                aria-expanded="false"
              >
                Services
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown menu */}
              <div className="absolute top-full left-0 mt-2 w-48 bg-background-surface border border-border-default rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                {services.map((service) => (
                  <a
                    key={service.label}
                    href={service.href}
                    className="block px-4 py-2 text-text-secondary hover:text-text-primary hover:bg-background-elevated transition-colors first:rounded-t-lg last:rounded-b-lg"
                  >
                    {service.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Variant Toggle for Development */}
            {onVariantChange && (
              <div className="ml-4 flex gap-1 p-1 bg-background-surface border border-border-default rounded-lg">
                {(['A', 'B', 'C'] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => onVariantChange(v)}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      variant === v
                        ? 'bg-accent-primary text-text-primary'
                        : 'text-text-tertiary hover:text-text-secondary'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            <a href="#signin" className="text-text-secondary hover:text-text-primary transition-colors font-medium">
              Login
            </a>
            <Button variant="primary" href="#get-started">
              Start Free →
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-text-secondary hover:bg-background-surface hover:text-text-primary transition-colors"
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border-default bg-background-primary">
            <div className="max-w-7xl mx-auto px-6 py-6 space-y-4">

              {/* Variant Toggle for Mobile */}
              {onVariantChange && (
                <div className="flex gap-2 p-1 bg-background-surface border border-border-default rounded-lg mb-4">
                  {(['A', 'B', 'C'] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => onVariantChange(v)}
                      className={`flex-1 py-2 px-3 text-sm rounded transition-colors ${
                        variant === v
                          ? 'bg-accent-primary text-text-primary'
                          : 'text-text-tertiary hover:text-text-secondary'
                      }`}
                    >
                      Variant {v}
                    </button>
                  ))}
                </div>
              )}

              {/* Navigation Links */}
              <div className="space-y-2">
                {navItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="block py-2 text-text-secondary hover:text-text-primary font-medium transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}

                {/* Services Submenu */}
                <div className="pt-2 border-t border-border-default">
                  <div className="text-sm font-semibold text-text-tertiary mb-2">Services</div>
                  {services.map((service) => (
                    <a
                      key={service.label}
                      href={service.href}
                      className="block py-2 pl-4 text-text-secondary hover:text-text-primary transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {service.label}
                    </a>
                  ))}
                </div>
              </div>

              {/* Mobile CTA Buttons */}
              <div className="pt-4 border-t border-border-default space-y-3">
                <Button variant="secondary" className="w-full" href="#signin">
                  Login
                </Button>
                <Button variant="primary" className="w-full" href="#get-started">
                  Start Free →
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}
