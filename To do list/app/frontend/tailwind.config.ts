import type { Config } from "tailwindcss";
import { fileURLToPath, URL } from "node:url";

// "Rainbow Pastel Liquid Glass" design tokens.
// The palette stays soft/desaturated (pastel) while the gradient utilities
// sweep through the full hue wheel (rainbow), layered on translucent,
// blurred surfaces (liquid glass) for depth.

// Tailwind always resolves relative `content` globs against process.cwd(),
// not this config file's directory — anchor them here explicitly so the
// build doesn't silently produce unstyled output when invoked from another
// working directory (see postcss.config.js for the matching config-path fix).
const here = fileURLToPath(new URL(".", import.meta.url));

export default {
  content: [`${here}index.html`, `${here}src/**/*.{ts,tsx}`],
  theme: {
    extend: {
      colors: {
        pastel: {
          pink: "#ffd6e8",
          peach: "#ffe3c9",
          lemon: "#fff6c9",
          mint: "#d3f8e2",
          sky: "#cdeeff",
          lavender: "#e3d9ff",
          lilac: "#f1d6ff",
        },
        glass: {
          light: "rgba(255,255,255,0.55)",
          border: "rgba(255,255,255,0.35)",
          dark: "rgba(20,20,35,0.35)",
        },
      },
      backgroundImage: {
        "rainbow-pastel":
          "linear-gradient(120deg, #ffd6e8, #ffe3c9, #fff6c9, #d3f8e2, #cdeeff, #e3d9ff, #f1d6ff)",
        "rainbow-pastel-radial":
          "radial-gradient(circle at 20% 20%, #ffd6e8 0%, transparent 45%), radial-gradient(circle at 80% 30%, #cdeeff 0%, transparent 45%), radial-gradient(circle at 50% 80%, #d3f8e2 0%, transparent 45%), radial-gradient(circle at 90% 90%, #f1d6ff 0%, transparent 45%)",
      },
      backdropBlur: {
        xs: "2px",
        glass: "18px",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
        "glass-inset": "inset 0 1px 1px 0 rgba(255,255,255,0.6)",
      },
      borderRadius: {
        glass: "1.5rem",
      },
      keyframes: {
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0) translateX(0)" },
          "33%": { transform: "translateY(-16px) translateX(8px)" },
          "66%": { transform: "translateY(8px) translateX(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.94) translateY(6px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
      },
      animation: {
        "gradient-shift": "gradient-shift 12s ease-in-out infinite",
        float: "float 10s ease-in-out infinite",
        "float-slow": "float 16s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
        "pop-in": "pop-in 0.25s ease-out",
      },
      backgroundSize: {
        "300%": "300% 300%",
      },
    },
  },
  plugins: [],
} satisfies Config;
