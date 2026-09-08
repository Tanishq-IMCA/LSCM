import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#050816",
        panel: "#0c1326",
        frost: "rgba(255, 255, 255, 0.08)",
        line: "rgba(255, 255, 255, 0.12)",
        accent: "#8bc5ff",
        muted: "#9aa8c3",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      boxShadow: {
        panel: "0 24px 80px rgba(3, 8, 20, 0.35)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
