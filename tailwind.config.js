/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}" 
  ],
  darkMode: "class", 
  theme: {
    extend: {
      colors: {
        bluePrimary: "#1E3A8A",
        blueSecondary: "#3B82F6",
        blackPrimary: "#000000",
        grayDark: "#1F2937",
      },
      backgroundSize: {
        "size-200": "200% 200%", 
      },
      keyframes: {
        gradientBackground: {
          "0%, 100%": { "background-position": "0% 50%" },
          "50%": { "background-position": "100% 50%" },
        },
      },
      animation: {
        gradientBackground: "gradientBackground 10s ease infinite",
      },
    },
  },
  plugins: [],
};
