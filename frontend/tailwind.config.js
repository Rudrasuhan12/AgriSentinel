/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          950: '#07120c',
          900: '#0c1c14',
          850: '#10251b',
          800: '#173426',
          700: '#214735',
          600: '#2e5f48',
          500: '#3e7b5e',
          400: '#549c79',
        },
        charcoal: {
          950: '#0a0d0c',
          900: '#121614',
          850: '#171d1a',
          800: '#202824',
          700: '#2f3b35',
          600: '#47564e',
        },
        sand: {
          50: '#fcfbf8',
          100: '#f7f4ed',
          200: '#ede6da',
          300: '#ded3c1',
          400: '#c5b59e',
          500: '#a7957b',
        },
        lime: {
          accent: '#b8ee3b',
          glow: '#9ae615',
          dim: 'rgba(184, 238, 59, 0.15)',
        },
        olive: {
          300: '#b8c5a4',
          400: '#9cb085',
          500: '#758d59',
          600: '#546b3e',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'subtle-grid': 'radial-gradient(rgba(184, 238, 59, 0.08) 1px, transparent 1px)',
      },
      boxShadow: {
        'subtle-glow': '0 0 25px -5px rgba(184, 238, 59, 0.12)',
        'premium-card': '0 10px 30px -10px rgba(0, 0, 0, 0.5), 0 0 1px 1px rgba(255, 255, 255, 0.05)',
        'elevated': '0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 1px 1px rgba(184, 238, 59, 0.1)',
      }
    },
  },
  plugins: [],
}

