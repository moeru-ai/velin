import type {
  VirtualFileResolver,
  VirtualFilesInput,
} from './'

import { findExports, findStaticImports, parseStaticImport } from 'mlly'

import {
  createVirtualFileResolver,
  isRelativeSpecifier,
  normalizeVirtualPath,
} from './'

export interface LinkVirtualModulesOptions {
  entry: string
  extensions: readonly string[]
  source: string
  transformModule: (filename: string, source: string, resolver: VirtualFileResolver) => Promise<string> | string
  vfs?: VirtualFilesInput
}

interface ProcessedModule {
  code: string
}

type StaticImport = ReturnType<typeof findStaticImports>[number]
type ExternalImports = Map<string, Map<string, string>>

const modulesKey = '__velin_modules__'
const moduleKey = '__velin_module__'

export async function linkVirtualModules(options: LinkVirtualModulesOptions): Promise<string> {
  const resolver = createVirtualFileResolver(options.vfs)
  const entry = normalizeVirtualPath(options.entry)
  resolver.add(entry, options.source)

  const seen = new Set<string>()
  const processed: string[] = []
  const externalImports: ExternalImports = new Map()

  await processModule(entry, options, resolver, seen, processed, externalImports)

  return [
    ...externalImportStatements(externalImports),
    `const ${modulesKey} = Object.create(null)`,
    ...processed,
    `export default ${modulesKey}[${JSON.stringify(entry)}].default`,
  ].join('\n')
}

async function processModule(
  filename: string,
  options: LinkVirtualModulesOptions,
  resolver: VirtualFileResolver,
  seen: Set<string>,
  processed: string[],
  externalImports: ExternalImports,
): Promise<void> {
  if (seen.has(filename)) {
    return
  }
  seen.add(filename)

  const source = resolver.readExact(filename)
  if (source == null) {
    throw new Error(`File "${filename}" does not exist.`)
  }

  const transformed = await options.transformModule(filename, source, resolver)
  const childModules = resolveInternalImports(transformed, filename, resolver, options.extensions)

  for (const childModule of childModules.values()) {
    await processModule(childModule, options, resolver, seen, processed, externalImports)
  }

  const module = transformModuleToFactory(transformed, filename, childModules, externalImports)
  processed.push(module.code)
}

function resolveInternalImports(
  code: string,
  filename: string,
  resolver: VirtualFileResolver,
  extensions: readonly string[],
): Map<string, string> {
  const imports = new Map<string, string>()

  for (const staticImport of findStaticImports(code)) {
    if (!isRelativeSpecifier(staticImport.specifier)) {
      continue
    }

    const resolved = resolver.resolve(staticImport.specifier, filename, extensions)
    if (!resolved) {
      throw new Error(`File "${staticImport.specifier}" imported by "${filename}" does not exist.`)
    }

    imports.set(staticImport.specifier, resolved)
  }

  return imports
}

function transformModuleToFactory(
  code: string,
  filename: string,
  internalImports: Map<string, string>,
  externalImports: ExternalImports,
): ProcessedModule {
  let transformed = code
  const exportStatements: string[] = []

  for (const staticImport of [...findStaticImports(transformed)].reverse()) {
    if (!isRelativeSpecifier(staticImport.specifier)) {
      const replacement = externalImportReplacement(staticImport, externalImports)
      transformed = replaceRange(transformed, staticImport.start, staticImport.end, replacement)
      continue
    }

    const resolved = internalImports.get(staticImport.specifier)
    if (!resolved) {
      throw new Error(`File "${staticImport.specifier}" imported by "${filename}" does not exist.`)
    }

    const replacement = importReplacement(staticImport, `${modulesKey}[${JSON.stringify(resolved)}]`)
    transformed = replaceRange(transformed, staticImport.start, staticImport.end, replacement)
  }

  for (const exported of [...findExports(transformed)].reverse()) {
    const replacement = exportReplacement(transformed, exported, exportStatements)
    if (!replacement) {
      continue
    }

    transformed = replaceRange(transformed, exported.start, exported.end, replacement)
  }

  return {
    code: [
      `${modulesKey}[${JSON.stringify(filename)}] = (() => {`,
      `const ${moduleKey} = { [Symbol.toStringTag]: "Module" }`,
      transformed,
      ...exportStatements.reverse(),
      `return ${moduleKey}`,
      '})()',
    ].join('\n'),
  }
}

function importReplacement(staticImport: StaticImport, moduleAccess: string): string {
  const parsed = parseStaticImport(staticImport)
  const lines: string[] = []

  if (parsed.defaultImport) {
    lines.push(`const ${parsed.defaultImport} = ${moduleAccess}.default`)
  }
  if (parsed.namespacedImport) {
    lines.push(`const ${parsed.namespacedImport} = ${moduleAccess}`)
  }
  if (parsed.namedImports) {
    for (const [imported, local] of Object.entries(parsed.namedImports)) {
      lines.push(`const ${local} = ${moduleAccess}.${imported}`)
    }
  }

  return lines.length > 0 ? `${lines.join('\n')}\n` : ''
}

