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
          include: [/\.velin\.md$/, '**/*.velin.md'],
        },
      },
      handler: async (code, id) => {
        try {
          const pathname = path.dirname(id)
          const parsed = await processMarkdown(code, {}, pathname)

          return {
            code: `export default function (args) {
              return \`${parsed}\`
            }`,
            map: null,
          }
        }
        catch (error) {
          console.error(`Failed to parse ${id}: ${(error as Error).message}`)
          return null
        }
      },
    },
  }
}

export const unplugin = /* #__PURE__ */ createUnplugin(unpluginFactory)

export default unplugin
