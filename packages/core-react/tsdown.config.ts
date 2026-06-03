import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    'index': './src/index.ts',
    'render-browser/index': './src/render-browser/index.ts',
    'render-node/index': './src/render-node/index.ts',
    'render-shared/index': './src/render-shared/index.ts',
  },
  sourcemap: true,
  unused: true,
  fixedExtension: true,
  dts: true,
})
