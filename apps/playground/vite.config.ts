import fs from 'node:fs'
import { resolve } from 'node:path'

import Vue from '@vitejs/plugin-vue'
import Unocss from 'unocss/vite'
import VueRouter from 'unplugin-vue-router/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  optimizeDeps: {
    exclude: ['@vue/repl'],
  },
  plugins: [
    // https://github.com/posva/unplugin-vue-router
    VueRouter({
      dts: resolve(import.meta.dirname, 'src', 'typed-router.d.ts'),
      extensions: ['.vue', '.md'],
    }),
    Vue({
      script: {
        fs: {
          fileExists: fs.existsSync,
          readFile: file => fs.readFileSync(file, 'utf-8'),
        },
      },
    }),
    // https://github.com/antfu/unocss
    // see uno.config.ts for config
    Unocss(),
  ],
})
