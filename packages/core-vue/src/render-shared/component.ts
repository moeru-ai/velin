import type { ComponentPropsOptions, SetupContext } from '@vue/runtime-core'

import type {
  InputProps,
  LooseRequiredRenderComponentInputProps,
  RenderComponentInputComponent,
  ResolveRenderComponentInputProps,
} from '../types'

import { toMarkdown } from '@velin-dev/utils/to-md'
import { toValue } from '@vue/reactivity'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp } from 'vue'

type SetupFunction<Props> = (
  props: LooseRequiredRenderComponentInputProps<Props>,
  ctx: SetupContext,
) => unknown

export function onlySetup<
  RawProps = any,
  ComponentProps = ComponentPropsOptions<RawProps>,
  ResolvedProps = ResolveRenderComponentInputProps<RawProps, ComponentProps>,
>(
  promptComponent: RenderComponentInputComponent<ResolvedProps>,
  props: InputProps<ResolvedProps>,
) {
  // WORKAROUND: Vue's DefineComponent setup type includes internal mixin props that TS cannot prove equivalent here.
  const setup = promptComponent.setup as SetupFunction<ResolvedProps> | undefined

  return setup?.(
    toValue(props) as unknown as LooseRequiredRenderComponentInputProps<ResolvedProps>,
    { attrs: {}, slots: {}, emit: () => { }, expose: () => { } },
  )
}

export function onlyRender<
  RawProps = any,
  ComponentProps = ComponentPropsOptions<RawProps>,
  ResolvedProps = ResolveRenderComponentInputProps<RawProps, ComponentProps>,
>(
  promptComponent: RenderComponentInputComponent<ResolvedProps>,
  props: InputProps<ResolvedProps>,
) {
  return createSSRApp(promptComponent, toValue(props) as Record<string, unknown>)
}

export function renderComponent<
  RawProps = any,
  ComponentProps = ComponentPropsOptions<RawProps>,
  ResolvedProps = ResolveRenderComponentInputProps<RawProps, ComponentProps>,
>(
  promptComponent: RenderComponentInputComponent<ResolvedProps>,
  props: InputProps<ResolvedProps>,
) {
  return new Promise<string>((resolve, reject) => {
    renderToString(onlyRender(promptComponent, props))
      .then(toMarkdown)
      .then(resolve)
      .catch(reject)
  })
}
