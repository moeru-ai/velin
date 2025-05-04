import type { SFCScriptBlock, SFCTemplateCompileResults } from '@vue/compiler-sfc'
import type { DefineComponent, RenderFunction, SetupContext } from 'vue'

import { toMarkdown } from '@velin-dev/utils/to-md'
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc'
import defu from 'defu'
import ErrorStackParser from 'error-stack-parser'
import path from 'path-browserify-esm'
import { renderToString } from 'vue/server-renderer'

import { evaluateAnyModule } from './import'

export type Data = Record<string, any>
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
    compilerOptions: {
      runtimeModuleName: 'vue',
    },
  })

  const scriptResult = compileScript(descriptor, {
    id: `vue-component-${Date.now()}`,
  })

  return {
    template: templateResult,
    script: scriptResult,
  }
}

export async function resolveDataFromScriptComponent(component: SFCScriptBlock): Promise<Data> {
  // TODO: only support setup now
  const instance = {}
  if (component?.setup) {
    const setupResult = (component as unknown as DefineComponent).setup({}, { attrs: {}, slots: {}, emit: () => {}, expose: () => {} })
    Object.assign(instance, setupResult)
  }

  return instance
}

export async function renderSFC(source: string, data?: Data, basePath?: string): Promise<string> {
  const { template, script } = await compileSFC(source)

  if (!basePath) {
  // eslint-disable-next-line unicorn/error-message
    const stack = ErrorStackParser.parse(new Error())
    basePath = path.dirname(stack[1].fileName?.replace('async', '').trim() || '')
  }

  const scriptResult = await evaluateAnyModule<SetupContext>(script.content, basePath)
  const renderResult = await evaluateAnyModule<RenderFunction>(template.code)

  if (!scriptResult || !renderResult) {
    throw new Error('Failed to evaluate script or render function')
  }

  let ctx = await resolveDataFromScriptComponent(script)
  ctx = defu(data || {}, ctx)

  const dom = renderResult.call(ctx, ctx, [], ctx, ctx)
  const renderedHTML = await renderToString(dom)
  return renderedHTML
}

export async function renderSFCToMarkdown(source: string, data?: Data): Promise<string> {
  const dom = await renderSFC(source, data)
  return toMarkdown(dom)
}
