'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export function HeroSection() {
  const [terminalText, setTerminalText] = useState('');
  const [showOutput, setShowOutput] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);

  const command = '$ vauntico generate landing-page --workshop "creator-monetization"';

  const outputs = [
    { text: '✓ Analyzing workshop content...', delay: 0 },
    { text: '✓ Generating trust score algorithm...', delay: 400 },
    { text: '✓ Building payment integration...', delay: 800 },
    { text: '✓ Creating email sequences...', delay: 1200 },
  ];

  // Typewriter effect
  useEffect(() => {
    let i = 0;
    const typingSpeed = 50;

    const typingInterval = setInterval(() => {
      if (i < command.length) {
        setTerminalText(command.slice(0, i + 1));
        i++;
      } else {
        clearInterval(typingInterval);
        setTimeout(() => setShowOutput(true), 500);
      }
    }, typingSpeed);

    return () => clearInterval(typingInterval);
  }, []);

  // Cursor blink
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorVisible(v => !v);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">

      {/* Enhanced Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-purple-600/10 to-pink-600/10 animate-gradient-bg blur-3xl"/>

        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/20 rounded-full animate-float" style={{ animationDelay: '0s' }}/>
          <div className="absolute top-40 right-32 w-24 h-24 bg-purple-500/20 rounded-full animate-float" style={{ animationDelay: '2s' }}/>
          <div className="absolute bottom-32 left-1/3 w-40 h-40 bg-pink-500/20 rounded-full animate-float" style={{ animationDelay: '4s' }}/>
        </div>

        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"/>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center w-full">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 mb-8"
        >
          <div className="
            px-4 py-2
            glass
            rounded-full
            text-sm text-gray-300
            flex items-center gap-2
          ">
            <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
            Used by 500+ creators
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="
            text-6xl md:text-8xl lg:text-9xl
            font-bold
            tracking-tighter
            leading-[0.95]
            mb-6
          "
        >
          <span className="text-white">Build Your</span>
          <br/>
          <span className="gradient-text-multi animate-gradient-x">
            Creator Business
          </span>
          <br/>
          <span className="text-white/60 text-5xl md:text-7xl">
            in Minutes, Not Months
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="
            text-xl md:text-2xl
            text-gray-400
            leading-relaxed
            max-w-3xl
            mx-auto
            mb-12
            text-balance
          "
        >
          CLI automation meets trust scoring. Ship landing pages, workshops,
          and payment flows—AI handles the code, you handle the vision.
        </motion.p>

        {/* Enhanced CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
        >
          <button className="btn-primary group">
            <span className="flex items-center gap-2">
              Start Building Free
              <ArrowRight className="w-5 h-5" />
            </span>

            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"/>
          </button>

          <button className="btn-secondary">
            Watch Demo (2 min)
          </button>
        </motion.div>

        {/* Trust Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-sm text-gray-500 mb-16"
        >
          Trusted by agencies · Open source components
        </motion.div>

        {/* Terminal Demo */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="max-w-5xl mx-auto"
        >
          <div className="
            relative
            bg-black
            border border-white/10
            rounded-2xl
            overflow-hidden
            shadow-[0_0_50px_rgba(102,126,234,0.3)]
            hover:shadow-[0_0_80px_rgba(102,126,234,0.4)]
            transition-shadow duration-500
          ">
            {/* Terminal Header */}
            <div className="flex items-center gap-2 px-6 py-4 border-b border-white/10 bg-white/5">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80"/>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"/>
                <div className="w-3 h-3 rounded-full bg-green-500/80"/>
              </div>
              <span className="text-xs text-gray-500 ml-2">terminal — vauntico</span>
            </div>

            {/* Terminal Content */}
            <div className="p-8 font-mono text-sm md:text-base">
              {/* Animated command */}
              <div className="mb-6">
                <span className="text-cyan-400">{terminalText}</span>
                <span className={`${cursorVisible ? 'opacity-100' : 'opacity-0'} transition-opacity`}>_</span>
              </div>

              {/* Animated output */}
              {showOutput && (
                <div className="space-y-2">
                  {outputs.map((output, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: output.delay / 1000 }}
                      className="text-gray-400 flex items-center gap-2"
                    >
                      <span className="text-green-400">✓</span>
                      {output.text}
                    </motion.div>
                  ))}

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.6 }}
                    className="mt-6 pt-4 border-t border-white/10"
                  >
                    <span className="text-green-400">🚀 </span>
                    <span className="text-gray-300">Landing page deployed: </span>
                    <span className="text-cyan-400 underline">yoursite.vercel.app</span>
                  </motion.div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

      </div>

      {/* Scroll Indicator */}
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 2, duration: 1 }}
  className="absolute bottom-12 left-1/2 -translate-x-1/2"
>
  <div className="flex flex-col items-center gap-2 text-gray-500">
    <span className="text-xs">Scroll to explore</span>
    <motion.div
      animate={{ y: [0, 8, 0] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className="w-6 h-10 border-2 border-white/20 rounded-full p-1"
    >
      <div className="w-1 h-2 bg-white/40 rounded-full mx-auto" />
    </motion.div>
  </div>
</motion.div>

</section>
);
}
