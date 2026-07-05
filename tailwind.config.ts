import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#15171B",
        panel: "#1D2025",
        panel2: "#25292F",
        line: "#33383F",
        chalk: "#F3EFE8",
        smoke: "#9BA3AD",
        iron: "#E15A2B",
        ironDim: "#7A3A22",
        brass: "#C9A24B",
        good: "#5FA777",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      letterSpacing: {
        widest2: "0.2em",
      },
    },
  },
  plugins: [],
};
export default config;
