// EKD Clean - Custom Mantine Theme
// Built by EKD Digital

import { createTheme, MantineColorsTuple } from "@mantine/core";

// EKD Digital Brand Colors - Deep Gold & Premium Dark
const ekdGold: MantineColorsTuple = [
  "#fffbeb",
  "#fef3c7",
  "#fde68a",
  "#fcd34d",
  "#fbbf24",
  "#f59e0b", // EKD Primary Gold
  "#d97706",
  "#b45309",
  "#92400e",
  "#78350f",
];

const ekdDark: MantineColorsTuple = [
  "#f8fafc",
  "#f1f5f9",
  "#e2e8f0",
  "#cbd5e1",
  "#94a3b8",
  "#64748b",
  "#475569",
  "#334155",
  "#1e293b",
  "#0f172a",
];

const ekdAccent: MantineColorsTuple = [
  "#fef7ee",
  "#fed7aa",
  "#fdba74",
  "#fb923c",
  "#f97316", // Orange accent
  "#ea580c",
  "#dc2626",
  "#b91c1c",
  "#991b1b",
  "#7f1d1d",
];

export const theme = createTheme({
  // Color scheme
  colors: {
    ekdGold,
    ekdDark,
    ekdAccent,
  },

  primaryColor: "ekdGold",
  primaryShade: { light: 5, dark: 6 },

  // Typography
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  fontFamilyMonospace:
    '"SF Mono", Monaco, "Inconsolata", "Roboto Mono", "Source Code Pro", monospace',

  headings: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontWeight: "600",
    sizes: {
      h1: { fontSize: "2.5rem", lineHeight: "1.2" },
      h2: { fontSize: "2rem", lineHeight: "1.3" },
      h3: { fontSize: "1.5rem", lineHeight: "1.4" },
      h4: { fontSize: "1.25rem", lineHeight: "1.5" },
      h5: { fontSize: "1.125rem", lineHeight: "1.5" },
      h6: { fontSize: "1rem", lineHeight: "1.5" },
    },
  },

  // Spacing
  spacing: {
    xs: "0.5rem",
    sm: "0.75rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
  },

  // Border radius
  radius: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.5rem",
  },

  // Shadows
  shadows: {
    xs: "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)",
    sm: "0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)",
    md: "0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)",
    lg: "0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22)",
    xl: "0 19px 38px rgba(0, 0, 0, 0.30), 0 15px 12px rgba(0, 0, 0, 0.22)",
  },

  // Component overrides
  components: {
    Button: {
      defaultProps: {
        radius: "md",
      },
      styles: {
        root: {
          fontWeight: 500,
          transition: "all 0.2s ease",
          "&:hover": {
            transform: "translateY(-1px)",
          },
        },
      },
    },

    Card: {
      defaultProps: {
        radius: "lg",
        shadow: "md",
      },
      styles: {
        root: {
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
          },
        },
      },
    },

    Paper: {
      defaultProps: {
        radius: "md",
      },
    },

    Modal: {
      defaultProps: {
        radius: "lg",
        shadow: "xl",
      },
    },
  },
});
