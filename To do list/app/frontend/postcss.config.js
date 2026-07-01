import { fileURLToPath, URL } from "node:url";

// tailwindcss's plugin auto-discovers "tailwind.config.*" by walking up from
// process.cwd(), not from this file's location — if the dev/build command is
// ever invoked from another directory, that lookup silently misses and
// Tailwind falls back to an empty default config. Pointing at the file
// explicitly makes config resolution independent of the caller's cwd.
const tailwindConfigPath = fileURLToPath(
  new URL("./tailwind.config.ts", import.meta.url),
);

export default {
  plugins: {
    tailwindcss: { config: tailwindConfigPath },
    autoprefixer: {},
  },
};
