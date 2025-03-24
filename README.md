# Vue Prompt

Parse Vue SFC or Markdown to prompt for LLM.

## Features

- **SFC Parsing**: Parse Vue Single File Components for use as prompts
- **Markdown Parsing**: Use Markdown files with Vue template syntax for prompts
- **Variable Interpolation**: Support for Vue-style variables (`{{ varName }}`)
- **Conditional Content**: Use `v-if` directives to conditionally include content
- **Preserve Raw Text**: Option to keep Markdown as raw text for AI prompts

## Usage

### Parsing Markdown with Vue Syntax

```typescript
import { parseMarkdownPrompt } from './src/md'

// Parse Markdown file with Vue template syntax
const template = await parseMarkdownPrompt('examples/Markdown.md')

// View the extracted data
console.log('Variables:', template.data)

// Render with default values from the template
const defaultPrompt = template.render()
console.log(defaultPrompt)

// Render with custom values
const customPrompt = template.render({
  language: 'TypeScript',
  userQuestion: 'How do I create an interface?'
})
console.log(customPrompt)
```

### Markdown Template Example

```markdown
## Prompt Template

<script setup>
import { ref } from 'vue';
const showSystemPrompt = ref(true);
const language = ref('JavaScript');
const userQuestion = ref('How do I create a counter?');
</script>

<div v-if="showSystemPrompt">
## System Prompt
You are a coding assistant. Please use {{language}} to answer questions.
</div>

## User Prompt

{{userQuestion}}
```

### HTML Rendering (Original Functionality)

You can also render Markdown to HTML with the original functionality:

```typescript
import { renderMarkdown } from './src/md'

// Render Markdown to HTML
const html = await renderMarkdown('examples/Markdown.md')
console.log(html)
```

## Installation

```bash
npm install
npm run dev:md  # Run markdown example
```
