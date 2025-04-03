import type { Component } from 'vue'
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc'
import { renderToString } from '@vue/server-renderer'
import { createApp, createSSRApp, h } from 'vue'
import { evaluateAnyModule } from './import'

/**
 * Compiles a Vue Single File Component into an executable component
 */
export async function compileSFC(source: string, ssr: boolean = true): Promise<Component> {
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

  try {
    // For SSR, we need ssrRender function
    const templateModule = await evaluateAnyModule<{
      ssrRender?: (ctx: any, push: any, parent: any, attrs: any) => void
      render?: (ctx: any, cache: any, props: any, setup: any, data: any) => any
    }>(templateResult.code)

    const component = await evaluateAnyModule<{
      setup: (ctx: any, options: any) => Promise<any>
    }>(scriptResult.content)

    // Create component instance
    const instance = {}
    if (component?.setup) {
      const setupResult = await component.setup({}, { expose: () => {} })
      Object.assign(instance, setupResult)
    }

    return {
      ...(ssr ? { ssrRender: templateModule?.ssrRender } : { render: templateModule?.render }),
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
 * Render SFC to HTML string (server-side rendering)
 */
export async function renderSFC(source: string): Promise<string> {
  try {
    // Compile SFC and get component
    const component = await compileSFC(source, true)

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

/**
 * Mount SFC to a DOM element (client-side rendering)
 */
export async function mountSFC(source: string, container: Element | string): Promise<void> {
  try {
    // Compile SFC for client-side rendering
    const component = await compileSFC(source, false)

    // Create app instance
    const app = createApp({
      render: () => h(component),
    })

    // Mount to DOM element
    const targetElement = typeof container === 'string'
      ? document.querySelector(container)
      : container

    if (!targetElement) {
      throw new Error(`Target element ${container} not found`)
    }

    app.mount(targetElement)
  }
  catch (error) {
    console.error('Error in mount SFC:', error)
    throw error
  }
}
