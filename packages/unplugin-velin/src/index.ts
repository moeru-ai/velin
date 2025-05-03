import type { UnpluginFactory } from 'unplugin'
import type { Options } from './types'

import { processMarkdown } from '@velin-dev/core'
import path from 'path-browserify-esm'
import { createUnplugin } from 'unplugin'

export const unpluginFactory: UnpluginFactory<Options | undefined> = () => {
  return {
    name: 'unplugin-velin',
    transform: {
      filter: {
        id: {
          include: [
            /\\.velin\.md$/,
            '**/*.velin.md',
            /\\.velin\.vue$/,
            '**/*.velin.vue',
            /\\.velin\.ts$/,
            '**/*.velin.ts',
          ],
        },
      },
      handler: async (code, id) => {
        const pathname = path.dirname(id)
        const parsed = await processMarkdown(code, {}, pathname) // Parse content

        // Return transformed module as ES module
        return {
          code: `export default function (args) {
  return \`${parsed}\`
}`,
          map: null, // Add source map support if needed
        }
      },
    },
  }
}

export const unplugin = /* #__PURE__ */ createUnplugin(unpluginFactory)

export default unplugin
