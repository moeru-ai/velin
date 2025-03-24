import fs from 'node:fs'
import { parse } from '@vue/compiler-sfc'
import { evaluateCondition, evaluateExpression } from './utils'

/**
 * Parses a Markdown file with Vue template syntax for use as a prompt
 * Preserves the Markdown content as raw text while allowing Vue reactivity
 */
export async function parseMarkdownPrompt(filePath: string): Promise<{
  content: string
  data: Record<string, any>
  render: (data?: Record<string, any>) => string
}> {
  // Read Markdown file content
  console.log(`Reading file from: ${filePath}`)
  const source = fs.readFileSync(filePath, 'utf-8')

  // Parse Markdown file as if it were a Vue SFC
  const { descriptor } = parse(source)

  // Extract reactive data from script
  const reactiveData: Record<string, any> = {}

  // Parse script content to extract variables
  if (descriptor.scriptSetup) {
    try {
      // For simplicity, parse variables directly using regex
      // This is a simplified approach - a proper implementation would need a more robust parser
      const scriptContent = descriptor.scriptSetup.content

      // Get variables with default values
      const varRegex = /const\s+(\w+)\s*=\s*ref\s*\(\s*(.+?)\s*\)\s*;/g
      let match

      while ((match = varRegex.exec(scriptContent)) !== null) {
        const varName = match[1]
        let varValue = match[2]

        // Handle string values
        if (/^['"].*['"]$/.test(varValue)) {
          // String value
          varValue = varValue.substring(1, varValue.length - 1)
        }
        // Handle boolean values
        else if (varValue === 'true') {
          varValue = true
        }
        else if (varValue === 'false') {
          varValue = false
        }
        // Handle numeric values
        else if (!isNaN(Number(varValue))) {
          varValue = Number(varValue)
        }

        reactiveData[varName] = varValue
      }
    }
    catch (error) {
      console.warn('Error parsing script variables:', error)
    }
  }
  else if (descriptor.script) {
    // Handle standard script tag if needed
    console.warn('Standard script tags not fully supported in markdown prompt templates')
  }

  // Process the Markdown content
  let content = source

  // Remove script tag and its content from the template
  content = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')

  // Create render function that replaces Vue template syntax with values
  const render = (data: Record<string, any> = {}) => {
    // Combine default data with provided data
    const mergedData = { ...reactiveData, ...data }

    // Replace template variables {{ var }} with their values
    let result = content

    // Handle v-if directives (simplified approach)
    result = result.replace(/<div v-if="([^"]+)">([\s\S]*?)<\/div>/g, (match, condition, content) => {
      const conditionResult = evaluateCondition(condition, mergedData)
      return conditionResult ? content : ''
    })

    // Replace template variables
    result = result.replace(/\{\{\s*([^}]+)\s*\}\}/g, (match, variable) => {
      const value = evaluateExpression(variable.trim(), mergedData)
      return value !== undefined ? String(value) : match
    })

    return result
  }

  return {
    content,
    data: reactiveData,
    render,
  }
}
