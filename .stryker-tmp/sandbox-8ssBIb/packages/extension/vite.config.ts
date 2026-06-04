// @ts-nocheck
import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  base: "./",
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "src/popup/popup.html"),
        devtools: resolve(__dirname, "src/devtools/devtools.html"),
        panel: resolve(__dirname, "src/devtools/panel.html"),
        background: resolve(__dirname, "src/scripts/background.ts"),
        content: resolve(__dirname, "src/scripts/content.ts")
      },
      output: {
        entryFileNames: "[name].js"
      }
    }
  }
});
