/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colours: {
        "background-main": "#F2F2F2",
        "background-secondary": "#404040",
        "background-tertiary": "#58B480",
        "accent-main": "#58B480",
        "accent-secondary": "#404040",
        "text-main": "#F2F2F2",
        "text-secondary": "#404040",
        "text-tertiary": "#03090D",
      },
    },
  },
  plugins: [],
}