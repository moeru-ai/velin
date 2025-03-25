import type { Component } from 'vue'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp } from 'vue'
import { generateComponentId } from '../utils'

/**
 * Compiles a Vue Single File Component into an executable component
 */
export async function compileSFC(source: string): Promise<Component> {
  // Parse SFC file
  const { descriptor } = parse(source)

  // Check for template tag
  if (!descriptor.template) {
    throw new Error(`source has no <template> tag.`)
  }

  const templateResult = compileTemplate({
    source: descriptor.template.content,
    filename: 'temp.vue',
    id: generateComponentId(),
    ssr: true,
    compilerOptions: {
      runtimeModuleName: 'vue',
    },
  })

  const scriptResult = compileScript(descriptor, {
    id: generateComponentId(),
  })

  // Store compiled template code in temp file
  const templateFilePath = path.resolve(process.cwd(), 'temp-template.js')
  const scriptFilePath = path.resolve(process.cwd(), 'temp-script.js')

  fs.writeFileSync(templateFilePath, templateResult.code)
  fs.writeFileSync(scriptFilePath, scriptResult.content)

  try {
    // Dynamically import compiled template code
    // Import template and script modules
    const templateModule = await import(`file://${templateFilePath}`)
    const scriptModule = await import(`file://${scriptFilePath}`)

    // Extract render function from template module
    const { ssrRender } = templateModule

    // Get component definition from script module
    const component = scriptModule.default

    // Create component instance with setup function
    const instance = {}
    if (component && component.setup) {
      const setupResult = component.setup({}, { expose: () => {} })
      Object.assign(instance, setupResult)
    }

    // console.log(instance)

    return {
      ssrRender,
      // Pass the setup data to be used during rendering
      data: () => {
        return instance
      },
    }
  }
  finally {
    // Cleanup temp file
    if (fs.existsSync(templateFilePath)) {
      fs.unlinkSync(templateFilePath)
    }
    if (fs.existsSync(scriptFilePath)) {
      fs.unlinkSync(scriptFilePath)
    }
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
