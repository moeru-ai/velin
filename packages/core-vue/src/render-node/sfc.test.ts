import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { componentFromSource } from '@velin-dev/source-vue'
import { describe, expect, it } from 'vitest'

import { renderComponent } from '../render-shared'
import { evaluateSFC, renderSFCString, resolvePropsFromString } from './sfc'

const testDir = join(dirname(fileURLToPath(import.meta.url)), 'testdata')

describe('renderSFCString', async () => {
  it('should be able to render simple SFC', async () => {
    const content = await readFile(join(testDir, 'simple.velin.vue'), 'utf-8')
    const { props, rendered } = await renderSFCString(content)
    expect(props).toBeDefined()
    expect(props.length).toBe(0)
    expect(rendered).toBeDefined()
    expect(rendered).not.toBe('')
    expect(rendered).toBe('# Hello, world!\n')
  })

  it('should be able to render script setup SFC with', async () => {
    const content = await readFile(join(testDir, 'script-setup.velin.vue'), 'utf-8')
    const { props, rendered } = await renderSFCString(content)
    expect(props).toBeDefined()
    expect(props.length).toBe(0)
    expect(rendered).toBeDefined()
    expect(rendered).not.toBe('')
    expect(rendered).toBe('# Count: 0\n')
  })

  it('should be able to render script setup SFC lang="ts"', async () => {
    const content = await readFile(join(testDir, 'script-setup.ts.velin.vue'), 'utf-8')
    const { props, rendered } = await renderSFCString(content)
    expect(props).toBeDefined()
    expect(props.length).toBe(0)
    expect(rendered).toBeDefined()
    expect(rendered).not.toBe('')
    expect(rendered).toBe('# Count: 0\n')
  })

  it('should be able to render script setup SFC with props', async () => {
    const content = await readFile(join(testDir, 'script-setup-with-props.velin.vue'), 'utf-8')
    const { props, rendered } = await renderSFCString(content, { date: '2025-07-01' })
    expect(props).toBeDefined()
    expect(props.length).toBe(1)
    expect(rendered).toBeDefined()
    expect(rendered).not.toBe('')
    expect(rendered).toBe('# Count: 0\n\n2025-07-01\n')
  })

  it('should be able to render script setup SFC with props with lang="ts"', async () => {
    const content = await readFile(join(testDir, 'script-setup-with-props.ts.velin.vue'), 'utf-8')
    const { props, rendered } = await renderSFCString(content, { date: '2025-07-01' })
    expect(props).toBeDefined()
    expect(props.length).toBe(1)
    expect(rendered).toBeDefined()
    expect(rendered).not.toBe('')
    expect(rendered).toBe('# Count: 0\n\n2025-07-01\n')
  })

  it('should strip Vue SSR comments like <!--[--> <!--]--> <!--v-if-->', async () => {
    const content = await readFile(join(testDir, 'vue-comments.velin.vue'), 'utf-8')
    const { rendered } = await renderSFCString(content)
    expect(rendered).not.toContain('<!--')
    expect(rendered).toContain('Title')
    expect(rendered).toContain('visible')
  })

  it('should render an SFC with relative imports from a virtual file map', async () => {
    const { rendered } = await renderSFCString(
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
      { name: 'node vfs' },
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

    expect(rendered).toBe('# Virtual prompt\n\n**NODE VFS**\n')
  })

  it('should render an SFC with composables, helpers, and imported prop types from a virtual file map', async () => {
    const { rendered } = await renderSFCString(
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
      { name: ' core composable ' },
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

    expect(rendered).toBe('Hello CORE COMPOSABLE\n')
  })

  it('should render a prompt loaded from testdata with nested Vue imports', async () => {
    const caseDir = join(testDir, 'import-other-sfc')
    const source = await readFile(join(caseDir, 'prompt.vue'), 'utf-8')

    const { rendered } = await renderSFCString(
      source,
      {
        sessionDate: new Date('2026-07-12T08:30:00.000Z'),
        userId: 'agent-user-01',
      },
      {
        filename: 'prompt.vue',
        vfs: new Map([
          ['prompt-sections/session.vue', await readFile(join(caseDir, 'prompt-sections/session.vue'), 'utf-8')],
          ['prompt-sections/system-additional.vue', await readFile(join(caseDir, 'prompt-sections/system-additional.vue'), 'utf-8')],
          ['prompt-sections/system-skills.vue', await readFile(join(caseDir, 'prompt-sections/system-skills.vue'), 'utf-8')],
        ]),
      },
    )

    expect(rendered).toBe(
      '# Agent Prompt\n\nSession for `agent-user-01` on 2026-07-12T08:30:00.000Z\n\n## Additional System Instructions\n\nUse listSkills tools to list available skills before selecting one.\n',
    )
  })
})

describe('renderComponent', async () => {
  it('should render a source-vue component with relative imports from a virtual file map', async () => {
    const Prompt = await componentFromSource<{ name: string }>(
      `
        <template>
          <section>
            <h1>Virtual component</h1>
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

    await expect(renderComponent(Prompt as any, { name: 'core vue' })).resolves.toBe(
      '# Virtual component\n\n**CORE VUE**\n',
    )
  })
})

describe('evaluateSFC', async () => {
  it('should be able to evaluate script setup SFC', async () => {
    const content = await readFile(join(testDir, 'script-setup.velin.vue'), 'utf-8')
    const component = await evaluateSFC(content)
    expect(component).toBeDefined()
    expect(component!.setup).toBeDefined()
    expect(typeof component!.setup).toBe('function')
  })

  it('should be able to evaluate script setup SFC with lang="ts"', async () => {
    const content = await readFile(join(testDir, 'script-setup.ts.velin.vue'), 'utf-8')
    const component = await evaluateSFC(content)
    expect(component).toBeDefined()
    expect(component!.setup).toBeDefined()
    expect(typeof component!.setup).toBe('function')
  })

  it('should be able to evaluate script setup SFC with props', async () => {
    const content = await readFile(join(testDir, 'script-setup-with-props.velin.vue'), 'utf-8')
    const component = await evaluateSFC(content)
    expect(component).toBeDefined()
    expect(component!.setup).toBeDefined()
    expect(typeof component!.setup).toBe('function')
  })

  it('should be able to evaluate script setup SFC with props with lang="ts"', async () => {
    const content = await readFile(join(testDir, 'script-setup-with-props.ts.velin.vue'), 'utf-8')
    const component = await evaluateSFC(content)
    expect(component).toBeDefined()
    expect(component!.setup).toBeDefined()
    expect(typeof component!.setup).toBe('function')
  })
})

describe('resolvePropsFromString', async () => {
  it('should be able to render script setup SFC', async () => {
    const content = await readFile(join(testDir, 'script-setup-with-props.velin.vue'), 'utf-8')
    const props = await resolvePropsFromString(content)
    expect(props).toEqual([
      { key: 'date', type: 'string', title: 'date', required: false },
    ])
  })

  it('should be able to render script setup SFC with lang="ts"', async () => {
    const content = await readFile(join(testDir, 'script-setup-with-props.ts.velin.vue'), 'utf-8')
    const props = await resolvePropsFromString(content)
    expect(props).toEqual([
      { key: 'date', type: 'string', title: 'date', required: true },
    ])
  })
})
