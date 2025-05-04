import { readFile } from 'node:fs/promises'
import { renderSFCString } from '@velin-dev/core/node'
import { ref } from 'vue'

(async () => {
  const source = await readFile('./src/assets/MyComponent.vue', 'utf-8')

  const html = await renderSFCString(source, { language: ref('TypeScript') })
  // eslint-disable-next-line no-console
  console.log(html)
})()
