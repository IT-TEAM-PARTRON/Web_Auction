/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
    fontFamily: {
      sans: ['Maven Pro', 'Helvetica', 'sans-serif'],
    },
  },
  },
  plugins: [require('tailwind-scrollbar-hide')],
}

