import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#080c14",
          surface: "#0e1524",
          card: "#131b2e",
          border: "#1f2d48",
          muted: "#94a3b8",
          emerald: "#10b981",
          emeraldDark: "#059669",
          cyan: "#06b6d4",
          blue: "#3b82f6",
          amber: "#f59e0b",
          rose: "#f43f5e",
        },
      },
    },
  },
  plugins: [],
};

export default config;
