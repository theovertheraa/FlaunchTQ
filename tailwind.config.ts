import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050505",
        foreground: "#f5f5f5",
        card: "#0b0b0c",
        border: "#1f1f22",
        muted: "#8a8d98",
        accent: "#d4d4d8",
      },
      boxShadow: {
        soft: "0 0 0 1px rgba(255,255,255,0.03), 0 20px 40px rgba(0,0,0,0.35)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
