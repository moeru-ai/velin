/// @vue/repl: https://github.com/vuejs/repl/blob/5e092b6111118f5bb5fc419f0f8f3f84cd539366/src/transform.ts

import type { CompilerOptions, SFCScriptBlock, SFCTemplateCompileResults } from '@vue/compiler-sfc'

import { testTs, transformTS } from '@velin-dev/utils/transformers/typescript'
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc'

import { isUseInlineTemplate } from './template'

export interface CompiledResult {
  template: SFCTemplateCompileResults
  script: SFCScriptBlock
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

  const scriptLang = descriptor.script?.lang || descriptor.scriptSetup?.lang
  const isTS = testTs(scriptLang)

  const expressionPlugins: CompilerOptions['expressionPlugins'] = []
  if (isTS) {
    expressionPlugins.push('typescript')
  }

  const scriptResult = compileScript(descriptor, {
    id: `vue-component-${Date.now()}`,
    inlineTemplate: isUseInlineTemplate(descriptor),
    ...{
      ...templateOptions,
      expressionPlugins,
    },
  })

  if (isTS) {
    scriptResult.content = transformTS(scriptResult.content)
  }

  return {
    template: templateResult,
    script: scriptResult,
  }
}
