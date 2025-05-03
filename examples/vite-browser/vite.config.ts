// import Velin from '@velin-dev/unplugin-velin/vite'
import Vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import Inspector from 'vite-plugin-inspect'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    Vue(),
    // Velin({
    //   extension: 'velin.md',
    // }),
    Inspector(),
  ],
})
