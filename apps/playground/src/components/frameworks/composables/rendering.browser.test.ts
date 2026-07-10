import type { FrameworkDefinition } from '../types'

import { describe, expect, it } from 'vitest'
import { computed, nextTick, reactive, ref } from 'vue'

import { useFrameworkPromptRendering } from './rendering'

function createFramework(renderedPrefix = 'rendered'): FrameworkDefinition {
  return {
    component: {} as never,
    filename: 'src/App.test',
    label: 'Test',
    source: 'source',
    async render({ formValues }) {
      return {
        promptProps: [
          {
            key: 'topic',
            title: 'topic',
            type: 'string',
            value: 'Default topic',
          },
        ],
        rendered: `${renderedPrefix}: ${formValues.topic ?? ''}`,
      }
    },
  }
}

describe('useFrameworkPromptRendering', () => {
  it('applies default props before the reset render result is committed', async () => {
    const formValues = reactive<Record<string, unknown>>({})
    const renderer = useFrameworkPromptRendering({
      activeFilename: computed(() => 'src/App.test'),
      activeFramework: computed(() => createFramework()),
      formValues,
      inputPrompt: ref('source'),
    })

    await renderer.renderPrompt(true)

    expect(formValues.topic).toBe('Default topic')
    expect(renderer.renderedPrompt.value).toBe('rendered: Default topic')
    expect(renderer.resolvedProps.value).toHaveLength(1)
    expect(renderer.initializing.value).toBe(false)
  })

  it('keeps user-entered props during non-reset renders', async () => {
    const formValues = reactive<Record<string, unknown>>({})
    const renderer = useFrameworkPromptRendering({
      activeFilename: computed(() => 'src/App.test'),
      activeFramework: computed(() => createFramework()),
      formValues,
      inputPrompt: ref('source'),
    })

    await renderer.renderPrompt(true)
    formValues.topic = 'Typed topic'
    await nextTick()
    await renderer.renderPrompt(false)

    expect(formValues.topic).toBe('Typed topic')
    expect(renderer.renderedPrompt.value).toBe('rendered: Typed topic')
  })
})
