# @velin-dev/ml

Parse Vue SFC or Markdown to prompt for LLM.

## Preview

![Preview](https://github.com/user-attachments/assets/5810c1ee-55cf-42bc-963a-a870b0849bfb)

## Usage

### Markdown

```ts
import { processMarkdown } from '@velin-dev/ml'

const markdown = await processMarkdown(markdownString, {
  language: ref('TypeScript'), // The data to be passed to the prompt
})
```

### Vue SFC

```ts
import { renderSFC } from '@velin-dev/ml'

const html = await renderSFC(source, {
  language: ref('TypeScript'), // The data to be passed to the prompt
})
```

```ts
import { renderSFCToMarkdown } from '@velin-dev/ml'

const markdown = await renderSFCToMarkdown(source, {
  language: ref('TypeScript'), // The data to be passed to the prompt
})
```

## License

MIT
