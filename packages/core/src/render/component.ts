import type { ComponentPropsOptions } from 'vue'
import type {
  LooseRequiredRenderComponentInputProps,
  RenderComponentInputComponent,
  RenderComponentInputProps,
  ResolveRenderComponentInputProps,
} from './types'

import { toMarkdown } from '@velin-dev/utils/to-md'
import { toValue } from '@vue/reactivity'
import { renderToString } from 'vue/server-renderer'

export function renderComponent<
  RawProps = any,
  ComponentProps = ComponentPropsOptions<RawProps>,
  ResolvedProps = ResolveRenderComponentInputProps<RawProps, ComponentProps>,
>(
  promptComponent: RenderComponentInputComponent<ResolvedProps>,
  props: RenderComponentInputProps<ResolvedProps>,
) {
  return new Promise<string>((resolve, reject) => {
    const setupData = promptComponent.setup?.(
      toValue(props) as unknown as LooseRequiredRenderComponentInputProps<ResolvedProps>,
      { attrs: {}, slots: {}, emit: () => { }, expose: () => { } },
    )

    const renderResult = promptComponent.render?.(setupData, setupData, [], setupData, setupData)
    renderToString(renderResult).then(toMarkdown).then(resolve).catch(reject)
  })
}
