import type { FrameworkRenderContext, FrameworkRenderResult } from '../types'

import { renderComponent } from '@velin-dev/core-react/render-browser'

import { componentFromReactSource } from '../../../runtime/react'

export async function renderReactPrompt({
  filename,
  formValues,
  source,
}: FrameworkRenderContext): Promise<FrameworkRenderResult> {
  const { component, promptProps } = await componentFromReactSource(source, {
    filename,
  })

  return {
    promptProps,
    rendered: await renderComponent(component, formValues),
  }
}
