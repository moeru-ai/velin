import fs from 'node:fs/promises'

import { renderSFCToMarkdown } from '../src'

(async () => {
  const source = await fs.readFile('examples/assets/MyComponent.vue', 'utf-8')

  const html = await renderSFCToMarkdown(source)
  // eslint-disable-next-line no-console
  console.log(html)
})()
