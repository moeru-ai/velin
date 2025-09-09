import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { renderMarkdownString } from './markdown'

describe('renderMarkdownString', async () => {
  it('should be able to render simple SFC', async () => {
    const content = await readFile(join(dirname(fileURLToPath(import.meta.url)), 'testdata', 'simple.velin.md'), 'utf-8')
    const { props, rendered } = await renderMarkdownString(content)
    expect(props).toBeDefined()
    expect(props.length).toBe(0)
    expect(rendered).toBeDefined()
    expect(rendered).not.toBe('')
    expect(rendered).toBe('# Hello, world!\n')
  })

  it('should be able to render script setup SFC', async () => {
    const content = await readFile(join(dirname(fileURLToPath(import.meta.url)), 'testdata', 'script-setup.velin.md'), 'utf-8')
    const { props, rendered } = await renderMarkdownString(content)
    expect(props).toBeDefined()
    expect(props.length).toBe(0)
    expect(rendered).toBeDefined()
    expect(rendered).not.toBe('')
    expect(rendered).toBe('Count: 0\n')
  })

  it('should be able to render script setup SFC with lang="ts"', async () => {
    const content = await readFile(join(dirname(fileURLToPath(import.meta.url)), 'testdata', 'script-setup.ts.velin.md'), 'utf-8')
    const { props, rendered } = await renderMarkdownString(content)
    expect(props).toBeDefined()
    expect(props.length).toBe(0)
    expect(rendered).toBeDefined()
    expect(rendered).not.toBe('')
    expect(rendered).toBe('Count: 0\n')
  })

  it('should be able to render script setup SFC with props', async () => {
    const content = await readFile(join(dirname(fileURLToPath(import.meta.url)), 'testdata', 'script-setup-with-props.velin.md'), 'utf-8')
    const { props, rendered } = await renderMarkdownString(content, { date: '2025-07-01' })
    expect(props).toBeDefined()
    expect(props.length).toBe(1)
    expect(rendered).toBeDefined()
    expect(rendered).not.toBe('')
    expect(rendered).toBe('# Count: 0\n\n2025-07-01\n')
  })

  it('should be able to render script setup SFC with props with lang="ts"', async () => {
    const content = await readFile(join(dirname(fileURLToPath(import.meta.url)), 'testdata', 'script-setup-with-props.ts.velin.md'), 'utf-8')
    const { props, rendered } = await renderMarkdownString(content, { date: '2025-07-01' })
    expect(props).toBeDefined()
    expect(props.length).toBe(1)
    expect(rendered).toBeDefined()
    expect(rendered).not.toBe('')
    expect(rendered).toBe('# Count: 0\n\n2025-07-01\n')
  })
})
