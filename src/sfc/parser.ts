import type { RenderFunction, SetupContext } from 'vue'
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc'
import { renderToString } from '@vue/server-renderer'
import defu from 'defu'
import ErrorStackParser from 'error-stack-parser'
import path from 'path-browserify-esm'
import { convertHtmlToMarkdown } from '../markdown/utils'
import { evaluateAnyModule } from './import'

export type Component = any
export type Data = Record<string, any>
export interface CompiledResult {
  templateResult: ReturnType<typeof compileTemplate>
  scriptResult: ReturnType<typeof compileScript>
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
    templateResult,
    scriptResult,
  }
}

export async function resolveDataFromScriptComponent(component: Component): Promise<Data> {
  // TODO: only support setup now
  const instance = {}
  if (component?.setup) {
    const setupResult = await component.setup({}, { expose: () => {} })
    Object.assign(instance, setupResult)
  }

  return instance
}

export async function renderSFC(source: string, data?: Data): Promise<string> {
  const { templateResult, scriptResult } = await compileSFC(source)

  // eslint-disable-next-line unicorn/error-message
  const stack = ErrorStackParser.parse(new Error())
  const entranceDir = path.dirname(stack[1].fileName?.replace('async', '').trim() || '')

  const script = await evaluateAnyModule<SetupContext>(scriptResult.content, entranceDir)
  const render = await evaluateAnyModule<RenderFunction>(templateResult.code)

  if (!script || !render) {
    throw new Error('Failed to evaluate script or render function')
  }

  let ctx = await resolveDataFromScriptComponent(script)
  ctx = defu(data || {}, ctx)

  const dom = render.call(ctx, ctx, [])
  const renderedHTML = await renderToString(dom)
  return renderedHTML
}

export async function renderSFCToMarkdown(source: string, data?: Data): Promise<string> {
  const dom = await renderSFC(source, data)
  return convertHtmlToMarkdown(dom)
}
