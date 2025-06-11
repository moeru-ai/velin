import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    'index': './src/index.ts',
    'from-md/index': './src/from-md/index.ts',
    'to-md/index': './src/to-md/index.ts',
    'vue-sfc/index': './src/vue-sfc/index.ts',
    'transformers/vue/index': './src/transformers/vue/index.ts',
    'transformers/typescript/index': './src/transformers/typescript/index.ts',
  },
  noExternal: [
    'sucrase',
  ],
  sourcemap: true,
  unused: true,
  fixedExtension: true,
  dts: true,
})
