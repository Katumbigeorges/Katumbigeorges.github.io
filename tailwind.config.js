/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#040506",
          900: "#07090b",
          850: "#0a0d10",
          800: "#0e1216",
          700: "#141a20",
          600: "#1c242c",
        },
        acid: {
          DEFAULT: "rgb(var(--acid) / <alpha-value>)", // theme accent (default: HTB green)
          soft: "rgb(var(--acid-soft) / <alpha-value>)",
          dim: "rgb(var(--acid) / 0.65)",
        },
        // #7d8b9e — the dimmest text tone that still clears WCAG AA (5.9:1)
        // on the ink-950 background. Anything darker fails for body copy.
        ash: "#7d8b9e",
        cyan: {
          glow: "#37d6c4",
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
        display: ['"Space Grotesk"', "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ['"Inter"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgb(var(--acid) / 0.25), 0 0 30px -8px rgb(var(--acid) / 0.45)",
        "glow-lg": "0 0 0 1px rgb(var(--acid) / 0.35), 0 0 60px -10px rgb(var(--acid) / 0.55)",
      },
      keyframes: {
        blink: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0" } },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        blink: "blink 1.05s step-end infinite",
        "fade-up": "fade-up 0.6s ease-out both",
      },
    },
  },
  plugins: [],
};
