import type { Config } from "tailwindcss";

// Token presi 1:1 dal DESIGN.md del mockup "Discovery Quest"
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        surface: "#f4fbf7",
        "surface-dim": "#d4dcd8",
        "surface-bright": "#f4fbf7",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#eef5f1",
        "surface-container": "#e8efec",
        "surface-container-high": "#e3eae6",
        "surface-container-highest": "#dde4e0",
        "on-surface": "#161d1b",
        "on-surface-variant": "#3c4a46",
        "inverse-surface": "#2b3230",
        "inverse-on-surface": "#ebf2ef",
        outline: "#6c7a76",
        "outline-variant": "#bbcac4",
        primary: "#006b5c",
        "on-primary": "#ffffff",
        "primary-container": "#00bfa5",
        "on-primary-container": "#00473c",
        "inverse-primary": "#44ddc1",
        secondary: "#9f4200",
        "on-secondary": "#ffffff",
        "secondary-container": "#fd6c00",
        "on-secondary-container": "#562000",
        tertiary: "#9f4128",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#fe896a",
        "on-tertiary-container": "#74220b",
        error: "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
        background: "#f4fbf7",
        "on-background": "#161d1b",
        "surface-variant": "#dde4e0",
        "success-emerald": "#00C853",
        "background-off-white": "#F8FAFC",
        "surface-card": "#FFFFFF",
        "ink-dark": "#0F172A"
      },
      fontFamily: {
        display: ["Hanken Grotesk", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"]
      },
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.5rem"
      },
      spacing: {
        "stack-sm": "12px",
        "stack-md": "24px",
        "stack-lg": "40px"
      }
    }
  },
  plugins: []
} satisfies Config;
