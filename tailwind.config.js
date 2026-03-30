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
          light: '#4a7fd4',
        },
        navy: {
          950: '#060c1a',
          900: '#0b101e',
          800: '#111827',
          700: '#1a2336',
          600: '#243047',
        },
        risk: {
          // Muted, corporate banking palette
          excellent: '#3d8c6a',
          low:       '#5a9b7a',
          moderate:  '#c49a2e',
          medium:    '#b5622f',
          high:      '#a83c3c',
          critical:  '#7a3060',
        },
        corp: {
          muted: '#8494b0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.25s ease-out',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideIn: { from: { opacity: '0', transform: 'translateY(-6px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
