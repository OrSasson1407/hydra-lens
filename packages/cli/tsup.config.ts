import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs"],
  target: "node18",
  outDir: "dist",
  clean: true,
  sourcemap: false,
  minify: false,
  dts: false,
  external: ["playwright"],
  // Adds #!/usr/bin/env node to the top of the built file so the global
  // binary registered via package.json "bin" is directly executable.
  banner: { js: "#!/usr/bin/env node" },
});
