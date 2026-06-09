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
        'pulse-slow':  'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in':     'fadeIn 0.2s ease-out',
        'slide-up':    'slideUp 0.3s ease-out',
        'float-up':    'floatUp 0.35s ease-out both',
        'scale-in':    'scaleIn 0.25s ease-out both',
        'shimmer':     'shimmer 1.5s infinite',
        'bounce-dot':  'bounceDot 1.4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        floatUp:   { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn:   { from: { opacity: '0', transform: 'scale(0.94)' }, to: { opacity: '1', transform: 'scale(1)' } },
        shimmer:   { '0%': { backgroundPosition: '-200% center' }, '100%': { backgroundPosition: '200% center' } },
        bounceDot: { '0%, 80%, 100%': { transform: 'scale(0.8)', opacity: '0.5' }, '40%': { transform: 'scale(1.2)', opacity: '1' } },
      },
      boxShadow: {
        'glow-green': '0 0 24px -6px rgba(22, 163, 74, 0.45)',
        'glow-gold':  '0 0 24px -6px rgba(217, 119, 6, 0.45)',
        'glow-red':   '0 0 24px -6px rgba(239, 68, 68, 0.45)',
        'glow-blue':  '0 0 24px -6px rgba(59, 130, 246, 0.35)',
        'card':       '0 1px 3px 0 rgba(0,0,0,0.07), 0 1px 2px -1px rgba(0,0,0,0.07)',
        'card-lg':    '0 4px 16px -4px rgba(0,0,0,0.1), 0 2px 6px -2px rgba(0,0,0,0.05)',
      },
    },
  },
  plugins: [],
};
