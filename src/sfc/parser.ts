import type { Component } from 'vue'
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp } from 'vue'
import { evaluateAnyModule } from './import'

export async function compileSFCForRaw(source: string, ssr = true) {
  // Parse SFC file
  const { descriptor } = parse(source)

  // Check for template tag
  if (!descriptor.template) {
    throw new Error(`source has no <template> tag.`)
  }

  const templateResult = compileTemplate({
    source: descriptor.template.content,
    filename: 'temp.vue',
    id: `vue-component-${Date.now()}`,
    ssr,
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

export async function resolveDataFromScriptComponent(component: any) {
  // Create component instance
  const instance = {}
  if (component?.setup) {
    const setupResult = await component.setup({}, { expose: () => {} })
    Object.assign(instance, setupResult)
  }

  return instance
}

/**
 * Compiles a Vue Single File Component into an executable component
 */
export async function compileSFC(source: string): Promise<Component> {
  const { templateResult, scriptResult } = await compileSFCForRaw(source)

  try {
    const ssrRender = await evaluateAnyModule<{
      ssrRender: (ctx: any, push: any, parent: any, attrs: any) => void
    }>(templateResult.code)
    const component = await evaluateAnyModule<{
      setup: (ctx: any, options: any) => Promise<any>
    }>(scriptResult.content)

    const instance = await resolveDataFromScriptComponent(component)

    return {
      ssrRender,
      data: () => instance,
      ...component,
    }
  }
  catch (error) {
    console.error('Error in compile SFC:', error)
    throw error
  }
}

/**
 * Render SFC to HTML string
 */
export async function renderSFC(source: string): Promise<string> {
  try {
    // Compile SFC and get component
    const component = await compileSFC(source)

    // console.log(component)

    // Render to HTML
    return await renderToString(
      createSSRApp(component),
      {
        cssVars: [],
      },
    )
  }
  catch (error) {
    console.error('Error in render SFC:', error)
    throw error
  }
}
