import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { evaluateSFC, renderSFCString, resolvePropsFromString } from './sfc'

describe('renderSFCString', async () => {
  it('should be able to render simple SFC', async () => {
    const content = await readFile(join(dirname(fileURLToPath(import.meta.url)), 'testdata', 'simple.velin.vue'), 'utf-8')
    const result = await renderSFCString(content)
    expect(result).toBeDefined()
    expect(result).not.toBe('')
    expect(result).toBe('# Hello, world!\n')
  })

  it('should be able to render script setup SFC with', async () => {
    const content = await readFile(join(dirname(fileURLToPath(import.meta.url)), 'testdata', 'script-setup.velin.vue'), 'utf-8')
    const result = await renderSFCString(content)
    expect(result).toBeDefined()
    expect(result).not.toBe('')
    expect(result).toBe('# Count: 0\n')
  })

  it('should be able to render script setup SFC lang="ts"', async () => {
    const content = await readFile(join(dirname(fileURLToPath(import.meta.url)), 'testdata', 'script-setup.ts.velin.vue'), 'utf-8')
    const result = await renderSFCString(content)
    expect(result).toBeDefined()
    expect(result).not.toBe('')
    expect(result).toBe('# Count: 0\n')
  })

  it('should be able to render script setup SFC with props', async () => {
    const content = await readFile(join(dirname(fileURLToPath(import.meta.url)), 'testdata', 'script-setup-with-props.velin.vue'), 'utf-8')
    const result = await renderSFCString(content, { date: '2025-07-01' })
    expect(result).toBeDefined()
    expect(result).not.toBe('')
    expect(result).toBe('# Count: 0\n\n2025-07-01\n')
  })

  it('should be able to render script setup SFC with props with lang="ts"', async () => {
    const content = await readFile(join(dirname(fileURLToPath(import.meta.url)), 'testdata', 'script-setup-with-props.ts.velin.vue'), 'utf-8')
    const result = await renderSFCString(content, { date: '2025-07-01' })
    expect(result).toBeDefined()
    expect(result).not.toBe('')
    expect(result).toBe('# Count: 0\n\n2025-07-01\n')
  })
})

describe('evaluateSFC', async () => {
  it('should be able to evaluate script setup SFC', async () => {
    const content = await readFile(join(dirname(fileURLToPath(import.meta.url)), 'testdata', 'script-setup.velin.vue'), 'utf-8')
    const component = await evaluateSFC(content)
    expect(component).toBeDefined()
    expect(component.setup).toBeDefined()
    expect(typeof component.setup).toBe('function')
  })

  it('should be able to evaluate script setup SFC with lang="ts"', async () => {
    const content = await readFile(join(dirname(fileURLToPath(import.meta.url)), 'testdata', 'script-setup.ts.velin.vue'), 'utf-8')
    const component = await evaluateSFC(content)
    expect(component).toBeDefined()
    expect(component.setup).toBeDefined()
    expect(typeof component.setup).toBe('function')
  })

  it('should be able to evaluate script setup SFC with props', async () => {
    const content = await readFile(join(dirname(fileURLToPath(import.meta.url)), 'testdata', 'script-setup-with-props.velin.vue'), 'utf-8')
    const component = await evaluateSFC(content)
    expect(component).toBeDefined()
    expect(component.setup).toBeDefined()
    expect(typeof component.setup).toBe('function')
  })

  it('should be able to evaluate script setup SFC with props with lang="ts"', async () => {
    const content = await readFile(join(dirname(fileURLToPath(import.meta.url)), 'testdata', 'script-setup-with-props.ts.velin.vue'), 'utf-8')
    const component = await evaluateSFC(content)
    expect(component).toBeDefined()
    expect(component.setup).toBeDefined()
    expect(typeof component.setup).toBe('function')
  })
})

describe('resolvePropsFromString', async () => {
  it('should be able to render script setup SFC', async () => {
    const content = await readFile(join(dirname(fileURLToPath(import.meta.url)), 'testdata', 'script-setup-with-props.velin.vue'), 'utf-8')
    const props = await resolvePropsFromString(content)
    expect(props).toEqual([
      { key: 'date', type: 'string', title: 'date' },
    ])
  })

  it('should be able to render script setup SFC with lang="ts"', async () => {
    const content = await readFile(join(dirname(fileURLToPath(import.meta.url)), 'testdata', 'script-setup-with-props.ts.velin.vue'), 'utf-8')
    const props = await resolvePropsFromString(content)
    expect(props).toEqual([
      { key: 'date', type: 'string', title: 'date' },
    ])
  })
})
