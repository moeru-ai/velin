import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { vitePluginMarkdownTemplate } from '../../src/vite'

export default defineConfig({
  plugins: [
    vue(),
    vitePluginMarkdownTemplate({
      extensions: ['.md'],
    }),
  ],

  // For demo purposes, we don't need to output to dist
  build: {
    outDir: './dist',
  },

  // Set the base path if deploying to a subdirectory
  base: './',
})
