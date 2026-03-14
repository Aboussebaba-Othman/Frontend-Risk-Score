/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#1E50A0',
          dark: '#163d7a',
          light: '#2563eb',
        },
        navy: {
          900: '#0a0f1e',
          800: '#0f1729',
          700: '#141e35',
          600: '#1a2640',
        },
        risk: {
          excellent: '#00A36C',
          low: '#2ECC71',
          moderate: '#F39C12',
          medium: '#E67E22',
          high: '#E74C3C',
          critical: '#8E44AD',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideIn: { from: { opacity: '0', transform: 'translateY(-8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
