import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        // This key ensures the output goes into dist/popup/popup.html
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
  publicDir: 'public', // Copies manifest.json from public/ to dist/
});