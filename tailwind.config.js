/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}"],
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      white: "#FFFFFF",
      rose: "#E8CCC5",
      cream: "#F6E7C6",
      pastel: "#BDCED3",
      clay: "#BBB9B2",
      sage: "#CFD4AE",
      ink: "#373C38",
      muted: "#454B46",
      originalInk: "#807E79",
      neutral: "#E3E3E3",
    },
    extend: {
      fontFamily: {
        heading: ["var(--font-heading)", "sans-serif"],
        sans: ["var(--font-body)", "sans-serif"],
      },
      boxShadow: { glass: "0 16px 50px -24px #807E7940" },
    },
  },
  plugins: [],
};
