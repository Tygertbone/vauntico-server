/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'vauntico-bg-primary': '#000000',
        'vauntico-bg-elevated': '#0A0A0A',
        'vauntico-bg-surface': '#111111',
      },
      animation: {
        'gradient-x': 'gradient-x 15s ease infinite',
        'gradient-shift': 'gradient-shift 15s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
        'gradient-shift': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -30px) scale(1.1)' },
          '66%': { transform: 'translate(-30px, 30px) scale(0.9)' },
        },
        'gradient-y': {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(0, 50px)' },
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      // Keep existing colors for backward compatibility
      background: {
        'primary': '#0A0A0A',
        'surface': '#1A1A1A',
        'elevated': '#2A2A2A',
      },
      text: {
        'primary': '#FFFFFF',
        'secondary': '#A0A0A0',
        'tertiary': '#6B7280',
      },
      accent: {
        'primary': '#6366F1',
        'primaryHover': '#4F46E5',
        'success': '#10B981',
        'warning': '#F59E0B',
      },
      border: {
        'default': '#2A2A2A',
        'hover': '#3A3A3A',
      },
      // Additional design system colors
      'background-surface': '#1A1A1A',
      'text-primary': '#FFFFFF',
      'text-secondary': '#A0A0A0',
      'text-tertiary': '#6B7280',
      'accent-primary': '#6366F1',
      'accent-primaryHover': '#4F46E5',
      'border-default': '#2A2A2A',
      'border-hover': '#3A3A3A',
    },
  },
  plugins: [],
}
