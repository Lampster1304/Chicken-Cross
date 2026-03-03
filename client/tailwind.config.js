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
        bg: {
          primary: '#1a1b3a',
          secondary: '#12132a',
          surface: '#252660',
          surfaceHover: '#2a2b5a',
          surfaceLight: '#2f3070',
        },
        action: {
          primary: '#a3e635',
          primaryHover: '#84cc16',
          secondary: '#8b5cf6',
        },
        danger: '#ff6b6b',
        success: '#2dd4bf',
        brand: {
          DEFAULT: '#fbbf24',
          light: '#fcd34d',
          dark: '#d97706',
        },
        txt: {
          DEFAULT: '#f8fafc',
          muted: '#94a3b8',
          dim: '#64748b',
        },
        // Keep old surface/accent tokens as aliases so nothing breaks
        surface: {
          DEFAULT: '#1a1b3a',
          50: '#252660',
          100: '#2a2b5a',
          200: '#3d3f7a',
          300: '#4a4c8a',
          400: '#5b5d9a',
        },
        accent: {
          green: '#2dd4bf',
          red: '#ff6b6b',
          blue: '#60a5fa',
          purple: '#8b5cf6',
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
