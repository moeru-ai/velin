import fs from 'node:fs'
import path from 'node:path'
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp } from 'vue'
import * as Vue from 'vue'

// Compile Single File Component to executable component
export async function compileSFC(filePath: string) {
  // Read SFC file content
  console.log(`Reading file from: ${filePath}`)
  const source = fs.readFileSync(filePath, 'utf-8')
  console.log(`File content:\n${source}`)

  // Parse SFC file
  const { descriptor } = parse(source)

  // Check for template tag
  if (!descriptor.template) {
    throw new Error(`${filePath} has no <template> tag.`)
  }

  // Generate unique ID for different parts
  const id = `vue-component-${Date.now()}`

  // Compile template to render function
  const templateResult = compileTemplate({
    source: descriptor.template.content,
    filename: filePath,
    id,
    ssr: true,
    compilerOptions: {
      runtimeModuleName: 'vue',
    },
  })

  // Store compiled template code in temp file
  const templateFilePath = path.resolve(process.cwd(), 'temp-template.js')
  fs.writeFileSync(templateFilePath, templateResult.code)

  // Dynamically import compiled template code
  const { ssrRender } = await import(/* @vite-ignore */ `file://${templateFilePath}`)

  // Parse script content
  let setupScript = ''
  if (descriptor.scriptSetup) {
    // Compile <script setup> content
    const scriptResult = compileScript(descriptor, {
      id,
      inlineTemplate: false,
    })
    setupScript = scriptResult.content
  }
  else if (descriptor.script) {
    setupScript = descriptor.script.content
  }

  // Extract imports and setup code
  // const setupFunction = new Function('Vue', `
  //   const { ref } = Vue;
  //   ${setupScript}
  //   return { setup() {
  //     ${descriptor.scriptSetup ? setupScript : ''}
  //     return { count, message };
  //   }};
  // `);

  // Create component with parsed setup and SSR render function
  const Component = {
    // ...setupFunction(Vue),
    Vue,
    ssrRender,
  }

  // Cleanup temp file
  fs.unlinkSync(templateFilePath)

  return Component
}

// Render SFC to HTML string
export async function renderSFC(filePath: string) {
  try {
    // Ensure absolute path
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(process.cwd(), filePath)

    console.log(`Rendering SFC from absolute path: ${absolutePath}`)

    if (!fs.existsSync(absolutePath)) {
      throw new Error(`File does not exist: ${absolutePath}`)
    }

    // Compile SFC and get component
    const Component = await compileSFC(absolutePath)

    // Create SSR app
    const app = createSSRApp(Component)

    // Render to HTML
    const html = await renderToString(app)
    return html
  }
  catch (error) {
    console.error('Error in renderSFC:', error)
    throw error
  }
}
