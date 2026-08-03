/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        accent: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        surface: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        success: { 400: '#4ade80', 500: '#22c55e', 600: '#16a34a' },
        warning: { 400: '#fb923c', 500: '#f97316', 600: '#ea580c' },
        danger:  { 400: '#f87171', 500: '#ef4444', 600: '#dc2626' },
        info:    { 400: '#38bdf8', 500: '#0ea5e9', 600: '#0284c7' },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        'gradient-surface': 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        'gradient-card':    'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.05) 100%)',
        'mesh-gradient':    'radial-gradient(at 40% 20%, hsla(228,100%,74%,0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(263,100%,74%,0.1) 0px, transparent 50%)',
      },
      boxShadow: {
        'glow':       '0 0 20px rgba(99, 102, 241, 0.3)',
        'glow-lg':    '0 0 40px rgba(99, 102, 241, 0.4)',
        'card':       '0 4px 24px rgba(0, 0, 0, 0.08)',
        'card-dark':  '0 4px 24px rgba(0, 0, 0, 0.4)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.1)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'fade-in':      'fadeIn 0.5s ease-in-out',
        'slide-up':     'slideUp 0.4s ease-out',
        'slide-in-left':'slideInLeft 0.3s ease-out',
        'pulse-slow':   'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer':      'shimmer 1.5s infinite',
        'spin-slow':    'spin 3s linear infinite',
        'bounce-soft':  'bounceSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        slideInLeft: {
          '0%':   { transform: 'translateX(-16px)', opacity: '0' },
          '100%': { transform: 'translateX(0)',      opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionDuration: {
        '400': '400ms',
      },
    },
  },
  plugins: [],
};
