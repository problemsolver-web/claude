import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#006a4e", // Bangladesh green
          dark: "#00513b",
          light: "#e6f2ee",
        },
        danger: "#dc2626",
        caution: "#d97706",
        safe: "#16a34a",
      },
    },
  },
  plugins: [],
};

export default config;
