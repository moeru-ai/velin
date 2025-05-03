import { copyFile, mkdir } from 'node:fs/promises'
import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    { builder: 'rollup', input: 'src/index.ts', outDir: 'dist/', declaration: true },
    { builder: 'rollup', input: 'src/vite.ts', outDir: 'dist/', declaration: true },
  ],
  declaration: true,
  sourcemap: true,
  clean: true,
  hooks: {
    'build:done': async () => {
      await mkdir('dist/client', { recursive: true })
      await copyFile('src/client/index.d.ts', 'dist/client/index.d.ts')
    },
  },
  failOnWarn: false,
})
