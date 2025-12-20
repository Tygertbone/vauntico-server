/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        vault: {
          dark: '#1a1a2e',
          purple: '#6c5ce7',
          blue: '#0984e3',
          cyan: '#00cec9',
        },
        // ??? Ancient mystical tones (Sumerian aesthetic)
        ancient: {
          stone: '#2a2520',
          clay: '#8b7355',
          sandstone: '#c9b299',
          gold: '#d4af37',
        },
        // ? Neon cyberpunk (Zoopocalypse inspired)
        neon: {
          blue: '#00f3ff',      // Electric cyan
          purple: '#b300ff',    // Vibrant purple
          pink: '#ff00ff',      // Hot magenta
          green: '#00ff9f',     // Emerald glow
          gold: '#ffd700',      // Enlightenment
        },
        // ?? Cosmic backgrounds
        cosmos: {
          void: '#0a0a0f',      // Deep space
          nebula: '#1a1a2e',    // Current vault-dark
          stardust: '#2d2d44',
          aurora: '#3d3d5c',
        },
        // 🎨 Fancy SaaS Palette - Pure black backgrounds, multi-gradient accents
        'vauntico-bg-primary': '#000000',        // Pure black (not #0A0A0A)
        'vauntico-bg-elevated': '#0A0A0A',       // Subtle lift
        'vauntico-bg-surface': '#111111',        // Cards
        'vauntico-text-primary': '#FFFFFF',
        'vauntico-text-secondary': '#A0A0A0',
        'vauntico-text-muted': '#666666',
        'vauntico-border-subtle': 'rgba(255, 255, 255, 0.06)',
        'vauntico-border-medium': 'rgba(255, 255, 255, 0.12)',
        'vauntico-border-strong': 'rgba(255, 255, 255, 0.24)',
        // ?? Spiritual awakening (chakra system)
        chakra: {
          crown: '#9d4edd',     // Purple (consciousness)
          third: '#5a189a',     // Deep purple (intuition)
          throat: '#0096c7',    // Blue (expression)
          heart: '#06ffa5',     // Green (connection)
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      animation: {
        'reality-warp': 'realityWarp 2s ease-in-out infinite',
        'expand-ring': 'expandRing 3s ease-out infinite',
        'door-kaleidoscope-left': 'doorKaleidoscopeLeft 2s ease-out forwards',
        'door-kaleidoscope-right': 'doorKaleidoscopeRight 2s ease-out forwards',
        'ego-death': 'egoDeath 1s ease-out forwards',
        'particle-explode': 'particleExplode 1.5s ease-out forwards',
        'mandala-zoom': 'mandalaZoom 2s ease-in-out infinite',
        'white-light-flood': 'whiteLightFlood 0.5s ease-out forwards',
        'third-eye-awakening': 'thirdEyeAwakening 1s ease-out 2.5s forwards',
        'third-eye-open': 'thirdEyeOpen 1s ease-out forwards',
        'energy-spoke': 'energySpoke 3s linear infinite',
        'sacred-spin': 'spin 30s linear infinite',
        'sacred-spin-reverse': 'spin 30s linear infinite reverse',
        'fade-in-slow': 'fadeIn 2s ease-out forwards',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
        'glyph-breathe': 'glyphBreathe 3s ease-in-out infinite',
        'vault-open-left-3d': 'vaultOpenLeft3D 2s ease-out forwards',
        'vault-open-right-3d': 'vaultOpenRight3D 2s ease-out forwards',
        'light-beam-epic': 'lightBeamEpic 2s ease-out forwards',
        'third-eye-epic': 'thirdEyeEpic 1.5s ease-out 1.5s forwards',
        'fade-in-epic': 'fadeInEpic 1s ease-out 2.5s forwards',
        'glyph-pulse': 'glyphPulse 2s ease-in-out infinite',
        'float-particle': 'floatParticle 4s ease-in-out infinite',
        'edge-glow': 'edgeGlow 2s ease-in-out infinite',
        'light-ray': 'lightRay 2s ease-out forwards',
        'pulse-ring': 'pulseRing 3s ease-out infinite',
        'neural-pulse': 'neuralPulse 2s ease-in-out infinite',
      },
      keyframes: {
        realityWarp: {
          '0%, 100%': { filter: 'hue-rotate(0deg) saturate(1)' },
          '50%': { filter: 'hue-rotate(45deg) saturate(1.5)' },
        },
        expandRing: {
          '0%': { transform: 'scale(0)', opacity: '0.6' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        doorKaleidoscopeLeft: {
          '0%': { transform: 'translateX(0) rotateY(0deg) scale(1)', filter: 'hue-rotate(0deg)' },
          '100%': { transform: 'translateX(-100%) rotateY(-90deg) scale(0.5)', filter: 'hue-rotate(180deg)', opacity: '0' },
        },
        doorKaleidoscopeRight: {
          '0%': { transform: 'translateX(0) rotateY(0deg) scale(1)', filter: 'hue-rotate(0deg)' },
          '100%': { transform: 'translateX(100%) rotateY(90deg) scale(0.5)', filter: 'hue-rotate(180deg)', opacity: '0' },
        },
        egoDeath: {
          '0%': { opacity: '0', filter: 'blur(0px)' },
          '100%': { opacity: '1', filter: 'blur(2px)' },
        },
        particleExplode: {
          '0%': { transform: 'translate(-50%, -50%) scale(1)', opacity: '1' },
          '100%': { transform: 'translate(calc(-50% + var(--particle-x)), calc(-50% + var(--particle-y))) scale(0)', opacity: '0' },
        },
        mandalaZoom: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.3)' },
        },
        whiteLightFlood: {
          '0%': { opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0.3' },
        },
        thirdEyeAwakening: {
          '0%': { opacity: '0', transform: 'scale(0)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        thirdEyeOpen: {
          '0%': { transform: 'scale(0) rotate(-180deg)', opacity: '0' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        energySpoke: {
          '0%, 100%': { opacity: '0.3', height: '300px' },
          '50%': { opacity: '0.8', height: '400px' },
        },
        glyphBreathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.4' },
          '50%': { transform: 'scale(1.2)', opacity: '0.8' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        vaultOpenLeft3D: {
          '0%': { transform: 'perspective(1000px) translateX(0) rotateY(-2deg)', opacity: '1' },
          '100%': { transform: 'perspective(1000px) translateX(-100%) rotateY(-45deg)', opacity: '0.3' },
        },
        vaultOpenRight3D: {
          '0%': { transform: 'perspective(1000px) translateX(0) rotateY(2deg)', opacity: '1' },
          '100%': { transform: 'perspective(1000px) translateX(100%) rotateY(45deg)', opacity: '0.3' },
        },
        lightBeamEpic: {
          '0%': { opacity: '0', transform: 'scale(0.5)' },
          '50%': { opacity: '1', transform: 'scale(1.2)' },
          '100%': { opacity: '0.8', transform: 'scale(1)' },
        },
        thirdEyeEpic: {
          '0%': { opacity: '0', transform: 'scale(0) rotate(-180deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(0deg)' },
        },
        fadeInEpic: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        glyphPulse: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.1)' },
        },
        floatParticle: {
          '0%, 100%': { transform: 'translateY(0) translateX(0)', opacity: '0.3' },
          '50%': { transform: 'translateY(-30px) translateX(10px)', opacity: '0.6' },
        },
        edgeGlow: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.8' },
        },
        lightRay: {
          '0%': { opacity: '0', height: '0%' },
          '50%': { opacity: '0.6', height: '100%' },
          '100%': { opacity: '0', height: '100%' },
        },
        pulseRing: {
          '0%': { transform: 'translate(-50%, -50%) scale(0.8)', opacity: '0.6' },
          '100%': { transform: 'translate(-50%, -50%) scale(1.5)', opacity: '0' },
        },
        neuralPulse: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        // 🎭 Fancy SaaS Keyframes
        gradientX: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
        gradientY: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'center top'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'center bottom'
          },
        },
        gradientXY: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left top'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right bottom'
          },
        },
        gradientShift: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -30px) scale(1.1)' },
          '66%': { transform: 'translate(-30px, 30px) scale(0.9)' },
        },
      },
    },
  },
  plugins: [],
}
