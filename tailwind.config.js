/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#258A5E",
        background: "#F9FAF4",
        text: "#787973",
        button: "#FCC232",
      },
      fontFamily: {
        sans: ["Helvetica", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};
