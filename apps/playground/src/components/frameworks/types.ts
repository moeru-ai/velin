import type { ComponentProp } from '@velin-dev/core/render-shared'
import type { Component } from 'vue'

export type PlaygroundRuntime = 'vue' | 'react'

export interface FrameworkRenderResult {
  promptProps: ComponentProp[]
  rendered: string
}

export interface FrameworkRenderContext {
  filename: string
  formValues: Record<string, unknown>
  source: string
}

export interface FrameworkDefinition {
  component: Component
  filename: string
  label: string
  render: (context: FrameworkRenderContext) => Promise<FrameworkRenderResult>
  source: string
}
