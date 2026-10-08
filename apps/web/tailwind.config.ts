import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FAF5EE",
        ivory: "#FFFBF5",
        blush: "#F3DDD6",
        rose: { DEFAULT: "#B76E79", dark: "#9A5560" },
        cocoa: "#5A4033",
        charcoal: "#2B2523",
        gold: "#B8945A",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
