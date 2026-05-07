import type { Config } from "tailwindcss";

// Theme tokens (colors, fonts, radii, shadows, spacing) live in
// src/app/globals.css under @theme inline — Court Cream design system.
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  plugins: [],
};

export default config;
