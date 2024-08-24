import type { Config } from "tailwindcss";

export default {
  mode: 'jit',
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#0EA5E9'
      }
    },
  },
  plugins: [],
} satisfies Config;
