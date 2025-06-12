/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        basketball: {
          orange: '#FF8C00',
          court: '#8B4513',
          'court-light': '#D2B48C'
        }
      },
      fontFamily: {
        'mono': ['Courier New', 'monospace'],
        'display': ['Arial', 'sans-serif']
      }
    },
  },
  plugins: [],
} 