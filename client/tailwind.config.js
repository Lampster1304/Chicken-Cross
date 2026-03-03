/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        surface: {
          DEFAULT: '#0d1117',
          50: '#161b22',
          100: '#1c2333',
          200: '#21293a',
          300: '#2d3748',
          400: '#3d4a5c',
        },
        brand: {
          DEFAULT: '#f0b429',
          light: '#f7c948',
          dark: '#de911d',
          muted: '#f0b429',
        },
        accent: {
          green: '#34d399',
          red: '#f87171',
          blue: '#60a5fa',
          purple: '#a78bfa',
        },
        txt: {
          DEFAULT: '#e2e8f0',
          muted: '#8b95a8',
          dim: '#4a5568',
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'crash-in': 'crash-in 0.4s ease-out',
        'crash-shake': 'crash-shake 0.6s ease-out',
        'chicken-idle': 'chicken-idle 1.5s ease-in-out infinite',
        'bounce-slow': 'bounce-slow 2s ease-in-out infinite',
        'pulse-subtle': 'pulse-subtle 1.5s ease-in-out infinite',
        'pulse-fast': 'pulse-fast 0.5s ease-in-out infinite',
        'explosion': 'explosion 0.5s ease-out forwards',
        'hop-up': 'hop-up 0.4s ease-out',
        'lane-reveal': 'lane-reveal 0.3s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'car-pass-ltr': 'car-pass-ltr 3s linear infinite',
        'car-pass-rtl': 'car-pass-rtl 3s linear infinite',
      },
    },
  },
  plugins: [],
};
