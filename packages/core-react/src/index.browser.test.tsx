import { describe, expect, it } from 'vitest'

import { renderComponent, renderElement } from './index'

describe('renderElement from default entry in browser', () => {
  it('renders a React element to Markdown', async () => {
    await expect(renderElement(<span>Browser element</span>)).resolves.toBe('Browser element\n')
  })
})

describe('renderComponent from default entry in browser', () => {
  it('renders function component output to Markdown', async () => {
    function Prompt() {
      return <div>Hello browser</div>
    }

    await expect(renderComponent(Prompt)).resolves.toBe('Hello browser\n')
  })
})
