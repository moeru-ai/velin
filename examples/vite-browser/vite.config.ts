import Velin from '@velin-dev/unplugin-velin/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Velin({
      extension: 'velin.md',
    }),
  ],
})
