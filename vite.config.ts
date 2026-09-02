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
          // @splinetool is deliberately NOT named here. A named manual chunk
          // joins the entry's preload graph, so Vite emitted a
          // `<link rel="modulepreload">` for the 4.4MB WebGL runtime in the
          // document head. Left unnamed, it splits off the lazy import in
          // Hero.tsx and is only fetched once the hero asks for it.
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
