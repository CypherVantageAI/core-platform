import { defineConfig } from 'vite';

export default defineConfig({
  // Use relative base so assets load correctly on local servers and GitHub Pages subfolders
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Since index.html is in the root, it remains our entry point
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  server: {
    port: 8080
  }
});
