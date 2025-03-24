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
