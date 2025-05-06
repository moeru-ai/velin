![](./docs/public/logo.svg)

# Velin

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

> Have you wondered how it feels if you can develop the prompts of agents and MCP servers with the power of Vue?

Develop prompts with Vue SFC or Markdown like pro.

### Quick Start

Try it by running following command under your `pnpm`/`npm` project.

```bash
# For browser users
npm i @velin-dev/vue

# For Node.js, CI, server rendering and backend users
npm i @velin-dev/core
```

## Features

- No longer need to fight and format with the non-supported DSL of templating language!
- Use HTML elements like `<div>` for block elements, `<span>` for inline elements.
- Directives with native Vue template syntax, `v-if`, `v-else` all works.
- Compositing other open sourced prompt component or composables over memory system.

All included...

## How it feels

```html
<!-- Prompt.vue -->
<script setup lang="ts">
defineProps<{
  name: string
}>()
</script>

<template>
  <div>
    Hello world, this is {{ name }}!
  </div>
</template>
```

### In Node.js

```ts
import { readFile } from 'node:fs/promises'
import { renderSFCString } from '@velin-dev/core'
import { ref } from 'vue'

const source = await readFile('./Prompt.vue', 'utf-8')
const name = ref<string>('Velin')
const result = await renderSFCString(source, { name })

console.log(result)
// Hello world, this is Velin!
```

### In Vue / Browser

```vue
<script setup lang="ts">
import { usePrompt } from '@velin-dev/vue'
import { ref, watch } from 'vue'

import Prompt from './Prompt.vue'

const language = ref<string>('Velin')
const { prompt, onPrompted } = usePrompt(Prompt, { name })

watch(prompt, () => {
  console.log(prompt)
  // // Hello world, this is Velin!
})
</script>
```

## License

MIT

[npm-version-src]: https://img.shields.io/npm/v/@velin-dev/core?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/@velin-dev/core
[npm-downloads-src]: https://img.shields.io/npm/dm/@velin-dev/core?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/@velin-dev/core
[bundle-src]: https://img.shields.io/bundlephobia/minzip/@velin-dev/vue?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=@velin-dev/vue
[license-src]: https://img.shields.io/github/license/luoling8192/velin.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/luoling8192/velin/blob/main/LICENSE
[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=1fa669
[jsdocs-href]: https://www.jsdocs.io/package/@velin-dev/core
