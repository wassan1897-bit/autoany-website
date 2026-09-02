import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(root, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("@splinetool")) return "spline";
          if (id.includes("node_modules/gsap")) return "gsap";
          if (id.includes("node_modules/lenis")) return "lenis";
          if (
            id.includes("node_modules/framer-motion") ||
            id.includes("node_modules/motion/")
          ) {
            return "motion";
          }
        },
      },
    },
  },
  server: {
    watch: {
      ignored: ["**/previews/**", "**/test-screenshots/**"],
    },
  },
});
