import fs from 'node:fs'

import { resolve } from 'node:path'

import Vue from '@vitejs/plugin-vue'
import Unocss from 'unocss/vite'
import VueRouter from 'vue-router/vite'

import { defineConfig } from 'vite'

export default defineConfig({
  optimizeDeps: {
    exclude: ['@vue/repl'],
    entries: [
      'src/main.ts',
      'src/pages/index.vue',
      'src/components/Playground.vue',
      'src/components/frameworks/index.ts',
      'src/components/frameworks/React.vue',
      'src/components/frameworks/Vue.vue',
      'src/components/Editor/index.vue',
      'src/components/Editor/env.ts',
      'src/components/Editor/vue.worker.ts',
      'src/runtime/react.ts',
    ],
    include: [
      '@jridgewell/gen-mapping',
      '@jridgewell/trace-mapping',
      '@proj-airi/ui/components/form',
      '@shikijs/core',
      '@shikijs/engine-javascript',
      '@shikijs/langs/jsx',
      '@shikijs/langs/tsx',
      '@shikijs/langs/vue',
      '@shikijs/monaco',
      '@shikijs/themes/catppuccin-latte',
      '@shikijs/themes/catppuccin-mocha',
      '@volar/jsdelivr',
      '@volar/monaco',
      '@volar/monaco/worker',
      '@vue/language-core',
      '@vue/language-service',
      '@vue/typescript-plugin/lib/common',
      '@vue/typescript-plugin/lib/requests/getComponentDirectives',
      '@vue/typescript-plugin/lib/requests/getComponentEvents',
      '@vue/typescript-plugin/lib/requests/getComponentNames',
      '@vue/typescript-plugin/lib/requests/getComponentProps',
      '@vue/typescript-plugin/lib/requests/getComponentSlots',
      '@vue/typescript-plugin/lib/requests/getElementAttrs',
      '@vue/typescript-plugin/lib/requests/getElementNames',
      '@vue/typescript-plugin/lib/requests/getPropertiesAtLocation',
      'esbuild-wasm',
      'fflate',
      'hash-sum',
      'monaco-editor-core/esm/vs/editor/editor.worker',
      'react',
      'react-dom/server',
      'react/jsx-runtime',
      'reka-ui',
      'splitpanes',
      'volar-service-typescript/lib/plugins/directiveComment',
      'volar-service-typescript/lib/plugins/semantic',
      'vscode-uri',
      'vue/compiler-sfc',
    ],
  },
  plugins: [
    // https://router.vuejs.org
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
