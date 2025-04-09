import fs from 'node:fs/promises'
import { ref } from 'vue'
import { processMarkdown } from '../src/markdown/parser'

(async () => {
  const markdownString = await fs.readFile('examples/assets/Markdown.md', 'utf-8')
  // const composableString = await fs.readFile('examples/assets/Composable.md', 'utf-8')

  const result1 = await processMarkdown(markdownString, {
    language: ref('TypeScript'),
  })

  // const result2 = await processMarkdown(composableString, {
  //   markdown: ref(result1),
  // })

  console.log(result1)
})()
