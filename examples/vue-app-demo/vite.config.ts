import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { vitePluginMarkdownTemplate } from '../../src/vite'

export default defineConfig({
  plugins: [
    vue(),
    vitePluginMarkdownTemplate({
      extensions: ['.md'],
      includeRuntimeCompiler: true,
    }),
    vitePluginMarkdownTemplate({
      extensions: ['.mdx'],
      wrapComponent: false,
    }),
    vitePluginMarkdownTemplate({
      extensions: ['.raw.md'],
      rawContent: true,
      wrapComponent: false,
    }),
  ],

  // For demo purposes, we don't need to output to dist
  build: {
    outDir: './dist',
  },

  // Set the base path if deploying to a subdirectory
  base: './',
})
