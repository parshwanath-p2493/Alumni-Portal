/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',   // for Next.js 13+ app directory
    './pages/**/*.{js,ts,jsx,tsx}', // for pages directory
    './components/**/*.{js,ts,jsx,tsx}',
    './globals.css'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
