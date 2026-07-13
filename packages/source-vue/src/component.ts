import type { VirtualFileResolver } from '@velin-dev/source-shared'
import type { DefineComponent } from 'vue'

import { errorMessageFrom, isError } from '@moeru/std/error'
import { evaluate } from '@unrteljs/eval/node'
import {
  createVirtualFileResolver,
  linkVirtualModules,
  normalizeVirtualPath,
} from '@velin-dev/source-shared'
import { transformTS } from '@velin-dev/utils/transformers/typescript'
import { compileScript, parse } from '@vue/compiler-sfc'

export interface VueComponentFromSourceOptions {
  filename?: string
  vfs?: Record<string, string> | Map<string, string>
}

const defaultFilename = 'src/Prompt.vue'
const vueVirtualExtensions = ['.vue', '.ts', '.tsx', '.js', '.jsx'] as const

export async function componentFromSource<Props = Record<string, unknown>>(
  source: string,
  options: VueComponentFromSourceOptions = {},
): Promise<DefineComponent<Props>> {
  const filename = normalizeVirtualPath(options.filename ?? defaultFilename)
  const resolver = createVirtualFileResolver(options.vfs ?? {})
  resolver.add(filename, source)

  let code: string

  try {
    code = await linkVirtualModules({
      entry: filename,
      extensions: vueVirtualExtensions,
      source,
      transformModule(moduleFilename, moduleSource, moduleResolver) {
        if (moduleFilename.endsWith('.vue')) {
          return compileVueSFC(moduleSource, moduleFilename, moduleResolver)
        }
        if (moduleFilename.endsWith('.ts') || moduleFilename.endsWith('.tsx')) {
          return transformTS(moduleSource, moduleFilename.endsWith('.tsx'))
        }
        return moduleSource
      },
      vfs: options.vfs,
    })
  }
  catch (error) {
    throw normalizeError(filename, 'transform', error)
  }

  try {
    const component = await evaluate<unknown>(code, { base: pathToEvaluationBase(filename) })
    return ensureComponent<Props>(component, filename)
  }
  catch (error) {
    throw normalizeError(filename, 'evaluate', error)
  }
}

async function compileVueSFC(
  source: string,
  filename: string,
  resolver: VirtualFileResolver,
): Promise<string> {
  const normalizedSource = source.includes('<template')
    ? source
    : `${source}\n<template><div /></template>`
  const { descriptor } = parse(normalizedSource, { filename })
  const script = compileScript(descriptor, {
    fs: createVueCompilerFs(resolver),
    id: `velin-${filename}`,
    inlineTemplate: true,
  })

  if (descriptor.script?.lang === 'ts' || descriptor.scriptSetup?.lang === 'ts') {
    return transformTS(script.content)
  }

  return script.content
}

function createVueCompilerFs(resolver: VirtualFileResolver) {
  return {
    fileExists(file: string): boolean {
      return resolver.hasExact(file)
    },
    readFile(file: string): string | undefined {
      return resolver.readExact(file)
    },
    realpath(file: string): string {
      return resolver.realpath(file)
    },
  }
}

function ensureComponent<Props>(value: unknown, filename: string): DefineComponent<Props> {
  if (!value || (typeof value !== 'object' && typeof value !== 'function')) {
    throw new TypeError(`[${filename}] evaluate: default export must be a Vue component`)
  }

  return value as DefineComponent<Props>
}

function normalizeError(filename: string, stage: 'transform' | 'evaluate', error: unknown): Error {
  const message = errorMessageFrom(error) ?? String(error)
  const prefix = `[${filename}] ${stage}:`
  const cause = isError(error) ? error : undefined

  if (message.startsWith(prefix)) {
    return cause ?? new Error(message)
  }

  return cause
    ? new Error(`${prefix} ${message}`, { cause })
    : new Error(`${prefix} ${message}`)
}

function pathToEvaluationBase(filename: string): string {
  return `file:///${normalizeVirtualPath(filename)}`
}
