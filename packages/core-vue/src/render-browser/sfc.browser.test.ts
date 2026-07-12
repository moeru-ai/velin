import { describe, expect, it, vi } from 'vitest'

import ImportOtherSfcPrompt from './testdata/import-other-sfc/prompt.vue'
import importOtherSfcPromptSource from './testdata/import-other-sfc/prompt.vue?raw'
import scriptSetupWithPropsSfc from './testdata/script-setup-with-props.velin.vue?raw'
import scriptSetupSfc from './testdata/script-setup.velin.vue?raw'
import simpleSfc from './testdata/simple.velin.vue?raw'

import { renderComponent } from '../render-shared'
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

  it('should reject raw SFC source that imports another SFC without a browser module graph', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    try {
      await expect(renderSFCString(
        importOtherSfcPromptSource,
        {
          sessionDate: new Date('2026-07-12T08:30:00.000Z'),
          userId: 'agent-user-01',
        },
        new URL('./testdata/import-other-sfc/prompt.vue', import.meta.url).href,
      )).rejects.toThrow()
    }
    finally {
      consoleError.mockRestore()
    }
  })
})

describe('renderComponent', async () => {
  it('should render a bundled Vue component that imports nested SFCs', async () => {
    await expect(
      renderComponent(ImportOtherSfcPrompt, {
        sessionDate: new Date('2026-07-12T08:30:00.000Z'),
        userId: 'agent-user-01',
      }),
    ).resolves.toBe(
      '# Agent Prompt\n\nSession for `agent-user-01` on 2026-07-12T08:30:00.000Z\n\n## Additional System Instructions\n\nUse listSkills tools to list available skills before selecting one.\n',
    )
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
