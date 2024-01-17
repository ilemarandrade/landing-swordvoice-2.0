import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sedgwick: "var(--font-sedgwick)"
      },
      fontSize: {
        xs: ["14px", "18px"],
        base: ["16px", "24px"],
        md: ["18px", "24px"],
        lg: ["20px", "28px"],
        xl: ["24px", "32px"],
        title: ["48px", "56px"],
      },
      backgroundImage: {
        home: "url('/backgrounds/homeBackground.jpg')",
        whatIsSwordvoices:
          "url('/backgrounds/whatIsSwordvoicesBackground.jpg')",
        ourSwordVoices: "url('/backgrounds/ourSwordVoicesBackground.jpg')",
        ourPathsBackground: "url('/backgrounds/ourPathsBackground.jpg')",
      },
      colors: {
        primary: "#FF7A00",
        secondary: "#00C2FF",
        grey: "#C4C4C4",
        "grey-ligth": "#E2E2E2",
        blurry: "#00000099",
        blue: "#104454",
        blueGra1: "#00236859",
        blueGra2: "#00236859"
      },
      animation: {
        'spin-slow': 'spin 2s linear 1',
      }
    },
  },
  plugins: [],
};
export default config;
