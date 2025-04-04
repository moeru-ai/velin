import fs from 'node:fs/promises'
import { processMarkdown } from '../src/markdown/parser'

(async () => {
  const markdownString = await fs.readFile('examples/assets/Markdown.md', 'utf-8')

  await processMarkdown(markdownString)
})()
