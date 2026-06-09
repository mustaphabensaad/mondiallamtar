/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#16a34a',
          dark:    '#15803d',
          light:   '#22c55e',
        },
        secondary: {
          DEFAULT: '#1e40af',
          dark:    '#1d4ed8',
          light:   '#3b82f6',
        },
        gold: {
          DEFAULT: '#d97706',
          light:   '#f59e0b',
        },
        surface: {
          light: '#f9fafb',
          dark:  '#0a0f1e',
        },
        card: {
          light: '#ffffff',
          dark:  '#111827',
        },
        border: {
          light: '#e5e7eb',
          dark:  '#1f2937',
        },
      },
      fontFamily: {
        display: ['Cairo', 'sans-serif'],
        body:    ['Tajawal', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in':    'fadeIn 0.2s ease-out',
        'slide-up':   'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' },                     to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
      boxShadow: {
        'glow-green': '0 0 20px -5px rgba(22, 163, 74, 0.4)',
        'glow-gold':  '0 0 20px -5px rgba(217, 119, 6, 0.4)',
        'glow-red':   '0 0 20px -5px rgba(239, 68, 68, 0.4)',
      },
    },
  },
  plugins: [],
};
