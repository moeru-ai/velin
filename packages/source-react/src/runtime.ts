import { pathToFileURL } from 'node:url'

import { findExports, findStaticImports, parseStaticImport } from 'mlly'

export function normalizeDefaultExport(code: string): string {
  const defaultExport = findExports(code).find(exported => exported.name === 'default')
  const defaultExportAlias = getNamedDefaultExportAlias(defaultExport)

  if (!defaultExport || !defaultExportAlias) {
    return code
  }

  return `${code.slice(0, defaultExport.start)}export default ${defaultExportAlias}${code.slice(defaultExport.end)}`
}

export function assertDefaultExport(code: string, filename: string): void {
  if (!findExports(code).some(exported => exported.name === 'default')) {
    throw new TypeError(
      `[${filename}] evaluate: default export must be a React component function`,
    )
  }
}

export function assertSupportedStaticImports(code: string, filename: string): void {
  for (const staticImport of findStaticImports(code)) {
    const specifier = staticImport.specifier

    if (
      specifier === 'react'
      || specifier === 'react/jsx-runtime'
      || specifier.startsWith('node:')
    ) {
      continue
    }

    throw new Error(`[${filename}] evaluate: unsupported import "${specifier}"`)
  }
}

export function prepareClassicRuntime(code: string): string {
  const reactNamespaceImport = findStaticImports(code).find((staticImport) => {
    if (staticImport.specifier !== 'react') {
      return false
    }

    const parsedImport = parseStaticImport(staticImport)

    return parsedImport.defaultImport === 'React'
      || parsedImport.namespacedImport === 'React'
  })

  if (!reactNamespaceImport) {
    return `${classicRuntimeImport()}\n${code}`
  }

  const parsedImport = parseStaticImport(reactNamespaceImport)
  const replacement = classicRuntimeImport(parsedImport.namedImports ?? {})

  return `${code.slice(0, reactNamespaceImport.start)}${replacement}${code.slice(reactNamespaceImport.end)}`
}

export function toEvaluationBase(filename: string): string {
  try {
    return new URL(filename).href
  }
  catch {
    return pathToFileURL(filename).href
  }
}

function getNamedDefaultExportAlias(
  exported: ReturnType<typeof findExports>[number] | undefined,
): string | undefined {
  if (!exported || !('exports' in exported) || typeof exported.exports !== 'string') {
    return undefined
  }

  return exported.exports.match(/^\s*([\w$]+)\s+as\s+default\s*$/)?.[1]
}

function classicRuntimeImport(namedImports: Record<string, string> = {}): string {
  const importSpecifiers = ['createElement', 'Fragment']

  for (const [importedName, localName] of Object.entries(namedImports)) {
    if (
      importedName === localName
      && (importedName === 'createElement' || importedName === 'Fragment')
    ) {
      continue
    }

    if (importedName === localName) {
      importSpecifiers.push(importedName)
    }
    else {
      importSpecifiers.push(`${importedName} as ${localName}`)
    }
  }

  return `import { ${importSpecifiers.join(', ')} } from 'react'\nconst React = { createElement, Fragment };\n`
}
