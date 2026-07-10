import type { FrameworkRenderContext, FrameworkRenderResult } from '../types'

import { render as renderVueSource } from '@velin-dev/core-vue/render-repl'

export async function renderVuePrompt({
  formValues,
  source,
}: FrameworkRenderContext): Promise<FrameworkRenderResult> {
  const { props: promptProps, rendered } = await renderVueSource(source, formValues)

  return {
    promptProps,
    rendered,
  }
}
