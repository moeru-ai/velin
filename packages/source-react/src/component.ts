import type { BuildResult } from 'esbuild'
import type { ComponentType } from 'react'
import type { TransformResult } from 'sucrase'

import { pathToFileURL } from 'node:url'

import { evaluate } from '@unrteljs/eval/node'
import {
  linkVirtualModules,
  normalizeVirtualPath,
} from '@velin-dev/source-shared'
import { build } from 'esbuild'
import { transform } from 'sucrase'

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
  vfs?: Record<string, string> | Map<string, string>
}

const defaultFilename = 'velin-source.tsx'
const reactVirtualExtensions = ['.tsx', '.ts', '.jsx', '.js'] as const
const transformsByLoader = {
  js: [],
  jsx: ['jsx'],
  ts: ['typescript'],
  tsx: ['typescript', 'jsx'],
} satisfies Record<ReactSourceLoader, Array<'jsx' | 'typescript'>>

export async function componentFromSource<Props = Record<string, unknown>>(
  source: string,
  options: ComponentFromSourceOptions = {},
): Promise<ComponentType<Props>> {
  const { filename, jsxRuntime, loader } = resolveOptions(options)

  let code: string

  try {
    const result = options.vfs
      ? await buildVirtualSource(source, { filename, jsxRuntime, loader, vfs: options.vfs })
      : transformReactSource(source, { filename, jsxRuntime, loader })

    code = normalizeDefaultExport(compiledCode(result))
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
    vfs: options.vfs ?? {},
  }
}

function buildVirtualSource(
  source: string,
  options: Required<ComponentFromSourceOptions>,
) {
  return linkVirtualModules({
    entry: normalizeVirtualPath(options.filename),
    extensions: reactVirtualExtensions,
    source,
    transformModule(filename, moduleSource) {
      return transformReactSource(moduleSource, {
        filename,
        jsxRuntime: options.jsxRuntime,
        loader: loaderFromFilename(filename, options.loader),
      }).code
    },
    vfs: options.vfs,
  })
}

function compiledCode(result: string | TransformResult | BuildResult): string {
  if (typeof result === 'string') {
    return result
  }
  if ('code' in result) {
    return result.code
  }

  return result.outputFiles?.[0]?.text ?? ''
}

function transformReactSource(
  source: string,
  options: Pick<Required<ComponentFromSourceOptions>, 'filename' | 'jsxRuntime' | 'loader'>,
) {
  return transform(source, {
    filePath: options.filename,
    jsxRuntime: options.jsxRuntime,
    production: options.jsxRuntime === 'automatic',
    transforms: transformsForLoader(options.loader),
  })
}

function transformsForLoader(loader: ReactSourceLoader): Array<'jsx' | 'typescript'> {
  return transformsByLoader[loader]
}

function loaderFromFilename(filename: string, fallback: ReactSourceLoader): ReactSourceLoader {
  const extension = filename.match(/\.[^./]+$/)?.[0]
  if (extension === '.js' || extension === '.jsx' || extension === '.ts' || extension === '.tsx') {
    return extension.slice(1) as ReactSourceLoader
  }

  return fallback
}
