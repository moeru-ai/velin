# @velin-dev/source-vue

Vue source tooling for Velin.

## Usage

```ts
import { createSFC } from '@velin-dev/source-vue'

const source = createSFC('<p>Hello</p>', '', 'ts')
```

## API

```ts
function createSFC(html: string, scriptContent: string, lang: string): string

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
