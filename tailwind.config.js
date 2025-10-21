/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#E6EBEE",
          100: "#C2CCD1",
          200: "#9EADB3",
          300: "#7A8E96",
          400: "#576F79",
          500: "#69818D",
          600: "#5A636A",
          700: "#2D4A53",
          800: "#132E35",
          900: "#0D1F23",
        },
        secondary: "#2D4A53",
        accent: "#AFB3B7",
      },
    },
  },
  plugins: [],
};
