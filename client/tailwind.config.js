/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        casino: {
          dark: '#0f0f23',
          darker: '#0a0a1a',
          card: '#1a1a2e',
          border: '#2a2a4a',
          accent: '#e94560',
          gold: '#ffd700',
          green: '#00d4aa',
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