function externalImportReplacement(
  staticImport: StaticImport,
  externalImports: ExternalImports,
): string {
  const parsed = parseStaticImport(staticImport)
  const imports = externalImportsFor(staticImport.specifier, externalImports)
  const lines: string[] = []

  if (parsed.defaultImport) {
    lines.push(`const ${parsed.defaultImport} = ${externalAlias(staticImport.specifier, 'default', imports)}`)
  }
  if (parsed.namespacedImport) {
    lines.push(`const ${parsed.namespacedImport} = ${externalAlias(staticImport.specifier, 'default', imports)}`)
  }
  if (parsed.namedImports) {
    for (const [imported, local] of Object.entries(parsed.namedImports)) {
      lines.push(`const ${local} = ${externalAlias(staticImport.specifier, imported, imports)}`)
    }
  }

  return lines.length > 0 ? `${lines.join('\n')}\n` : ''
}

function externalImportsFor(specifier: string, externalImports: ExternalImports): Map<string, string> {
  let imports = externalImports.get(specifier)
  if (!imports) {
    imports = new Map()
    externalImports.set(specifier, imports)
  }

  return imports
}

function externalAlias(specifier: string, imported: string, imports: Map<string, string>): string {
  let alias = imports.get(imported)
  if (!alias) {
    alias = `__velin_external_${imports.size}_${safeIdentifierPart(specifier)}_${safeIdentifierPart(imported)}`
    imports.set(imported, alias)
  }

  return alias
}

function externalImportStatements(externalImports: ExternalImports): string[] {
  return [...externalImports].map(([specifier, imports]) => {
    const specifiers = [...imports].map(([imported, alias]) => `${imported} as ${alias}`)
    return `import { ${specifiers.join(', ')} } from ${JSON.stringify(specifier)}`
  })
}

function safeIdentifierPart(value: string): string {
  return value.replace(/\W/g, '_')
}

function exportReplacement(
  code: string,
  exported: ReturnType<typeof findExports>[number],
  exportStatements: string[],
): string | undefined {
  const statement = code.slice(exported.start, exported.end)

  if (exported.name === 'default') {
    return replaceDefaultExport(statement, exportStatements)
  }

  const exportedNames = getExportedNames(exported)
  if (exportedNames.length > 0) {
    return replaceNamedExport(statement, exportedNames, exportStatements)
  }
}

function replaceDefaultExport(statement: string, exportStatements: string[]): string {
  const namedDefault = statement.match(/^export\s+default\s+(async\s+)?function\s+([\w$]+)/)
  if (namedDefault) {
    exportStatements.push(`${moduleKey}.default = ${namedDefault[2]}`)
    return statement.replace(/^export\s+default\s+/, '')
  }

  const namedClassDefault = statement.match(/^export\s+default\s+class\s+([\w$]+)/)
  if (namedClassDefault) {
    exportStatements.push(`${moduleKey}.default = ${namedClassDefault[1]}`)
    return statement.replace(/^export\s+default\s+/, '')
  }

  return `${moduleKey}.default = ${statement.replace(/^export\s+default\s+/, '')}`
}

function replaceNamedExport(
  statement: string,
  exports: string[],
  exportStatements: string[],
): string {
  if (/^export\s+(?:async\s+)?function\s+/.test(statement)) {
    const name = exports[0]
    const exportedName = name
    exportStatements.push(`${moduleKey}.${exportedName} = ${name}`)
    return statement.replace(/^export\s+/, '')
  }

  if (/^export\s+class\s+/.test(statement)) {
    const name = exports[0]
    const exportedName = name
    exportStatements.push(`${moduleKey}.${exportedName} = ${name}`)
    return statement.replace(/^export\s+/, '')
  }

  if (/^export\s+(?:const|let|var)\s+/.test(statement)) {
    for (const name of exports) {
      exportStatements.push(`${moduleKey}.${name} = ${name}`)
    }
    return statement.replace(/^export\s+/, '')
  }

  if (statement.startsWith('export {')) {
    for (const item of exports) {
      const [local, exported = local] = item.split(/\s+as\s+/).map(part => part.trim())
      exportStatements.push(`${moduleKey}.${exported} = ${local}`)
    }
    return ''
  }

  return statement
}

function getExportedNames(exported: ReturnType<typeof findExports>[number]): string[] {
  if ('exports' in exported && typeof exported.exports === 'string') {
    return exported.exports.split(',').map(item => item.trim()).filter(Boolean)
  }
  if ('names' in exported && Array.isArray(exported.names)) {
    return exported.names
  }
  if (typeof exported.name === 'string') {
    return [exported.name]
  }

  return []
}

function replaceRange(source: string, start: number, end: number, replacement: string): string {
  return `${source.slice(0, start)}${replacement}${source.slice(end)}`
}
