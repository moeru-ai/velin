import { readFile } from 'node:fs/promises'

import { renderMarkdownString } from '@velin-dev/core'
import { ref } from 'vue'

async function main() {
  const markdownString = await readFile('./src/assets/markdown.md', 'utf-8')
  const result1 = await renderMarkdownString(markdownString, { language: ref('TypeScript') })

  // eslint-disable-next-line no-console
  console.log(result1)
}

main()
