/** @type {import('tailwindcss').Config} */
const { fontFamily } = require("tailwindcss/defaultTheme");

module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        geistSans: ["var(--font-geist-sans)", ...fontFamily.sans],
        geistMono: ["var(--font-geist-mono)", ...fontFamily.mono],
        paprika: ["var(--font-paprika)", ...fontFamily.sans],
        philosopher: ["var(--font-philosopher)", ...fontFamily.sans],
      },
    },
  },
  plugins: [],
};
