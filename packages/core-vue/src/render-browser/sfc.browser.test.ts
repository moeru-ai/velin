import { describe, expect, it } from 'vitest'

import scriptSetupWithPropsSfc from './testdata/script-setup-with-props.velin.vue?raw'
import scriptSetupSfc from './testdata/script-setup.velin.vue?raw'
import simpleSfc from './testdata/simple.velin.vue?raw'

import { evaluateSFC, renderSFCString, resolvePropsFromString } from './sfc'

describe('renderSFCString', async () => {
  it('should be able to render simple SFC', async () => {
    const { props, rendered } = await renderSFCString(simpleSfc)
    expect(props).toBeDefined()
    expect(props.length).toBe(0)
    expect(rendered).toBeDefined()
    expect(rendered).not.toBe('')
    expect(rendered).toBe('# Hello, world!\n')
  })

  it('should be able to render script setup SFC', async () => {
    const { props, rendered } = await renderSFCString(scriptSetupSfc)
    expect(props).toBeDefined()
    expect(props.length).toBe(0)
    expect(rendered).toBeDefined()
    expect(rendered).not.toBe('')
    expect(rendered).toBe('# Count: 0\n')
  })
})

describe('evaluateSFC', async () => {
  it('should be able to evaluate script setup SFC', async () => {
    const component = await evaluateSFC(scriptSetupSfc)
    expect(component).toBeDefined()
    expect(component!.setup).toBeDefined()
    expect(typeof component!.setup).toBe('function')
  })
})

describe('resolvePropsFromString', async () => {
  it('should be able to render script setup SFC', async () => {
    const props = await resolvePropsFromString(scriptSetupWithPropsSfc)
    expect(props).toEqual([
      { key: 'date', type: 'string', title: 'date', required: false },
    ])
  })
})
