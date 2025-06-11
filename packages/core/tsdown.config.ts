import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    'index': './src/index.ts',
    'render-browser/index': './src/render-browser/index.ts',
    'render-repl/index': './src/render-repl/index.ts',
    'render-node/index': './src/render-node/index.ts',
    'render-shared/index': './src/render-shared/index.ts',
    'browser': './src/browser.ts',
  },
  sourcemap: true,
  unused: true,
  fixedExtension: true,
})
