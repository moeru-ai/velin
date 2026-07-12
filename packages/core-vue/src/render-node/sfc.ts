import type { DefineComponent } from '@vue/runtime-core'

import type { ComponentProp } from '../render-shared'
import type { InputProps, RenderSFCOptions } from '../types'

import ErrorStackParser from 'error-stack-parser'
import path from 'path-browserify-esm'

import { evaluate } from '@unrteljs/eval/node'
import { componentFromSource } from '@velin-dev/source-vue'
import { toMarkdown } from '@velin-dev/utils/to-md'
import { renderToString } from '@vue/server-renderer'

import { compileSFC, onlyRender, resolveProps } from '../render-shared'
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
  if (!component) {
    return []
  }

  const renderedComponent = onlyRender(component, {})
  return resolveProps(renderedComponent as any)
}

export async function renderSFC<RawProps = any>(
  source: string,
  data?: InputProps<RawProps>,
  options?: string | RenderSFCOptions,
): Promise<{
  props: ComponentProp[]
  rendered: string
}> {
  const resolvedOptions = resolveSFCOptions(options)
  const evaluatedComponent = resolvedOptions.vfs
    ? await componentFromSource(source, {
        filename: resolvedOptions.filename,
        vfs: resolvedOptions.vfs,
      })
    : await evaluateSFC(source, resolvedOptions.basePath)
  if (!evaluatedComponent) {
    return {
      props: [],
      rendered: '',
    }
  }

  const renderFunc = onlyRender(evaluatedComponent as any, data || {})
  return {
    props: resolveProps(renderFunc as any),
    rendered: await renderToString(renderFunc),
  }
}

export async function renderSFCString<RawProps = any>(
  source: string,
  data?: InputProps<RawProps>,
  options?: string | RenderSFCOptions,
): Promise<{
  props: ComponentProp[]
  rendered: string
}> {
  source = normalizeSFCSource(source)

  const { props, rendered } = await renderSFC(source, data, options)
  return {
    props,
    rendered: await toMarkdown(rendered),
  }
}

function resolveSFCOptions(options: string | RenderSFCOptions | undefined): RenderSFCOptions {
  if (typeof options === 'string') {
    return { basePath: options }
  }

  return options ?? {}
}
