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
        pro: {
          darkest: "#0c0d10",
          darker: "#12141a",
          dark: "#181b22",
          panel: "#1e222c",
          border: "#2b313f",
          accent: "#3b82f6",
          accentHover: "#2563eb",
          playhead: "#ef4444",
          trackVideo: "#1e3a5f",
          trackAudio: "#1b4d3e",
          trackCaption: "#4c1d95"
        }
      }
    },
  },
  plugins: [],
};
export default config;
