/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
    fontFamily: {
      sans: ['Open Sans', 'Helvetica', 'sans-serif'],
      rele: ['DM Sans', 'sans-serif'],
      playfair: ["Playfair Display", "sans-serif"],
    },
  },
  },
  
  plugins: [require('tailwind-scrollbar-hide')],
  plugins: [require("@tailwindcss/typography")],
}

