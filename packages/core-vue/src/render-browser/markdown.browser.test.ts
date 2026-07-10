import { describe, expect, it } from 'vitest'

import scriptSetupMarkdown from './testdata/script-setup.velin.md?raw'
import simpleMarkdown from './testdata/simple.velin.md?raw'

import { renderMarkdownString } from './markdown'

describe('renderMarkdownString', async () => {
  it('should be able to render simple SFC', async () => {
    const { rendered } = await renderMarkdownString(simpleMarkdown)
    expect(rendered).toBeDefined()
    expect(rendered).not.toBe('')
    expect(rendered).toBe('# Hello, world!\n')
  })

  it('should be able to render script setup SFC', async () => {
    const { rendered } = await renderMarkdownString(scriptSetupMarkdown)
    expect(rendered).toBeDefined()
    expect(rendered).not.toBe('')
    expect(rendered).toBe('Count: 0\n')
  })
})
