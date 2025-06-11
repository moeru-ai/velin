import Vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import Markdown from 'unplugin-vue-markdown/vite'
import { defineConfig } from 'vite'
import Inspector from 'vite-plugin-inspect'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    Markdown({}),
    Vue({
      include: ['**/*.vue', '**/*.md'],
    }),
    Inspector(),
    UnoCSS(),
  ],
})
