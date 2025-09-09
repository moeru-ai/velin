![](./docs/public/logo.svg)

# Velin

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

> Have you wondered how it feels if you can develop the prompts of agents and MCP servers with the power of Vue?

Develop prompts with Vue SFC or Markdown like pro.

We got a playground too, check it out:

<p align="center">
  <picture>
    <source
      srcset="./docs/assets/dark-playground.png"
      media="(prefers-color-scheme: dark)"
    />
    <source
      srcset="./docs/assets/light-playground.png"
      media="(prefers-color-scheme: light), (prefers-color-scheme: no-preference)"
    />
    <img src="./docs/assets/light-playground.png" />
  </picture>
</p>

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

## Similar projects

- [poml](https://github.com/microsoft/poml) / [pomljs](https://github.com/microsoft/poml)

## Development

### Clone

```shell
git clone https://github.com/moeru-ai/velin.git
cd airi
```

### Install dependencies

```shell
corepack enable
pnpm install
```

> [!NOTE]
>
> We would recommend to install [@antfu/ni](https://github.com/antfu-collective/ni) to make your script simpler.
>
> ```shell
> corepack enable
> npm i -g @antfu/ni
> ```
>
> Once installed, you can
>
> - use `ni` for `pnpm install`, `npm install` and `yarn install`.
> - use `nr` for `pnpm run`, `npm run` and `yarn run`.
>
> You don't need to care about the package manager, `ni` will help you choose the right one.

```shell
pnpm dev
```

> [!NOTE]
>
> For [@antfu/ni](https://github.com/antfu-collective/ni) users, you can
>
> ```shell
> nr dev
> ```

### Build

```shell
pnpm build
```

> [!NOTE]
>
> For [@antfu/ni](https://github.com/antfu-collective/ni) users, you can
>
> ```shell
> nr build
> ```

## License

MIT

[npm-version-src]: https://img.shields.io/npm/v/@velin-dev/core?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/@velin-dev/core
[npm-downloads-src]: https://img.shields.io/npm/dm/@velin-dev/core?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/@velin-dev/core
[bundle-src]: https://img.shields.io/bundlephobia/minzip/@velin-dev/vue?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=@velin-dev/vue
[license-src]: https://img.shields.io/github/license/moeru-ai/velin.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/moeru-ai/velin/blob/main/LICENSE
[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=1fa669
[jsdocs-href]: https://www.jsdocs.io/package/@velin-dev/core
