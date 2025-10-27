import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    fontFamily: {
      sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
    },
    extend: {
      colors: {
        primary: {
          ...colors.sky,
          DEFAULT: colors.sky[500],
          light: colors.sky[400],
          dark: colors.sky[700],
        },
        surface: {
          ...colors.slate,
          DEFAULT: colors.slate[50],
          light: colors.slate[100],
          dark: colors.slate[800],
        },
        error: {
          ...colors.red,
          DEFAULT: colors.red[500],
          light: colors.red[300],
          dark: colors.red[700],
        },
        info: {
          ...colors.cyan,
          DEFAULT: colors.cyan[400],
          light: colors.cyan[300],
          dark: colors.cyan[700],
        },
        success: {
          ...colors.emerald,
          DEFAULT: colors.emerald[500],
          light: colors.emerald[300],
          dark: colors.emerald[700],
        },
        warning: {
          ...colors.amber,
          DEFAULT: colors.amber[400],
          light: colors.amber[300],
          dark: colors.amber[700],
        },
      },
    },
  },
  plugins: [],
};

export default config;
