import fs from 'node:fs/promises'
import { processMarkdown } from '../src'

(async () => {
  // Read Markdown file
  const markdownString = await fs.readFile('examples/assets/Markdown.md', 'utf-8')

  const result = await processMarkdown(markdownString)
  console.log(result)
})()
