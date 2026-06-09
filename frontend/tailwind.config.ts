import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#d9e6ff',
          200: '#bcd2ff',
          300: '#8eb4ff',
          400: '#598bff',
          500: '#3563eb',
          600: '#2347d1',
          700: '#1d39a8',
          800: '#1d3285',
          900: '#1d2f6b',
        },
      },
    },
  },
  plugins: [],
};

export default config;
