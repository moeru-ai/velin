import Velin from '@velin-dev/unplugin-velin/vite'
import Vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    Inspect(),
    Vue(),
    Velin({
      extension: 'velin.md',
    }),
  ],
})
