# Vue SFC/Markdown Browser Examples

This directory contains examples demonstrating how to use Vue SFC and Markdown components directly in the browser.

## Getting Started

1. First, build the library:
   ```bash
   pnpm build
   ```

2. Then start the development server:
   ```bash
   pnpm serve
   ```

This will open the examples in your browser.

## Examples

1. **index.html** - Demonstrates how to use Vue SFC components directly in the browser
2. **markdown.html** - Shows how to render Markdown with embedded Vue functionality

## Usage in Your Own Projects

To use this library in your browser-based projects:

```html
<script type="module">
  import { mountSFC, mountMarkdown } from '@velin-dev/ml';
  
  // Mount a Vue SFC
  const sfc = `
    <template>
      <div>{{ message }}</div>
    </template>
    <script setup>
    import { ref } from 'vue'
    const message = ref('Hello World')
    </script>
  `;
  
  // Mount to a DOM element
  mountSFC(sfc, '#app');
  
  // Or mount Markdown with Vue functionality
  const markdown = `
  # Markdown with Vue
  
  <div>{{ message }}</div>
  
  <script setup>
  import { ref } from 'vue'
  const message = ref('Hello from Markdown')
  </script>
  `;
  
  mountMarkdown(markdown, '#markdown-container');
</script>
``` 
