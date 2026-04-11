import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    // Output directory for the compiled extension
    outDir: 'dist',
    // Clear the dist folder before every build
    emptyOutDir: true,
    rollupOptions: {
      // Define our entry points
      input: {
        content: resolve(__dirname, 'src/scripts/content.ts'),
      },
      output: {
        // FORCE static filenames (no hashes) so manifest.json can find them
        entryFileNames: '[name].js',
        // Prevent code-splitting (Chrome needs the content script as one file)
        inlineDynamicImports: true, 
      },
    },
  },
});