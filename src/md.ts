import type { SFCDescriptor } from '@vue/compiler-sfc'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { compileTemplate, parse } from '@vue/compiler-sfc'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp } from 'vue'
import { generateComponentId, readSourceFile, resolveFilePath, validateFileExists } from './utils'

/**
 * Compiles a Markdown file with Vue components into an executable component
 * This preserves the original Markdown content while parsing Vue code
 */
export async function compileMarkdown(filePath: string) {
  // Read Markdown file content
  const source = readSourceFile(filePath)

  // Parse Markdown file as if it were a Vue SFC
  const { descriptor } = parse(source)

  // Process the Markdown content
  const templateContent = extractTemplateContent(source, descriptor)

  // Generate unique component ID
  const id = generateComponentId()

  // Compile template to render function
  const { ssrRender } = await compileTemplateToRenderFunction(templateContent, filePath, id)

  // Create component with SSR render function
  return { ssrRender }
}

/**
 * Extracts template content from source or descriptor
 */
function extractTemplateContent(source: string, descriptor: SFCDescriptor): string {
  if (descriptor.template) {
    return descriptor.template.content
  }

  // If no template tag, treat the markdown content as template
  // Replace custom v-if directives with proper Vue syntax
  const content = source.replace(/<v-if="([^"]+)">/g, '<div v-if="$1">')
  return content.replace(/<\/v-if>/g, '</div>')
}

/**
 * Compiles template content to SSR render function
 */
async function compileTemplateToRenderFunction(
  templateContent: string,
  filePath: string,
  id: string,
): Promise<{ ssrRender: (push: any) => void }> {
  // Compile template
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

  try {
    // Dynamically import compiled template code
    const { ssrRender } = await import(/* @vite-ignore */ `file://${templateFilePath}`)
    return { ssrRender }
  }
  finally {
    // Cleanup temp file
    if (fs.existsSync(templateFilePath)) {
      fs.unlinkSync(templateFilePath)
    }
  }
}

/**
 * Render Markdown to HTML string
 */
export async function renderMarkdown(filePath: string): Promise<string> {
  try {
    const absolutePath = resolveFilePath(filePath)
    validateFileExists(absolutePath)

    // Compile Markdown and get component
    const Component = await compileMarkdown(absolutePath)

    // Render to HTML
    return await renderToString(createSSRApp(Component))
  }
  catch (error) {
    console.error('Error in renderMarkdown:', error)
    throw error
  }
}
