import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    'index': './src/index.ts',
    'repl/index': './src/repl/index.ts',
  },
  sourcemap: true,
  unused: true,
  fixedExtension: true,
})
