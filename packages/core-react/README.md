# @velin-dev/core-react

Core React utilities for Velin.

## Usage

```tsx
import { renderComponent } from '@velin-dev/core-react'

function Prompt({ name }: { name: string }) {
  return (
    <article>
      <h1>{`Hello ${name}`}</h1>
      <p>Render React components as Markdown prompts.</p>
    </article>
  )
}

const markdown = await renderComponent(Prompt, { name: 'Velin' })

console.log(markdown)
```
