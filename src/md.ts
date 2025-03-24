import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc'
import { renderToString } from '@vue/server-renderer'
import * as Vue from 'vue'
import { createSSRApp } from 'vue'

/**
 * Compiles a Markdown file with Vue components into an executable component
 * This preserves the original Markdown content while parsing Vue code
 */
export async function compileMarkdown(filePath: string) {
  // Read Markdown file content
  console.log(`Reading file from: ${filePath}`)
  const source = fs.readFileSync(filePath, 'utf-8')
  // console.log(`File content:\n${source}`);

  // Parse Markdown file as if it were a Vue SFC
  const { descriptor } = parse(source)

  console.log(descriptor)

  // Process the Markdown content, preserving it as is
  let templateContent = ''
  if (descriptor.template) {
    templateContent = descriptor.template.content
  }
  else {
    // If no template tag, treat the markdown content as template
    // Replace custom v-if directives with proper Vue syntax
    templateContent = source.replace(/<v-if="([^"]+)">/g, '<div v-if="$1">')
    templateContent = templateContent.replace(/<\/v-if>/g, '</div>')
  }

  // Generate unique ID for different parts
  const id = `vue-component-${Date.now()}`

  // Compile template to render function
  const templateResult = compileTemplate({
    source: templateContent,
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

  // Create component with parsed setup and SSR render function
  const Component = {
    Vue,
    ssrRender,
  }

  // Cleanup temp file
  fs.unlinkSync(templateFilePath)

  return Component
}

// Render Markdown to HTML string
export async function renderMarkdown(filePath: string) {
  try {
    // Ensure absolute path
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(process.cwd(), filePath)

    console.log(`Rendering Markdown from absolute path: ${absolutePath}`)

    if (!fs.existsSync(absolutePath)) {
      throw new Error(`File does not exist: ${absolutePath}`)
    }

    // Compile Markdown and get component
    const Component = await compileMarkdown(absolutePath)

    // Create SSR app
    const app = createSSRApp(Component)

    // Render to HTML
    const html = await renderToString(app)
    return html
  }
  catch (error) {
    console.error('Error in renderMarkdown:', error)
    throw error
  }
}
