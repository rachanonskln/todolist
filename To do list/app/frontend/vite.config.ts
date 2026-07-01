import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Dev server proxies /api to the backend so the frontend never needs to know
// deployment hostnames — same pattern works behind Nginx/Cloud Run in prod.
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Mirrors tsconfig.json's "paths" — tsconfig only affects type-checking,
    // so Vite's bundler needs this alias too or "@/..." imports 404 at runtime.
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});
