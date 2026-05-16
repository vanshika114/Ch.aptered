/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1F3864',      // Navy blue
        secondary: '#4F81BD',    // Sky blue
        accent: '#E8894A',       // Warm amber
        background: '#FAFAF8'    // Off-white
      }
    },
  },
  plugins: [],
}