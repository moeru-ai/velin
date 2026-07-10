import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        root: 'packages/core-vue',
        test: {
          name: 'core-vue-node',
          environment: 'node',
          include: ['src/**/*.{spec,test}.ts'],
          exclude: ['**/*.browser.{spec,test}.ts', '**/node_modules/**'],
        },
      },
      {
        extends: true,
        root: 'packages/core-vue',
        test: {
          name: 'core-vue-browser',
          include: ['src/**/*.browser.{spec,test}.ts'],
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
      {
        extends: true,
        root: 'packages/core-react',
        test: {
          name: 'core-react-node',
          environment: 'node',
          include: ['src/**/*.{spec,test}.{ts,tsx}'],
          exclude: ['**/*.browser.{spec,test}.{ts,tsx}', '**/node_modules/**'],
        },
      },
      {
        extends: true,
        root: 'packages/core-react',
        test: {
          name: 'core-react-browser',
          include: ['src/**/*.browser.{spec,test}.{ts,tsx}'],
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
      {
        extends: true,
        test: {
          name: 'packages-node',
          environment: 'node',
          include: [
            'packages/react/src/**/*.{test,spec}.{ts,tsx}',
            'packages/source-react/src/**/*.{test,spec}.{ts,tsx}',
            'packages/source-vue/src/**/*.{test,spec}.{ts,tsx}',
            'packages/utils/src/**/*.{test,spec}.{ts,tsx}',
          ],
          exclude: ['**/*.browser.{test,spec}.{ts,tsx}', '**/node_modules/**'],
        },
      },
      {
        extends: true,
        root: 'apps/playground',
        test: {
          name: 'playground-browser',
          include: ['src/**/*.browser.{spec,test}.{ts,tsx}'],
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
