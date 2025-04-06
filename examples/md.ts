import fs from 'node:fs/promises'
import { ref } from 'vue'
import { processMarkdown } from '../src/markdown/parser'

(async () => {
  const markdownString = await fs.readFile('examples/assets/Markdown.md', 'utf-8')

  const result = await processMarkdown(markdownString, {
    language: ref('TypeScript'),
  })
  console.log(result)
})()
