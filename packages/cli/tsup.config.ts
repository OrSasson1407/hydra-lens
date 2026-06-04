import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs"],
  target: "node18",
  outDir: "dist",
  clean: true,
  sourcemap: true,
  minify: false,
  dts: false,
  external: ["playwright"],
});
