import type { SFCDescriptor, SFCScriptBlock, SFCTemplateCompileResults } from '@vue/compiler-sfc'
import type { DefineComponent } from '@vue/runtime-core'
import type { InputProps } from '../types'

import { evaluateAnyModule } from '@velin-dev/utils/import'
import { toMarkdown } from '@velin-dev/utils/to-md'
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc'
import defu from 'defu'
import ErrorStackParser from 'error-stack-parser'
import { fromHtml } from 'hast-util-from-html'
import path from 'path-browserify-esm'

import { onlyRender } from '../render-shared'

export interface CompiledResult {
  template: SFCTemplateCompileResults
  script: SFCScriptBlock
}

// Check if we can use compile template as inlined render function
// inside <script setup>. This can only be done for build because
// inlined template cannot be individually hot updated.
export function isUseInlineTemplate(
  descriptor: SFCDescriptor,
): boolean {
  return (
    !!descriptor.scriptSetup
    && !descriptor.template?.src
  )
}

export async function compileSFC(source: string): Promise<CompiledResult> {
  const { descriptor } = parse(source)

  if (!descriptor.template) {
    throw new Error(`source has no <template> tag.`)
  }

  const templateOptions = {
    source: descriptor.template.content,
    filename: 'temp.vue',
    id: `vue-component-${Date.now()}`,
    compilerOptions: { runtimeModuleName: 'vue' },
  }

  const templateResult = compileTemplate(templateOptions)

  const scriptResult = compileScript(descriptor, {
    id: `vue-component-${Date.now()}`,
    inlineTemplate: isUseInlineTemplate(descriptor),
    templateOptions,
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

export async function renderSFC<RawProps = any>(
  source: string,
  data?: InputProps<RawProps>,
  basePath?: string,
): Promise<string> {
  const { script } = await compileSFC(source)

  if (!basePath) {
    // eslint-disable-next-line unicorn/error-message
    const stack = ErrorStackParser.parse(new Error())
    basePath = path.dirname(stack[1].fileName?.replace('async', '').trim() || '')
  }

  // TODO: evaluate setup when not <script setup>
  const evaluatedComponent = await evaluateAnyModule<DefineComponent>(`${script.content}`, basePath)
  return await onlyRender(evaluatedComponent, data)
}

export async function renderSFCString<RawProps = any>(
  source: string,
  data?: InputProps<RawProps>,
  basePath?: string,
): Promise<string> {
  const hastRoot = fromHtml(source, { fragment: true })
  const hasScript = hastRoot.children.some(node => node.type === 'element' && node.tagName === 'script')
  if (!hasScript) {
    source = `${source}\n<script setup>/* EMPTY */</script>`
  }

  const html = await renderSFC(source, data, basePath)
  return toMarkdown(html)
}
