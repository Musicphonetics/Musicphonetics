import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Musicphonetics brand palette
        ink: "#161B26",
        gold: "#C9A227",
        "gold-soft": "#E7C86A",
        "deep-gold": "#A8851B",
        paper: "#F6F4EF",
        mist: "#ECE8DF",
        cream: "#F6F0E4",
        "cream-2": "#F1E8D6",
        "feature-green": "#1F3D2F",
        midnight: "#0B0F18",
        // Institution palette (revamp brief): charcoal surfaces, ivory text,
        // gold as accent only, muted/line for secondary + hairlines.
        // Balanced dark: warm slate surfaces, lifted off near-black so the site
        // reads rich and premium rather than heavy.
        charcoal: "#232834",
        "charcoal-2": "#1B202A",
        ivory: "#F5F1E8",
        muted: "#8A8578",
        line: "#DED6C4",
        forest: "#2C4636",
        // legacy dark tokens (kept so older components still compile)
        onyx: "#0A0B0E",
        "onyx-1": "#101217",
        "onyx-2": "#161920",
      },
      borderColor: {
        hairline: "rgba(22,27,38,.14)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Fraunces", "Georgia", "serif"],
        body: ["var(--font-body)", "Hanken Grotesk", "system-ui", "sans-serif"],
        script: ["var(--font-script)", "cursive"],
      },
      maxWidth: {
        content: "1200px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s ease-out forwards",
      },
      boxShadow: {
        card: "0 1px 2px rgba(22,27,38,.04), 0 8px 24px rgba(22,27,38,.06)",
        "card-hover": "0 4px 8px rgba(22,27,38,.06), 0 16px 40px rgba(22,27,38,.10)",
      },
    },
  },
  plugins: [],
};

export default config;
