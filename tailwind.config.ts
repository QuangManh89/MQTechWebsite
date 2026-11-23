import type { Config } from "tailwindcss";

const config: Config = {
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "rgb(var(--rgb-cobalt) / <alpha-value>)",
          hover: "rgb(var(--rgb-cobalt-hover) / <alpha-value>)",
          glow: "rgb(var(--rgb-cyan) / <alpha-value>)",
          light: "rgb(var(--rgb-cobalt-light) / <alpha-value>)",
          soft: "rgb(var(--rgb-cobalt-soft) / <alpha-value>)",
        },
        cta: {
          DEFAULT: "rgb(var(--rgb-cta) / <alpha-value>)",
          hover: "rgb(var(--rgb-cta-hover) / <alpha-value>)",
        },
        navy: {
          DEFAULT: "rgb(var(--rgb-obsidian) / <alpha-value>)",
          surface: "rgb(var(--rgb-navy-surface) / <alpha-value>)",
          border: "rgb(var(--rgb-navy-border) / <alpha-value>)",
        },
        surface: {
          page: "rgb(var(--rgb-surface-page) / <alpha-value>)",
          DEFAULT: "rgb(var(--rgb-surface-canvas) / <alpha-value>)",
          subtle: "rgb(var(--rgb-surface-subtle) / <alpha-value>)",
          muted: "rgb(var(--rgb-surface-muted) / <alpha-value>)",
          inverse: "var(--surface-inverse)",
        },
        ink: {
          DEFAULT: "var(--text-primary)",
          body: "var(--text-body)",
          muted: "var(--text-secondary)",
          subtle: "var(--text-placeholder)",
          inverse: "var(--text-inverse)",
          "inverse-muted": "var(--text-inverse-muted)",
          "inverse-subtle": "var(--text-inverse-subtle)",
        },
        line: {
          DEFAULT: "rgb(var(--rgb-border-default) / <alpha-value>)",
          subtle: "var(--border-subtle)",
          strong: "var(--border-strong)",
        },
        status: {
          "success-bg": "var(--status-success-bg)",
          "success-line": "var(--status-success-border)",
          "success-ink": "var(--status-success-ink)",
          "success-solid": "var(--status-success-solid)",
          "warning-bg": "var(--status-warning-bg)",
          "warning-line": "var(--status-warning-border)",
          "warning-ink": "var(--status-warning-ink)",
          "warning-solid": "var(--status-warning-solid)",
          "warning-star": "var(--status-warning-star)",
          "danger-bg": "var(--status-danger-bg)",
          "danger-line": "var(--status-danger-border)",
          "danger-ink": "var(--status-danger-ink)",
          "danger-solid": "rgb(var(--rgb-danger-solid) / <alpha-value>)",
          "danger-hover": "var(--status-danger-solid-hover)",
          "info-bg": "var(--status-info-bg)",
          "info-line": "var(--status-info-border)",
          "info-ink": "var(--status-info-ink)",
          "info-solid": "var(--status-info-solid)",
        },
      },
      fontFamily: {
        heading: ["var(--font-heading)", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        body: ["var(--font-ibm-plex)", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["var(--font-jetbrains)", "Menlo", "monospace"],
      },
      boxShadow: {
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
        "brand-glow": "var(--shadow-brand-lift)",
        "cta-glow": "var(--shadow-cta-lift)",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        marquee: "marquee 40s linear infinite",
        "accordion-down": "accordion-down 0.22s ease-out",
        "accordion-up": "accordion-up 0.22s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
