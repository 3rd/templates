/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        gray: {
          50: "#f7f7f7",
          100: "#f0f0f0",
          200: "#e3e3e3",
          300: "#d1d1d1",
          400: "#c2c2c2",
          500: "#aaaaaa",
          600: "#969696",
          700: "#818181",
          800: "#6a6a6a",
          900: "#585858",
          950: "#333333",
        },
      },
    },
  },
  plugins: [],
};
