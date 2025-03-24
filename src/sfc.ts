import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { compileTemplate, parse } from '@vue/compiler-sfc'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp } from 'vue'
import { generateComponentId, readSourceFile, resolveFilePath, validateFileExists } from './utils'

/**
 * Compiles a Vue Single File Component into an executable component
 */
export async function compileSFC(filePath: string) {
  // Read SFC file content
  const source = readSourceFile(filePath)

  // Parse SFC file
  const { descriptor } = parse(source)

  // Check for template tag
  if (!descriptor.template) {
    throw new Error(`${filePath} has no <template> tag.`)
  }

  // Generate unique component ID
  const id = generateComponentId()

  // Compile template to render function
  const { ssrRender } = await compileTemplateToRenderFunction(
    descriptor.template.content,
    filePath,
    id,
  )

  // Create component with SSR render function
  return { ssrRender }
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
 * Render SFC to HTML string
 */
export async function renderSFC(filePath: string): Promise<string> {
  try {
    // Ensure absolute path and validate file exists
    const absolutePath = resolveFilePath(filePath)
    validateFileExists(absolutePath)

    // Compile SFC and get component
    const Component = await compileSFC(absolutePath)

    // Render to HTML
    return await renderToString(createSSRApp(Component))
  }
  catch (error) {
    console.error('Error in renderSFC:', error)
    throw error
  }
}
