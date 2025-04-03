# @velin-dev/ml

Parse Vue SFC or Markdown to prompt for LLM.

## Preview

![CleanShot 2025-03-25 at 19 33 02@2x](https://github.com/user-attachments/assets/5810c1ee-55cf-42bc-963a-a870b0849bfb)

## Usage

### As a Vite Plugin

This package can be used as a Vite plugin to process Markdown files containing Vue template syntax at build time.

```js
import { vitePluginMarkdownTemplate } from '@velin-dev/ml'
import vue from '@vitejs/plugin-vue'
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    vue(),
    vitePluginMarkdownTemplate({
      // Optional: customize file extensions to process
      extensions: ['.md', '.mdx'],

      // Optional: custom transform function for the processed markdown
      transform: async (code) => {
        // Custom transformation of the processed markdown
        return code
      },

      // Optional: wrap the markdown in a Vue component (default: true)
      wrapComponent: true,

      // Optional: include Vue runtime compiler for dynamic templates (default: true)
      // Set to false for static markdown without Vue directives
      includeRuntimeCompiler: true
    })
  ]
})
```

#### Compiling to String

If you want to compile Markdown to a string instead of a Vue component, set `wrapComponent` to `false`:

```js
// Process .md files as Vue components
vitePluginMarkdownTemplate({
  extensions: ['.md'],
  wrapComponent: true
}),

// Process .mdx files as strings
vitePluginMarkdownTemplate({
  extensions: ['.mdx'],
  wrapComponent: false
})
```

#### Raw Markdown Content

If you want to skip the Vue template processing and just get the raw Markdown content:

```js
vitePluginMarkdownTemplate({
  extensions: ['.raw.md'],
  rawContent: true,
  wrapComponent: false
})
```

This is useful when you want to:
- Export the original unprocessed Markdown
- Handle reactive variables in your own way
- Skip the Vue template processing entirely

Then in your application:

```vue
<script setup>
// Import as a Vue component
import MarkdownComponent from './path/to/file.md'

// Import as a processed string
import markdownString from './path/to/file.mdx'

// Import as raw content
import rawMarkdown from './path/to/file.raw.md'
</script>

<template>
  <!-- Use as a component -->
  <MarkdownComponent />
  
  <!-- Use as a string with v-html -->
  <div v-html="markdownString"></div>
  
  <!-- Use raw content -->
  <pre>{{ rawMarkdown }}</pre>
</template>
```

### Markdown Format

Your markdown files can include Vue template syntax with reactive variables:

```md
## Prompt Template

<script setup>
import { ref } from 'vue';
const showSystemPrompt = ref(true);
const language = ref('JavaScript');
const userQuestion = ref('How to implement a simple counter?');
</script>

<div v-if="showSystemPrompt">

## System Prompt

You are a professional code assistant, please answer the question using {{language}} language.

</div>

## User Prompt

{{userQuestion}}
```

### Programmatic API

You can also use the programmatic API:

```js
import { processMarkdown } from '@velin-dev/ml'

// Process markdown file
const result = await processMarkdown('path/to/file.md')

// Or process markdown content directly
const markdownContent = `
## Prompt Template

<script setup>
const name = "World";
</script>

Hello {{name}}!
`
const result = await processMarkdown(markdownContent, true)
```

## TypeScript Support

For TypeScript projects, you'll need to add declarations for `.md` files. You can add this to your project's types:

```ts
// src/types/markdown.d.ts
declare module '*.md' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
```

Then make sure to include this file in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    // ...your options
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.vue",
    "src/types/**/*.d.ts" // Include type declarations
  ]
}
```

## Examples

### Vue Demo App

A demo Vue application is included in the `examples/vue-app-demo` directory. You can run it with:

```bash
# Install dependencies first
npm install

# Run the demo app
npm run dev -- examples/vue-app-demo
```

This demonstrates how Markdown files with Vue template syntax can be imported directly into Vue components while maintaining reactivity.
