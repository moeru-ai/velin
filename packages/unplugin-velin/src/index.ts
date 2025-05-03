import type { UnpluginFactory } from 'unplugin'
import type { Options } from './types'

import { processMarkdown } from '@velin-dev/core'
import path from 'path-browserify-esm'
import { createUnplugin } from 'unplugin'

export const unpluginFactory: UnpluginFactory<Options | undefined> = (options) => {
  const { extension = 'velin.md' } = options || {}
  const filter = new RegExp(`\\.${extension}$`)

  return {
    name: 'unplugin-custom-format',
    // Transform hook to process .custom files
    async transform(code, id) {
      if (!filter.test(id))
        return null // Early return for non-matching files

      try {
        const pathname = path.dirname(id)
        // eslint-disable-next-line no-console
        console.log(`Processing file: ${id}, ${pathname}`) // Log file path
        const parsed = await processMarkdown(code, {}, pathname) // Parse content

        // Return transformed module as ES module
        return {
          code: `export default function (args) {
              return \`${parsed}\`
            }`,
          map: null, // Add source map support if needed
        }
      }
      catch (error) {
        this.error(`Failed to parse ${id}: ${(error as Error).message}`)
        return null
      }
    },
  }
}

export const unplugin = /* #__PURE__ */ createUnplugin(unpluginFactory)

export default unplugin
