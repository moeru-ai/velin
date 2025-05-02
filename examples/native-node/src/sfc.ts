import { readFile } from 'node:fs/promises'
import { renderSFCToMarkdown } from '@velin-dev/core'

(async () => {
  const source = await readFile('./src/assets/MyComponent.vue', 'utf-8')

  const html = await renderSFCToMarkdown(source)
  // eslint-disable-next-line no-console
  console.log(html)
})()
