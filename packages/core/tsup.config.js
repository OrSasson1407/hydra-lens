import { defineConfig } from "tsup";
export default defineConfig({
    entry: ["src/index.ts"],
    format: ["cjs", "esm", "iife"],
    globalName: "__hydraLens",
    dts: true,
    clean: true,
    minify: true,
});
//# sourceMappingURL=tsup.config.js.map