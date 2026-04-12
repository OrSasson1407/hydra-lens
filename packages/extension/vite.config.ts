import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Setting root to 'src' means Vite resolves HTML entry paths relative to src/,
  // so src/popup/popup.html outputs to dist/popup/popup.html (matching the manifest).
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        'popup/popup': resolve(__dirname, 'src/popup/popup.html'),
        'content':     resolve(__dirname, 'src/scripts/content.ts'),
        'background':  resolve(__dirname, 'src/scripts/background.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
        inlineDynamicImports: false,
      },
    },
  },
  publicDir: resolve(__dirname, 'public'),
});