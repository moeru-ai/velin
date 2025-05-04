import type { SFCScriptBlock, SFCTemplateCompileResults } from '@vue/compiler-sfc'
import type { DefineComponent, RenderFunction } from '@vue/runtime-core'

import { evaluateAnyModule } from '@velin-dev/utils/import'
import { toMarkdown } from '@velin-dev/utils/to-md'
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc'
import { renderToString } from '@vue/server-renderer'
import defu from 'defu'
import ErrorStackParser from 'error-stack-parser'
import path from 'path-browserify-esm'

export interface CompiledResult {
  template: SFCTemplateCompileResults
  script: SFCScriptBlock
}

export async function compileSFC(source: string): Promise<CompiledResult> {
  const { descriptor } = parse(source)

  if (!descriptor.template) {
    throw new Error(`source has no <template> tag.`)
  }

  const templateResult = compileTemplate({
    source: descriptor.template.content,
    filename: 'temp.vue',
    id: `vue-component-${Date.now()}`,
    compilerOptions: { runtimeModuleName: 'vue' },
  })

  const scriptResult = compileScript(descriptor, {
    id: `vue-component-${Date.now()}`,
  })

  return {
    template: templateResult,
    script: scriptResult,
  }
}

export async function setupSFC(component: DefineComponent): Promise<Record<string, unknown>> {
  // TODO: only support setup now
  const instance: Record<string, unknown> = {}
  if (component?.setup) {
    const setupResult = await (component).setup(
      {},
      { attrs: {}, slots: {}, emit: () => { }, expose: () => { } },
    )

    return defu(instance, setupResult as Record<string, unknown>)
  }

  return instance
}

export async function renderSFC(source: string, data?: Record<string, unknown>, basePath?: string): Promise<string> {
  const { template, script } = await compileSFC(source)

  if (!basePath) {
    // eslint-disable-next-line unicorn/error-message
    const stack = ErrorStackParser.parse(new Error())
    basePath = path.dirname(stack[1].fileName?.replace('async', '').trim() || '')
  }

  const scriptResult = await evaluateAnyModule<DefineComponent>(script.content, basePath)
  const renderResult = await evaluateAnyModule<RenderFunction>(template.code, basePath)
  if (!scriptResult || !renderResult) {
    throw new Error('Failed to evaluate script or render function')
  }

  const ctx = defu(data || {}, await setupSFC(scriptResult))
  const html = renderResult.call(ctx, ctx, [], ctx, ctx)
  const renderedHTML = await renderToString(html)

  return renderedHTML
}

export async function renderSFCString(source: string, data?: Record<string, unknown>, basePath?: string): Promise<string> {
  const html = await renderSFC(source, data, basePath)
  return toMarkdown(html)
}
