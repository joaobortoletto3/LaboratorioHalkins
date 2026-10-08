import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./hooks/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#050507",
        abyss: "#090A0F",
        panel: "#101116",
        blood: "#D71920",
        flare: "#FF1B1B",
        rust: "#730000",
        cold: "#0D47A1",
        bone: "#F4F4F5",
        ash: "#9CA3AF",
        term: "#35FF69",
        alert: "#FFCC00",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 24px rgba(255,27,27,0.35)",
        "glow-sm": "0 0 10px rgba(255,27,27,0.35)",
        term: "0 0 18px rgba(53,255,105,0.25)",
        cold: "0 0 30px rgba(13,71,161,0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
