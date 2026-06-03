import { describe, expect, it } from 'vitest'

import { ImportedPrompt } from '../testdata/imported-prompt'
import { renderComponent, renderElement } from './index'

describe('renderComponent from render-node', () => {
  it('should type-check props requirements', () => {
    function Prompt() {
      return <div>Hello Velin</div>
    }

    function RequiredPrompt({ name }: { name: string }) {
      return <div>{`Hello ${name}`}</div>
    }

    void renderComponent(Prompt)
    // @ts-expect-error required props must be provided
    void renderComponent(RequiredPrompt)
    void renderComponent(RequiredPrompt, { name: 'React' })
  })

  it('should render function component output to Markdown', async () => {
    function Prompt() {
      return <div>Hello Velin</div>
    }

    await expect(renderComponent(Prompt)).resolves.toBe('Hello Velin\n')
  })

  it('should pass props to the component', async () => {
    function Prompt({ name }: { name: string }) {
      return <div>{`Hello ${name}`}</div>
    }

    await expect(renderComponent(Prompt, { name: 'React' })).resolves.toBe('Hello React\n')
  })

  it('should convert nested HTML to Markdown', async () => {
    function Prompt() {
      return (
        <section>
          <h1>Plan</h1>
          <ul>
            <li>Render</li>
            <li>Convert</li>
          </ul>
        </section>
      )
    }

    const result = await renderComponent(Prompt)

    expect(result).toContain('# Plan')
    expect(result).toContain('- Render')
    expect(result).toContain('- Convert')
  })

  it('should render null output to empty Markdown', async () => {
    function Prompt() {
      return null
    }

    await expect(renderComponent(Prompt)).resolves.toBe('')
  })

  it('should render an imported component with React imports', async () => {
    await expect(renderComponent(ImportedPrompt, { name: 'node import' })).resolves.toBe(
      '# Imported\n\n**NODE IMPORT**\n',
    )
  })
})

describe('renderElement from render-node', () => {
  it('should render a React element to Markdown', async () => {
    await expect(renderElement(<span>Element prompt</span>)).resolves.toBe('Element prompt\n')
  })
})
