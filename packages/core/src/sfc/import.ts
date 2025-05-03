// https://github.com/nolebase/obsidian-plugin-vue/blob/main/src/import.ts

import { $fetch } from 'ofetch'
import path from 'path-browserify-esm'

// https://github.com/unocss/unocss/blob/6d94efc56b0c966f25f46d8988b3fd30ebc189aa/packages/shared-docs/src/config.ts#L5
const AsyncFunction = Object.getPrototypeOf(async () => { }).constructor

// https://github.com/unocss/unocss/blob/6d94efc56b0c966f25f46d8988b3fd30ebc189aa/packages/shared-docs/src/config.ts#L7-L9
const CDN_BASE = 'https://esm.sh/'
const modulesCache = new Map<string, Promise<unknown> | unknown>()

// https://github.com/unocss/unocss/blob/6d94efc56b0c966f25f46d8988b3fd30ebc189aa/packages/shared-docs/src/config.ts#L26
// eslint-disable-next-line no-new-func
const nativeImport = new Function('a', 'return import(a);')

// https://github.com/unocss/unocss/blob/6d94efc56b0c966f25f46d8988b3fd30ebc189aa/packages/shared-docs/src/config.ts#L31-L33
async function fetchAndImportAnyModuleWithCDNCapabilities(name: string, basePath?: string) {
  if (name.endsWith('.json')) {
    const response = await $fetch(CDN_BASE + name, { responseType: 'json' })
    return { default: response }
  }

  // [FIXME]: vite
  const isLocalModule = name.startsWith('./') || name.startsWith('../')

  if (!isLocalModule) {
    try {
      return await nativeImport(name)
    }
    catch {
      // node --experimental-network-imports
      return await nativeImport(CDN_BASE + name)
    }
  }

  const resolvedPath = path.resolve(basePath || '', name)

  return nativeImport(`${resolvedPath}.ts`)
}

// https://github.com/unocss/unocss/blob/6d94efc56b0c966f25f46d8988b3fd30ebc189aa/packages/shared-docs/src/config.ts#L27-L37
// bypass vite interop
async function dynamicImportAnyModule(name: string, basePath?: string): Promise<any> {
  if (modulesCache.has(name))
    return modulesCache.get(name)

  try {
    const module = await fetchAndImportAnyModuleWithCDNCapabilities(name, basePath)

    if (module && module.__esModule) {
      const finalModule = module['module.exports'] || module
      modulesCache.set(name, finalModule)
      return finalModule
    }

    modulesCache.set(name, module)
    return module
  }
  catch (error) {
    console.error(`Failed to import module ${name} from CDN`, error)
  }
}

// https://github.com/unocss/unocss/blob/main/packages/shared-docs/src/config.ts
const importObjectRegex = /import\s*\{([\s\S]*?)\}\s*from\s*(['"])([\w@/.:-]+)\2/g
const importDefaultRegex = /import\s(.*?)\sfrom\s*(['"])([\w@/.:-]+)\2/g
const exportDefaultRegex = /export default /
const exportRegex = /export\s(.*?)\s/g
const importRegex = /\bimport\s*\(/g

// New regex to handle `as` to `:` transformation
const importAsRegex = /(\w+)\s+as\s+(\w+)/g

// https://github.com/unocss/unocss/blob/main/packages/shared-docs/src/config.ts
export async function evaluateAnyModule<T>(configCode: string, basePath?: string): Promise<T | undefined> {
  const transformedCode = configCode
    .replace(importObjectRegex, (_match, p1, _p2, p3) => {
      // Replace `as` with `:` within the destructuring assignment
      const transformedP1 = p1.replace(importAsRegex, '$1: $2')
      return `const {${transformedP1}} = await __import("${p3}");`
    })
    .replace(importDefaultRegex, 'const $1 = (await __import("$3")).default;')
    .replace(exportDefaultRegex, 'return ')
    .replace(importRegex, '__import(')
    .replace(exportRegex, 'return function ')

  const wrappedDynamicImport = new AsyncFunction('__import', transformedCode)
  return await wrappedDynamicImport(name => dynamicImportAnyModule(name, basePath))
}
