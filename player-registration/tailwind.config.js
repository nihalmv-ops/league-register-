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
          darkest: '#09090b',     // Deepest pitch black
          darker: '#0f0f14',      // Onyx dark background
          dark: '#15151e',        // Elevated dark surface
          card: '#1c1c26',        // Dark stadium card
          cardHover: '#242432',   // Card hover surface
          border: '#333345',      // Clean dark border
          borderSubtle: '#222230',// Subtle dividers
          muted: '#9ca3af',       // Muted text
        },
        football: {
          accent: '#f97316',       // Vibrant stadium blaze orange
          accentHover: '#ea580c',  // Rich deep orange
          glow: '#fb923c',         // Orange glow highlight
          neon: '#ff7700',         // High-vis electric orange
          gold: '#f59e0b',         // Trophy gold
          red: '#ef4444',          // Red card / danger
          blue: '#3b82f6',         // Team badge blue
        }
      },
      boxShadow: {
        'pitch-glow': '0 0 20px -4px rgba(249, 115, 22, 0.35)',
        'pitch-glow-lg': '0 0 35px -5px rgba(249, 115, 22, 0.5)',
        'card-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.7)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
