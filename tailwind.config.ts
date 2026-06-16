import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#D97A24",
        "primary-light": "#F09840",
        charcoal: "#111111",
        "soft-black": "#1A1A1A",
        "light-gray": "#F7F7F7",
        "warm-cream": "#FFF7EF",
        ink: "#202329",
        slate: "#5F6978",
        mint: "#DDEFE6",
        steel: "#D8E3EA"
      },
      fontFamily: {
        sans: ["var(--font-inter)"],
        heading: ["var(--font-manrope)"]
      },
      boxShadow: {
        soft: "0 24px 80px rgba(17, 17, 17, 0.10)",
        glow: "0 18px 50px rgba(217, 122, 36, 0.25)"
      },
      backgroundImage: {
        "mesh-warm":
          "linear-gradient(135deg, rgba(255,247,239,0.96), rgba(247,247,247,0.98) 48%, rgba(221,239,230,0.88))",
        "cta-band":
          "linear-gradient(135deg, #111111 0%, #1A1A1A 42%, #783F16 100%)"
      }
    }
  },
  plugins: [typography]
};

export default config;
