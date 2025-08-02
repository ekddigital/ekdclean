import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  base: "./", // Use relative paths for Electron
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@ekd-clean/shared": path.resolve(__dirname, "../shared/src"),
      "@ekd-clean/ui-system": path.resolve(__dirname, "../ui-system/src"),
      "@ekd-clean/animations": path.resolve(__dirname, "../animations/src"),
    },
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      external: ["electron"],
    },
  },
  server: {
    port: 3000,
  },
});
