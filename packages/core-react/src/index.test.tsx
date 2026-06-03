import { describe, expect, it } from 'vitest'

import { renderComponent, renderElement } from './index'

describe('renderComponent from default entry', () => {
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
})

describe('renderElement from default entry', () => {
  it('should render a React element to Markdown', async () => {
    await expect(renderElement(<span>Element prompt</span>)).resolves.toBe('Element prompt\n')
  })
})
