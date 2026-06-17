import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
  ],
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
        autoprefixer(),
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom"],
  },
  server: {
    port: 5173,
    strictPort: true,
    host: "0.0.0.0",
    fs: {
      strict: true,
    },
  },
  build: {
    outDir: "dist/public",
    emptyOutDir: true,
  },
  preview: {
    port: 5173,
    host: "0.0.0.0",
  },
});
