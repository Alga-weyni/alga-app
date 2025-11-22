import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react()
  ],

  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@shared": path.resolve(import.meta.dirname, "../shared"),
      "@assets": path.resolve(import.meta.dirname, "../attached_assets"),
    },
  },

  root: ".", // 👈 Fix: project root IS this folder
  build: {
    outDir: "../server/dist/public", // 👈 Output to server/dist/public for Render runtime
    emptyOutDir: true,
  }
});
