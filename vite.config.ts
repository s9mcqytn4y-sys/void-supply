import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 4000,
    strictPort: true,
    watch: {
      ignored: ["**/.next/**", "**/node_modules/**", "**/.git/**"],
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: [],
    passWithNoTests: true,
  },
});
