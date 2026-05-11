/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          900: "#020617",
          800: "#04101f",
          700: "#0a1422",
          600: "#0f1a2e",
        },
        champagne: {
          50: "#fff8e1",
          100: "#fceabb",
          200: "#f7d488",
          300: "#fbbf24",
          400: "#e7a812",
          500: "#d4a017",
          600: "#a8800f",
        },
        sapphire: {
          400: "#4f87ff",
          500: "#3b6ed8",
          600: "#1f4aa8",
          700: "#0f2a64",
        },
        ivory: "#f8f5ee",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        display: [
          '"Cormorant Garamond"',
          '"Playfair Display"',
          "ui-serif",
          "Georgia",
          "serif",
        ],
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
      letterSpacing: {
        eyebrow: "0.34em",
        wider2: "0.24em",
      },
      boxShadow: {
        "lux-soft": "0 12px 36px rgba(0,0,0,0.16)",
        "lux-elevated": "0 22px 58px rgba(0,0,0,0.32)",
        "lux-hero": "0 30px 80px rgba(0,0,0,0.42)",
        "lux-glow":
          "0 10px 30px rgba(251,191,36,0.18), 0 0 0 1px rgba(251,191,36,0.18)",
        "lux-ring": "0 0 0 3px rgba(251,191,36,0.12)",
      },
      backgroundImage: {
        "lux-radial":
          "radial-gradient(circle at 20% 10%, rgba(251,191,36,0.05), transparent 42%), radial-gradient(circle at 80% 90%, rgba(59,130,246,0.06), transparent 52%)",
        "lux-gold":
          "linear-gradient(135deg, #fbe488 0%, #fbbf24 45%, #d4a017 100%)",
        "lux-rule":
          "linear-gradient(to right, transparent, rgba(251,191,36,0.45), transparent)",
        "lux-card":
          "linear-gradient(180deg, rgba(10,18,32,0.78), rgba(4,11,22,0.92))",
      },
      keyframes: {
        "lux-shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "lux-fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "lux-pulse-ring": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "lux-shimmer": "lux-shimmer 3.2s linear infinite",
        "lux-fade-up": "lux-fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        "lux-pulse-ring": "lux-pulse-ring 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
