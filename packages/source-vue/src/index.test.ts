import { describe, expect, it } from 'vitest'

import {
  compileModulesForPreview,
  componentFromSource,
  createSFC,
  File,
} from './'

describe('@velin-dev/source-vue', () => {
  it('exports Vue source helpers from the package entry', () => {
    expect(createSFC('<p>Hello</p>', '', 'ts')).toContain('<template><p>Hello</p></template>')
    expect(new File('src/App.vue').language).toBe('vue')
    expect(typeof compileModulesForPreview).toBe('function')
    expect(typeof componentFromSource).toBe('function')
  })

  it('loads a Vue SFC with relative imports from a virtual file map', async () => {
    const Prompt = await componentFromSource<{ name: string }>(
      `
        <template>
          <section>
            <h1>Virtual prompt</h1>
            <p><Label :value="name" /></p>
          </section>
        </template>

        <script setup lang="ts">
        import Label from './components/Label.vue'

        defineProps<{ name: string }>()
        </script>
      `,
      {
        filename: 'src/Prompt.vue',
        vfs: {
          'src/components/Label.vue': `
            <template>
              <strong>{{ value.toUpperCase() }}</strong>
            </template>

            <script setup lang="ts">
            defineProps<{ value: string }>()
            </script>
          `,
        },
      },
    )

    expect(Prompt.setup).toBeTypeOf('function')
  })

  it('loads a Vue SFC with composables, helpers, and imported prop types from a virtual file map', async () => {
    const Prompt = await componentFromSource<{ name: string }>(
      `
        <template>
          <p>{{ greeting }}</p>
        </template>

        <script setup lang="ts">
        import { useGreeting } from './composables/useGreeting'
        import type { PromptProps } from './types'

        const props = defineProps<PromptProps>()
        const greeting = useGreeting(props.name)
        </script>
      `,
      {
        filename: 'src/Prompt.vue',
        vfs: {
          'src/composables/useGreeting.ts': `
            import { computed } from 'vue'
            import { formatName } from '../utils/format'

            export function useGreeting(name: string) {
              return computed(() => \`Hello \${formatName(name)}\`)
            }
          `,
          'src/types.ts': `
            export interface PromptProps {
              name: string
            }
          `,
          'src/utils/format.ts': `
            export function formatName(value: string) {
              return value.trim().toUpperCase()
            }
          `,
        },
      },
    )

    expect(Prompt.setup).toBeTypeOf('function')
  })

  it('throws a clear error when the default export is not component-like', async () => {
    await expect(componentFromSource('<script>export default null</script>')).rejects.toThrow(
      '[src/Prompt.vue] evaluate: default export must be a Vue component',
    )
  })

  it('wraps stage errors with the original error as the cause', async () => {
    let caught: unknown

    try {
      await componentFromSource('<script>throw new Error("boom")</script>')
    }
    catch (error) {
      caught = error
    }

    expect(caught).toBeInstanceOf(Error)
    expect((caught as Error).message).toContain('[src/Prompt.vue] evaluate: boom')
    expect((caught as Error).cause).toBeInstanceOf(Error)
    expect(((caught as Error).cause as Error).message).toBe('boom')
  })
})
