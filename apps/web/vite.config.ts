import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  envDir: ".",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        widget: path.resolve(__dirname, "widget-entry.html"),
      },
      output: {
        manualChunks(id: string) {
          if (!id.includes("node_modules")) return
          if (id.includes("@tanstack/react-query") || id.includes("@tanstack/react-table")) return "query"
          if (id.includes("@base-ui") || id.includes("@shadcn")) return "ui"
          if (id.includes("recharts") || id.includes("framer-motion")) return "charts"
          if (id.includes("react-markdown") || id.includes("rehype-highlight") || id.includes("remark-gfm") || id.includes("highlight.js")) return "markdown"
          if (id.includes("react-router-dom") || id.includes("react-dom") || id.includes("react/")) return "react"
        },
      },
    },
  },
})
