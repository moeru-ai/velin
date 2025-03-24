import { renderSFC } from '../src/sfc';

// Usage example
(async () => {
  try {
    const html = await renderSFC('assets/MyComponent.vue')
    console.log('Render result:\n', html)
  }
  catch (error) {
    console.error('Failed to render SFC:', error)
  }
})()
