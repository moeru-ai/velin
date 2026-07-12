export type VirtualFilesInput = Map<string, string> | Record<string, string>
export { linkVirtualModules } from './bundle-link'
export type { LinkVirtualModulesOptions } from './bundle-link'

export interface VirtualFileResolver {
  files: Map<string, string>
  add: (filename: string, source: string) => void
  hasExact: (filename: string) => boolean
  readExact: (filename: string) => string | undefined
  realpath: (filename: string) => string
  resolve: (specifier: string, importer: string, extensions: readonly string[]) => string | undefined
}

export function createVirtualFileResolver(vfs: VirtualFilesInput = {}): VirtualFileResolver {
  const files = normalizeVirtualFiles(vfs)

  return {
    files,
    add(filename, source) {
      files.set(normalizeVirtualPath(filename), source)
    },
    hasExact(filename) {
      return files.has(normalizeVirtualPath(filename))
    },
    readExact(filename) {
      return files.get(normalizeVirtualPath(filename))
    },
    realpath(filename) {
      return normalizeVirtualPath(filename)
    },
    resolve(specifier, importer, extensions) {
      return resolveVirtualPath(specifier, importer, files, extensions)
    },
  }
}

export function normalizeVirtualFiles(vfs: VirtualFilesInput): Map<string, string> {
  return new Map(
    vfs instanceof Map
      ? [...vfs.entries()].map(([key, value]) => [normalizeVirtualPath(key), value])
      : Object.entries(vfs).map(([key, value]) => [normalizeVirtualPath(key), value]),
  )
}

export function normalizeVirtualPath(filename: string): string {
  return filename.replaceAll('\\', '/').replace(/^\/+/, '')
}

export function isRelativeSpecifier(specifier: string): boolean {
  return specifier.startsWith('./') || specifier.startsWith('../')
}

export function resolveVirtualPath(
  specifier: string,
  importer: string,
  files: Map<string, string>,
  extensions: readonly string[],
): string | undefined {
  const base = isRelativeSpecifier(specifier)
    ? joinVirtualPath(dirnameVirtualPath(importer), specifier)
    : specifier
  const normalized = normalizeVirtualPath(base)

  for (const candidate of candidatesFor(normalized, extensions)) {
    if (files.has(candidate)) {
      return candidate
    }
  }
}

function candidatesFor(filename: string, extensions: readonly string[]): string[] {
  if (extnameVirtualPath(filename)) {
    return [filename]
  }

  return [
    filename,
    ...extensions.map(extension => `${filename}${extension}`),
  ]
}

function dirnameVirtualPath(filename: string): string {
  const normalized = normalizeVirtualPath(filename)
  const index = normalized.lastIndexOf('/')

  return index === -1 ? '' : normalized.slice(0, index)
}

function extnameVirtualPath(filename: string): string {
  const basename = normalizeVirtualPath(filename).split('/').pop() ?? ''
  const index = basename.lastIndexOf('.')

  return index > 0 ? basename.slice(index) : ''
}

function joinVirtualPath(...segments: string[]): string {
  const parts: string[] = []

  for (const segment of segments.join('/').split('/')) {
    if (!segment || segment === '.') {
      continue
    }
    if (segment === '..') {
      parts.pop()
      continue
    }
    parts.push(segment)
  }

  return parts.join('/')
}
