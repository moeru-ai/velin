import { describe, expect, it } from 'vitest'

import { ImportedPrompt } from '../testdata/imported-prompt'
import { renderComponent, renderElement } from './'

describe('renderElement from render-browser', () => {
  it('renders a React element to Markdown', async () => {
    await expect(renderElement(<span>Browser element</span>)).resolves.toBe('Browser element\n')
  })
})

describe('renderComponent from render-browser', () => {
  it('renders function component output to Markdown', async () => {
    function Prompt() {
      return <div>Hello browser</div>
    }

    await expect(renderComponent(Prompt)).resolves.toBe('Hello browser\n')
  })

  it('converts nested HTML to Markdown', async () => {
    function Prompt() {
      return (
        <section>
          <h1>Browser Plan</h1>
          <ul>
            <li>Render</li>
            <li>Convert</li>
          </ul>
        </section>
      )
    }

    const result = await renderComponent(Prompt)

    expect(result).toContain('# Browser Plan')
    expect(result).toContain('- Render')
    expect(result).toContain('- Convert')
  })

  it('renders an imported component with React imports', async () => {
    await expect(renderComponent(ImportedPrompt, { name: 'browser import' })).resolves.toBe(
      '# Imported\n\n**BROWSER IMPORT**\n',
    )
  })
})
