import type { DefineComponent } from '@vue/runtime-core'

import type { InputProps } from '../types'

import ErrorStackParser from 'error-stack-parser'
import path from 'path-browserify-esm'

import { evaluate } from '@unrteljs/eval/browser'
import { toMarkdown } from '@velin-dev/utils/to-md'
import { renderToString } from '@vue/server-renderer'

import { compileSFC, type ComponentProp, onlyRender, resolveProps } from '../render-shared'
import { normalizeSFCSource } from '../render-shared/sfc'

export async function evaluateSFC(
  source: string,
  basePath?: string,
) {
  const { script } = await compileSFC(source)

  if (!basePath) {
    // eslint-disable-next-line unicorn/error-message
    const stack = ErrorStackParser.parse(new Error())
    basePath = path.dirname(stack[1].fileName?.replace('async', '').trim() || '')
  }

  // TODO: evaluate setup when not <script setup>
  return await evaluate<DefineComponent>(`${script.content}`, { base: basePath })
}

export async function resolvePropsFromString(content: string) {
  const component = await evaluateSFC(content)
  const renderedComponent = onlyRender(component, {})
  return resolveProps(renderedComponent as any)
}

export async function renderSFC<RawProps = any>(
  source: string,
  data?: InputProps<RawProps>,
  basePath?: string,
): Promise<{
    props: ComponentProp[]
    rendered: string
  }> {
  const evaluatedComponent = await evaluateSFC(source, basePath)
  const app = onlyRender(evaluatedComponent, data)
  return {
    props: resolveProps(app as any),
    rendered: await renderToString(app),
  }
}

export async function renderSFCString<RawProps = any>(
  source: string,
  data?: InputProps<RawProps>,
  basePath?: string,
): Promise<{
    props: ComponentProp[]
    rendered: string
  }> {
  source = normalizeSFCSource(source)

  const { props, rendered } = await renderSFC(source, data, basePath)

  return {
    props,
    rendered: await toMarkdown(rendered),
  }
}
