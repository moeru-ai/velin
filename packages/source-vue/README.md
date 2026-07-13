# @velin-dev/source-vue

Vue source tooling for Velin.

## Usage

```ts
import { componentFromSource, createSFC } from '@velin-dev/source-vue'

const source = createSFC('<p>Hello</p>', '', 'ts')

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
        export function useGreeting(name: string) {
          return \`Hello \${name}\`
        }
      `,
      'src/types.ts': `
        export interface PromptProps {
          name: string
        }
      `,
    },
  },
)
```

## API

```ts
function createSFC(html: string, scriptContent: string, lang: string): string

interface VueComponentFromSourceOptions {
  filename?: string
  vfs?: Record<string, string> | Map<string, string>
}

function componentFromSource<Props = Record<string, unknown>>(
  source: string,
  options?: VueComponentFromSourceOptions,
): Promise<DefineComponent<Props>>

class File {
  constructor(filename: string, code?: string, hidden?: boolean)
  filename: string
  code: string
  hidden: boolean
  compiled: {
    js: string
    css: string
    ssr: string
    clientMap: string
    ssrMap: string
  }
  readonly language: 'vue' | 'html' | 'css' | 'typescript' | 'javascript'
}

function compileModulesForPreview(
  options: {
    files: Record<string, File>
    mainFile: string
  },
  isSSR?: boolean,
): string[]
```

`componentFromSource` compiles Vue SFC source with `@vue/compiler-sfc`, strips
TypeScript with `sucrase` through `@velin-dev/utils`, resolves relative imports
from the optional virtual file map, and evaluates the linked ESM with
`@unrteljs/eval`. It is not a sandbox or security boundary and must only be used
with trusted source.
