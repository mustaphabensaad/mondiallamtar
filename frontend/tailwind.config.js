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
        },
        gold: {
          DEFAULT: '#d97706',
          light:   '#f59e0b',
        },
        surface: {
          light: '#ffffff',
          dark:  '#0f172a',
        },
        card: {
          light: '#f8fafc',
          dark:  '#1e293b',
        },
        border: {
          light: '#e2e8f0',
          dark:  '#334155',
        },
      },
      fontFamily: {
        display: ['Cairo', 'sans-serif'],
        body:    ['Tajawal', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
