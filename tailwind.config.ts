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
        sedgwick: "var(--font-sedgwick)",
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
        blue200: "#00B2FF",
        blue300: "#00136856"
      },

      fontSize: {
        xs: ["14px", "18px"],
        base: ["16px", "24px"],
        md: ["18px", "24px"],
        lg: ["20px", "28px"],
        xl: ["24px", "28px"],
        title: ["48px", "56px"],
      },
      animation: {
        'spin-slow': 'spin 2s linear 1',
      }
    },
  },
  plugins: [
    function ({ addComponents }:any) {
      const newComponents = {
        '.my-slider .slick-slide.slick-active': {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        },
      };

      addComponents(newComponents);
    },
  ],
};
export default config;
