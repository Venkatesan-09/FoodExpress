/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          DEFAULT: '#ea580c',
        },
        brand: '#ea580c',
        surface: {
          DEFAULT: '#ffffff',
          raised: '#fafaf9',
          overlay: '#f5f5f4',
          sunken: '#e7e5e4',
        },
        text: {
          primary: '#1c1917',
          secondary: '#57534e',
          tertiary: '#a8a29e',
          disabled: '#d6d3d1',
          inverse: '#ffffff',
          brand: '#ea580c',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card:   '0.75rem',
        cardLg: '1rem',
      },
      boxShadow: {
        card:      '0 2px 8px rgba(0,0,0,0.08), 0 0 1px rgba(0,0,0,0.04)',
        cardHover: '0 8px 24px rgba(0,0,0,0.12), 0 0 1px rgba(0,0,0,0.06)',
        brand:     '0 4px 14px rgba(234,88,12,0.3)',
        brandHover:'0 6px 20px rgba(234,88,12,0.45)',
      },
      animation: {
        'fade-in':     'fadeIn 0.2s ease',
        'slide-up':    'slideUp 0.3s ease',
        'slide-down':  'slideDown 0.3s ease',
        'pulse-brand': 'pulseBrand 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow':   'spin 3s linear infinite',
        'bounce-light':'bounceLight 1s infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp:   { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideDown: { from: { opacity: 0, transform: 'translateY(-12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        pulseBrand:{
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(234,88,12,0.4)' },
          '50%':      { boxShadow: '0 0 0 12px rgba(234,88,12,0)' },
        },
        bounceLight:{
          '0%, 100%': { transform: 'translateY(0)', animationTimingFunction: 'cubic-bezier(0.8,0,1,1)' },
          '50%':      { transform: 'translateY(-8px)', animationTimingFunction: 'cubic-bezier(0,0,0.2,1)' },
        },
      },
      screens: {
        xs: '375px',
      },
    },
  },
  plugins: [],
}
