'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

export function TrustScoreWidget() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [score, setScore] = useState(0);

  // Animate number counting
  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const end = 87;
    const duration = 2000;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setScore(end);
        clearInterval(timer);
      } else {
        setScore(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [isInView]);

  const metrics = [
    { label: 'Engagement Rate', value: 'Excellent', color: 'green' },
    { label: 'Content Consistency', value: 'Strong', color: 'green' },
    { label: 'Audience Growth', value: 'Good', color: 'yellow' }
  ];

  return (
    <section ref={ref} className="py-32 relative overflow-hidden">

      {/* Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/10 to-transparent"/>

      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="text-white">AI-Powered</span><br/>
            <span className="gradient-text">Trust Scoring</span>
          </h2>
          <p className="text-xl text-gray-400">Real-time reputation analysis for the creator economy</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <p className="text-xl text-gray-400 leading-relaxed mb-8">
              Claude AI analyzes your creator metrics—engagement, consistency,
              audience growth—to generate a dynamic trust score that builds
              credibility with your audience.
            </p>

            <ul className="space-y-4">
              {[
                'Real-time reputation analysis',
                'Historical performance tracking',
                'Actionable improvement recommendations'
              ].map((item) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-green-400/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-400 text-sm">✓</span>
                  </div>
                  <span className="text-gray-300">{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Right: Interactive Score Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="relative"
          >

            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 blur-3xl"/>

            <div className="
              relative
              glass
              rounded-3xl
              p-8
              glow-card
            ">

              {/* Score Circle */}
              <div className="flex items-center justify-center mb-8">
                <div className="relative w-48 h-48">
                  {/* Background circle */}
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="12"
                      fill="none"
                    />
                    {/* Animated progress circle */}
                    <motion.circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="url(#gradient)"
                      strokeWidth="12"
                      fill="none"
                      strokeLinecap="round"
                      initial={{ strokeDasharray: "0 552" }}
                      animate={isInView ? { strokeDasharray: "481 552" } : {}} // 87% of 552
                      transition={{ duration: 2, ease: "easeOut" }}
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#667eea" />
                        <stop offset="50%" stopColor="#764ba2" />
                        <stop offset="100%" stopColor="#f093fb" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Score number */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.div
                      className="text-6xl font-bold gradient-text"
                    >
                      {score}
                    </motion.div>
                    <div className="text-sm text-gray-400">/ 100</div>
                  </div>
                </div>
              </div>

              {/* Breakdown */}
              <div className="space-y-4">
                {metrics.map((metric, idx) => (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 1 + (idx * 0.1) }}
                    className="flex items-center justify-between p-4 glass rounded-xl"
                  >
                    <span className="text-gray-400">{metric.label}</span>
                    <span className={`
                      px-3 py-1 rounded-full text-sm font-medium
                      ${metric.color === 'green' ? 'bg-green-400/20 text-green-400' : 'bg-yellow-400/20 text-yellow-400'}
                    `}>
                      {metric.value}
                    </span>
                  </motion.div>
                ))}
              </div>

            </div>
          </motion.div>

        </div>

      </div>

    </section>
  );
}
