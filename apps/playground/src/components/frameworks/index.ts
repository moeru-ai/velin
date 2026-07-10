import type { FrameworkDefinition, PlaygroundRuntime } from './types'

import ReactPrompt from '../../prompts/Prompt.react.tsx?raw'
import VuePrompt from '../../prompts/Prompt.velin.vue?raw'
import ReactFramework from './React.vue'
import VueFramework from './Vue.vue'

import { renderReactPrompt } from './composables/react'
import { renderVuePrompt } from './composables/vue'

export type { FrameworkDefinition, FrameworkRenderContext, FrameworkRenderResult, PlaygroundRuntime } from './types'

export const frameworkDefinitions = {
  vue: {
    component: VueFramework,
    filename: 'src/App.vue',
    label: 'Vue',
    render: renderVuePrompt,
    source: VuePrompt,
  },
  react: {
    component: ReactFramework,
    filename: 'src/App.tsx',
    label: 'React',
    render: renderReactPrompt,
    source: ReactPrompt,
  },
} satisfies Record<PlaygroundRuntime, FrameworkDefinition>

export const frameworkOptions = Object.entries(frameworkDefinitions).map(([value, definition]) => ({
  label: definition.label,
  value,
}))
