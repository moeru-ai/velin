import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import vue from '@vitejs/plugin-vue'

import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'

const root = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [vue()],
  root,
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'node',
          environment: 'node',
          include: ['**/*.{spec,test}.ts'],
          exclude: ['**/*.browser.{spec,test}.ts', '**/node_modules/**'],
        },
      },
      {
        extends: true,
        test: {
          name: 'browser',
          include: ['**/*.browser.{spec,test}.ts'],
          exclude: ['**/node_modules/**'],
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [
              { browser: 'chromium' },
            ],
          },
        },
      },
    ],
  },
})
