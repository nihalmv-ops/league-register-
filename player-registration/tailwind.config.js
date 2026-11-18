/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        pitch: {
          darkest: '#080c14',
          darker: '#0d131f',
          dark: '#131b2c',
          card: '#162033',
          cardHover: '#1c2940',
          border: '#24344d',
          borderSubtle: '#1a273b',
          muted: '#94a3b8',
        },
        football: {
          accent: '#10b981',
          accentHover: '#059669',
          glow: '#34d399',
          neon: '#22c55e',
          gold: '#eab308',
          red: '#ef4444',
          blue: '#3b82f6',
        }
      },
      boxShadow: {
        'pitch-glow': '0 0 20px -5px rgba(16, 185, 129, 0.25)',
        'pitch-glow-lg': '0 0 35px -5px rgba(16, 185, 129, 0.35)',
        'card-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
