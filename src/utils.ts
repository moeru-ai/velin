import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

/**
 * Simple expression evaluator for handling variables in templates
 */
export function evaluateExpression(expression: string, data: Record<string, any>): any {
  try {
    // Handle simple property access
    if (/^[a-z_]\w*$/i.test(expression)) {
      return data[expression]
    }

    // For more complex expressions, use Function constructor
    // This has security implications in production environments
    const func = new Function(...Object.keys(data), `return ${expression};`)
    return func(...Object.values(data))
  }
  catch (error) {
    console.warn(`Error evaluating expression "${expression}":`, error)
    return undefined
  }
}

/**
 * Simple condition evaluator for v-if directives
 */
export function evaluateCondition(condition: string, data: Record<string, any>): boolean {
  try {
    const func = new Function(...Object.keys(data), `return Boolean(${condition});`)
    return func(...Object.values(data))
  }
  catch (error) {
    console.warn(`Error evaluating condition "${condition}":`, error)
    return false
  }
}

/**
 * Resolves relative file path to absolute
 */
export function resolveFilePath(filePath: string): string {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath)

  console.log(`Rendering Markdown from absolute path: ${absolutePath}`)
  return absolutePath
}

/**
 * Validates that file exists
 */
export function validateFileExists(filePath: string): void {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File does not exist: ${filePath}`)
  }
}

/**
 * Generates a unique component ID
 */
export function generateComponentId(): string {
  return `vue-component-${Date.now()}`
}


/**
 * Reads source file content
 */
export function readSourceFile(filePath: string): string {
  console.log(`Reading file from: ${filePath}`)
  return fs.readFileSync(filePath, 'utf-8')
}
