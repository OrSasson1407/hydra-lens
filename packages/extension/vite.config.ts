import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        content:    resolve(__dirname, 'src/scripts/content.ts'),
        background: resolve(__dirname, 'src/scripts/background.ts'),
        popup:      resolve(__dirname, 'src/popup/popup.ts'),
      },
      output: {
        // Static filenames — Chrome's manifest.json must reference exact names
        entryFileNames: '[name].js',
        // Prevent code-splitting; each script must be a single self-contained file
        inlineDynamicImports: false,
        manualChunks: undefined,
      },
    },
  },
  // Copy public/ (manifest + icons) into dist/
  publicDir: 'public',
});
