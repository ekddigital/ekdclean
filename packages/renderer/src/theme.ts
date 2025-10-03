// EKD Clean - Custom Mantine Theme
// Built by EKD Digital

import { createTheme, MantineColorsTuple } from "@mantine/core";

// EKD Digital Enhanced Brand Colors - Light Mode Optimized
const ekdGold: MantineColorsTuple = [
  "#fffbf5", // Lightest - warm cream
  "#fff3e0", // Light cream
  "#ffe6b3", // Soft amber
  "#ffd680", // Light gold
  "#ffc94d", // Medium gold
  "#f59e0b", // Primary brand gold
  "#e08c00", // Deep gold
  "#c77a00", // Rich gold
  "#a86800", // Bronze
  "#8a5600", // Dark bronze
];

const ekdDark: MantineColorsTuple = [
  "#fafbfc", // Almost white with blue tint
  "#f4f6f9", // Very light blue-gray
  "#e8ecf1", // Light blue-gray
  "#d4dae3", // Soft blue-gray
  "#b0b9c7", // Medium blue-gray
  "#8894a6", // Blue-gray
  "#66738a", // Steel blue
  "#4a5568", // Dark steel
  "#2d3748", // Darker steel
  "#1a202c", // Dark mode primary
];

const ekdAccent: MantineColorsTuple = [
  "#fff8f5", // Soft peach
  "#ffe9e0", // Light peach
  "#ffd4c2", // Warm peach
  "#ffb899", // Coral
  "#ff9770", // Light coral
  "#f97316", // Primary orange accent
  "#e85d00", // Deep orange
  "#cc4d00", // Rich orange
  "#b33d00", // Burnt orange
  "#8a2f00", // Dark orange
];

// Additional color palettes for better light mode
const ekdBlue: MantineColorsTuple = [
  "#f0f9ff", // Ice blue
  "#e0f2fe", // Sky blue
  "#bae6fd", // Light blue
  "#7dd3fc", // Bright blue
  "#38bdf8", // Vibrant blue
  "#0ea5e9", // Primary blue
  "#0284c7", // Deep blue
  "#0369a1", // Rich blue
  "#075985", // Dark blue
  "#0c4a6e", // Darkest blue
];

const ekdPurple: MantineColorsTuple = [
  "#faf5ff", // Lavender mist
  "#f3e8ff", // Light lavender
  "#e9d5ff", // Soft purple
  "#d8b4fe", // Light purple
  "#c084fc", // Medium purple
  "#a855f7", // Vibrant purple
  "#9333ea", // Deep purple
  "#7e22ce", // Rich purple
  "#6b21a8", // Dark purple
  "#581c87", // Darkest purple
];

export const theme = createTheme({
  // Color scheme
  colors: {
    ekdGold,
    ekdDark,
    ekdAccent,
    ekdBlue,
    ekdPurple,
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
