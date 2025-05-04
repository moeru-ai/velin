import { readFile } from 'node:fs/promises'
import { renderMarkdownString } from '@velin-dev/core/node'
import { ref } from 'vue'

(async () => {
  const markdownString = await readFile('./src/assets/markdown.md', 'utf-8')
  // const composableString = await fs.readFile('examples/assets/Composable.md', 'utf-8')

  const result1 = await renderMarkdownString(markdownString, { language: ref('TypeScript') })

  // const result2 = await processMarkdown(composableString, {
  //   markdown: ref(result1),
  // })

  // eslint-disable-next-line no-console
  console.log(result1)
})()
