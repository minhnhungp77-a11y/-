/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        practice: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
          500: '#8c7851',
          600: '#736141',
          700: '#5a4b33',
          800: '#423828',
        }
      }
    },
  },
  plugins: [],
}
