import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'css',
    emptyOutDir: true,
    rollupOptions: {
      input: 'scss/style.scss',
      output: {
        assetFileNames: 'style.css'
      }
    }
  }
});
