import Vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import Markdown from 'unplugin-vue-markdown/vite'
import Inspector from 'vite-plugin-inspect'

import { defineConfig } from 'vite'

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
