import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#dce8ff",
          200: "#b8d1ff",
          300: "#8ab2ff",
          400: "#5c8dff",
          500: "#3366ff",
          600: "#254ce0",
          700: "#1c3aad",
          800: "#182f85",
          900: "#172a6b",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
