import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#C29B78',
          light: '#E8CCA4',
          dim: '#997452',
          dark: '#6A4D32',
        },
        admin: {
          bg:         '#120E0C',
          surface:    '#1A1513',
          card:       '#211B19',
          hover:      '#2A2421',
          border:     'rgba(194, 155, 120, 0.2)',
          border2:    'rgba(194, 155, 120, 0.4)',
          input:      '#1A1513',
          muted:      '#8A7E77',
          subtle:     '#5A514B',
          text:       '#FAFAF9',
          'text-dim': '#EAE3D9',
        },
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans:  ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in':    'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up':   'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-r': 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'spin-slow':  'spin 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
      },
      borderRadius: {
        DEFAULT: '16px',
      },
      boxShadow: {
        'gold-glow': '0 0 30px rgba(194, 155, 120, 0.15)',
        'card':      '0 20px 40px rgba(18, 14, 12, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'card-hover':'0 30px 60px rgba(18, 14, 12, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'modal':     '0 40px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      },
    },
  },
  plugins: [],
}

export default config
