"use client";
import React, { useEffect, useState } from "react";
import { FullLogo } from "./Logo";
import { Eye, Heart, Infinity, Sparkles, Menu, X } from "lucide-react";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUbuntuValue, setCurrentUbuntuValue] = useState("");

  const ubuntuValues = [
    "I am because we are",
    "Together we create abundance",
    "My success lifts others",
    "Community is my foundation",
    "We rise by lifting others",
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomValue =
        ubuntuValues[Math.floor(Math.random() * ubuntuValues.length)];
      setCurrentUbuntuValue(randomValue);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const sacredLinks = [
    { href: "/", label: "Home", icon: Eye },
    { href: "/vaults", label: "Vaults", icon: Infinity },
    { href: "/lore", label: "Lore", icon: Sparkles },
    { href: "/workshop", label: "Workshop", icon: Heart },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-md bg-black/40 border-b border-white/10"
          : "bg-black/20"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Sacred Logo with Ubuntu Integration */}
        <div className="flex items-center space-x-4">
          <FullLogo size="md" />
          <div className="hidden lg:block">
            <div className="text-xs text-gray-400 italic animate-pulse-slow">
              "{currentUbuntuValue}"
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {sacredLinks.map((link, index) => {
            const Icon = link.icon;
            return (
              <a
                key={link.href}
                href={link.href}
                className="group flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 sacred-hover"
              >
                <Icon className="w-4 h-4 text-purple-400 group-hover:text-purple-300" />
                <span className="text-white text-sm font-medium">
                  {link.label}
                </span>
              </a>
            );
          })}

          {/* Sacred CTA Button */}
          <a
            href="/signup"
            className="group relative px-6 py-2 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 sacred-button"
          >
            <span className="relative z-10 flex items-center space-x-2 text-white font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>Begin Ritual</span>
            </span>
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <Menu className="w-6 h-6 text-white" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-black/90 backdrop-blur-lg border-b border-white/10">
          <div className="px-6 py-4 space-y-3">
            {sacredLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <Icon className="w-5 h-5 text-purple-400" />
                  <span className="text-white font-medium">{link.label}</span>
                </a>
              );
            })}

            {/* Mobile Ubuntu Wisdom */}
            <div className="mt-4 p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg border border-purple-500/30">
              <p className="text-sm text-gray-300 italic text-center">
                "{currentUbuntuValue}"
              </p>
            </div>

            {/* Mobile CTA */}
            <a
              href="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full mt-4 px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white font-semibold text-center transition-all duration-300 sacred-button"
            >
              Begin Your Legacy
            </a>
          </div>
        </div>
      )}

      {/* Ubuntu Philosophy Indicator */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
        <div className="flex items-center space-x-2 px-4 py-1 bg-black/60 backdrop-blur-sm rounded-t-lg border border-white/10">
          <Eye className="w-3 h-3 text-purple-400" />
          <Heart className="w-3 h-3 text-pink-400" />
          <Infinity className="w-3 h-3 text-yellow-400" />
          <span className="text-xs text-gray-400 font-medium">Ubuntu</span>
        </div>
      </div>
    </nav>
  );
}
