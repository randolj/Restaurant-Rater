import type { Config } from "tailwindcss";

export default {
  mode: 'jit',
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#212121',
        secondary: '#171717',
        tertiary: '#353738',
      }
    },
  },
  plugins: [],
} satisfies Config;
