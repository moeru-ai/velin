import { parse } from '@vue/compiler-sfc'
import { evaluateCondition, evaluateExpression, readSourceFile, resolveFilePath, validateFileExists } from './utils'

/**
 * Parses a Markdown file with Vue template syntax for use as a prompt
 * Preserves the Markdown content as raw text while allowing Vue reactivity
 */
export async function parseMarkdownPrompt(filePath: string): Promise<{
  content: string
  data: Record<string, any>
  render: (data?: Record<string, any>) => string
}> {
  // Resolve and validate file path
  const absolutePath = resolveFilePath(filePath)
  validateFileExists(absolutePath)

  // Read Markdown file content
  const source = readSourceFile(absolutePath)

  // Parse Markdown file as if it were a Vue SFC
  const { descriptor } = parse(source)

  // Extract reactive data from script
  const reactiveData = extractReactiveData(descriptor)

  // Process the Markdown content
  let content = source

  // Remove script tag and its content from the template
  content = removeScriptTags(content)

  // Create render function that replaces Vue template syntax with values
  const render = createRenderFunction(content, reactiveData)

  return {
    content,
    data: reactiveData,
    render,
  }
}

/**
 * Extracts reactive data from script tags in the SFC descriptor
 */
function extractReactiveData(descriptor: any): Record<string, any> {
  const reactiveData: Record<string, any> = {}

  if (!descriptor.scriptSetup && !descriptor.script) {
    return reactiveData
  }

  if (descriptor.scriptSetup) {
    try {
      const scriptContent = descriptor.scriptSetup.content
      parseRefVariables(scriptContent, reactiveData)
    }
    catch (error) {
      console.warn('Error parsing script variables:', error)
    }
  }
  else if (descriptor.script) {
    // Handle standard script tag if needed
    console.warn('Standard script tags not fully supported in markdown prompt templates')
  }

  return reactiveData
}

/**
 * Parses ref variables from script content using regex
 */
function parseRefVariables(scriptContent: string, reactiveData: Record<string, any>): void {
  // Fixed regex to avoid backtracking issues
  const varRegex = /const\s+(\w+)\s*=\s*ref\s*\(\s*([^)]+)\s*\)\s*;/g

  let match: RegExpExecArray | null
  let safetyCounter = 0
  const MAX_ITERATIONS = 1000 // Safety limit

  while (safetyCounter < MAX_ITERATIONS) {
    match = varRegex.exec(scriptContent)
    if (match === null)
      break

    safetyCounter++
    const varName = match[1]
    const varValue = parseVariableValue(match[2])
    reactiveData[varName] = varValue
  }
}

/**
 * Parses a variable value from string to appropriate type
 */
function parseVariableValue(rawValue: string): any {
  // Handle string values
  if (/^['"].*['"]$/.test(rawValue)) {
    return rawValue.substring(1, rawValue.length - 1)
  }
  // Handle boolean values
  else if (rawValue === 'true') {
    return true
  }
  else if (rawValue === 'false') {
    return false
  }
  // Handle numeric values
  else if (!Number.isNaN(Number(rawValue))) {
    return Number(rawValue)
  }

  return rawValue
}

/**
 * Removes script tags from content
 */
function removeScriptTags(content: string): string {
  return content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
}

/**
 * Creates a render function that processes Vue template syntax
 */
function createRenderFunction(content: string, reactiveData: Record<string, any>) {
  return (data: Record<string, any> = {}) => {
    // Combine default data with provided data
    const mergedData = { ...reactiveData, ...data }

    // Replace template variables {{ var }} with their values
    let result = content

    // Handle v-if directives (simplified approach)
    result = processConditionals(result, mergedData)

    // Replace template variables
    result = processTemplateVariables(result, mergedData)

    return result
  }
}

/**
 * Processes v-if conditionals in the template
 */
function processConditionals(content: string, data: Record<string, any>): string {
  return content.replace(/<div v-if="([^"]+)">([\s\S]*?)<\/div>/g, (match, condition, content) => {
    const conditionResult = evaluateCondition(condition, data)
    return conditionResult ? content : ''
  })
}

/**
 * Processes template variables ({{ var }}) in the template
 */
function processTemplateVariables(content: string, data: Record<string, any>): string {
  // Fixed regex to avoid backtracking issues
  return content.replace(/\{\{([^}]+)\}\}/g, (match, variable) => {
    const value = evaluateExpression(variable.trim(), data)
    return value !== undefined ? String(value) : match
  })
}
