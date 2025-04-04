import fs from 'node:fs/promises'
import { renderSFC } from '../src'

(async () => {
  const source = await fs.readFile('examples/assets/MyComponent.vue', 'utf-8')

  const html = await renderSFC(source)
  console.log(html)
})()
