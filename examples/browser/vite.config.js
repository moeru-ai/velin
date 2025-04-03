import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  root: resolve(__dirname),
  base: './',
  server: {
    port: 3000,
    open: 'examples.html'
  },
  resolve: {
    alias: {
      '@velin-dev/ml': resolve(__dirname, '../../dist/index.mjs')
    }
  },
  optimizeDeps: {
    include: ['vue']
  }
}); 
