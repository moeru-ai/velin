# Velin

Develop prompts with Vue SFC or Markdown like pro.

Have you wondered how it feels if you can develop the prompts of agents and MCP servers with the power of Vue?

- No longer need to fight and format with the non-supported DSL of templating language!
- Use HTML elements like `<div>` for block elements, `<span>` for inline elements.
- Directives with native Vue template syntax, `v-if`, `v-else` all works.
- Compositing other open sourced prompt component or composables over memory system.

All included...

## Install

```shell
# For browser users
npm i @velin-dev/vue

# For Node.js, CI, server rendering and backend users
npm i @velin-dev/core
```

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
import { usePrompt } from '@velin-dev/core'
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
