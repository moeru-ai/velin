import fs from 'node:fs/promises'
import { renderSFC } from '../src'

(async () => {
  try {
    const source = await fs.readFile('examples/assets/MyComponent.vue', 'utf-8')

    const html = await renderSFC(source)
    console.log('Render result:\n', html)
  }
  catch (error) {
    console.error('Failed to render SFC:', error)
  }
})()
