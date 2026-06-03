import type { ComponentType } from 'react'

import { pathToFileURL } from 'node:url'

import { evaluate } from '@unrteljs/eval/node'
import { build, transform } from 'esbuild'

import {
  assertDefaultExport,
  assertSupportedStaticImports,
  normalizeDefaultExport,
  prepareClassicRuntime,
  toEvaluationBase,
} from './runtime'
import { stageError } from './utils'

export type ReactSourceLoader = 'tsx' | 'jsx' | 'ts' | 'js'
type ReactJsxRuntime = 'automatic' | 'classic'

export interface ComponentFromSourceOptions {
  loader?: ReactSourceLoader
  jsxRuntime?: ReactJsxRuntime
  filename?: string
}

const defaultFilename = 'velin-source.tsx'

export async function componentFromSource<Props = Record<string, unknown>>(
  source: string,
  options: ComponentFromSourceOptions = {},
): Promise<ComponentType<Props>> {
  const { filename, jsxRuntime, loader } = resolveOptions(options)

  let code: string

  try {
    const result = await transform(source, {
      format: 'esm',
      jsx: jsxRuntime === 'classic' ? 'transform' : 'automatic',
      loader,
      sourcefile: filename,
    })

    code = normalizeDefaultExport(result.code)
  }
  catch (error) {
    throw stageError(filename, 'transform', error)
  }

  try {
    assertDefaultExport(code, filename)
    assertSupportedStaticImports(code, filename)
    if (jsxRuntime === 'classic') {
      code = prepareClassicRuntime(code)
    }

    return assertComponent<Props>(
      await evaluate<unknown>(code, { base: toEvaluationBase(filename) }),
      filename,
    )
  }
  catch (error) {
    throw stageError(filename, 'evaluate', error)
  }
}

export async function componentFromFile<Props = Record<string, unknown>>(
  filePath: string,
  options: ComponentFromSourceOptions = {},
): Promise<ComponentType<Props>> {
  const filename = options.filename ?? pathToFileURL(filePath).href
  const { jsxRuntime, loader } = resolveOptions({
    ...options,
    filename,
  })

  let code: string

  try {
    const result = await build({
      bundle: true,
      entryPoints: [filePath],
      external: ['react', 'react/jsx-runtime', 'node:*'],
      format: 'esm',
      jsx: jsxRuntime === 'classic' ? 'transform' : 'automatic',
      loader: {
        '.js': loader,
        '.jsx': loader,
        '.ts': loader,
        '.tsx': loader,
      },
      logLevel: 'silent',
      platform: 'node',
      write: false,
    })

    code = normalizeDefaultExport(result.outputFiles[0].text)
  }
  catch (error) {
    throw stageError(filename, 'transform', error)
  }

  try {
    assertDefaultExport(code, filename)
    assertSupportedStaticImports(code, filename)
    if (jsxRuntime === 'classic') {
      code = prepareClassicRuntime(code)
    }

    return assertComponent<Props>(
      await evaluate<unknown>(code, { base: toEvaluationBase(filename) }),
      filename,
    )
  }
  catch (error) {
    throw stageError(filename, 'evaluate', error)
  }
}

function assertComponent<Props>(value: unknown, filename: string): ComponentType<Props> {
  if (typeof value !== 'function') {
    throw new TypeError(
      `[${filename}] evaluate: default export must be a React component function`,
    )
  }

  return value as ComponentType<Props>
}

function resolveOptions(options: ComponentFromSourceOptions): Required<ComponentFromSourceOptions> {
  const filename = options.filename ?? defaultFilename
  const loader = options.loader ?? 'tsx'
  const jsxRuntime = options.jsxRuntime ?? 'automatic'

  if (!(['tsx', 'jsx', 'ts', 'js'] as string[]).includes(loader)) {
    throw new Error(`[${filename}] options: unsupported loader "${loader}"`)
  }

  if (!(['automatic', 'classic'] as string[]).includes(jsxRuntime)) {
    throw new Error(`[${filename}] options: unsupported jsxRuntime "${jsxRuntime}"`)
  }

  return {
    filename,
    jsxRuntime,
    loader,
  }
}
