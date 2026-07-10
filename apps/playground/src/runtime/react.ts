import type { ComponentProp } from '@velin-dev/core-vue/render-shared'
import type { ComponentType } from 'react'

import wasmURL from 'esbuild-wasm/esbuild.wasm?url'
import React, {
  Children,
  cloneElement,
  createContext,
  createElement,
  createRef,
  forwardRef,
  Fragment,
  isValidElement,
  lazy,
  memo,
  Profiler,
  startTransition,
  StrictMode,
  Suspense,
  use,
  useActionState,
  useCallback,
  useContext,
  useDebugValue,
  useDeferredValue,
  useEffect,
  useId,
  useImperativeHandle,
  useInsertionEffect,
  useLayoutEffect,
  useMemo,
  useOptimistic,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
  version,
} from 'react'

import { errorMessageFrom } from '@moeru/std/error'
import { initialize as initializeEsbuildWasm, transform } from 'esbuild-wasm'
import { jsx, Fragment as JsxFragment, jsxs } from 'react/jsx-runtime'

type ReactSourceLoader = 'tsx' | 'jsx' | 'ts' | 'js'

export interface ReactRuntimeModule<Props = Record<string, unknown>> {
  component: ComponentType<Props>
  promptProps: ComponentProp[]
}

export interface ReactRuntimeOptions {
  filename?: string
  loader?: ReactSourceLoader
}

const defaultFilename = 'src/App.tsx'
let esbuildReady: Promise<void> | undefined
let reactProxyUrl: string | undefined
let jsxRuntimeProxyUrl: string | undefined

export async function componentFromReactSource<Props = Record<string, unknown>>(
  source: string,
  options: ReactRuntimeOptions = {},
): Promise<ReactRuntimeModule<Props>> {
  const filename = options.filename ?? defaultFilename
  const loader = options.loader ?? loaderFromFilename(filename)

  await initializeEsbuild()
  ensureRuntimeGlobals()

  let code: string
  try {
    const result = await transform(source, {
      format: 'esm',
      jsx: 'automatic',
      loader,
      sourcefile: filename,
      target: 'es2022',
    })
    code = rewriteSupportedImports(result.code, filename)
  }
  catch (error) {
    throw stageError(filename, 'transform', error)
  }

  const moduleUrl = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }))

  try {
    const mod = await import(/* @vite-ignore */ moduleUrl)
    const component = mod.default

    if (typeof component !== 'function') {
      throw new TypeError(
        `[${filename}] evaluate: default export must be a React component function`,
      )
    }

    return {
      component: component as ComponentType<Props>,
      promptProps: normalizePromptProps(mod.promptProps),
    }
  }
  catch (error) {
    throw stageError(filename, 'evaluate', error)
  }
  finally {
    URL.revokeObjectURL(moduleUrl)
  }
}

function initializeEsbuild() {
  esbuildReady ??= initializeEsbuildWasm({
    wasmURL,
    worker: true,
  })

  return esbuildReady
}

function ensureRuntimeGlobals() {
  const globalObject = globalThis as typeof globalThis & {
    __velinPlaygroundReact?: typeof React
    __velinPlaygroundReactJsxRuntime?: {
      Fragment: typeof JsxFragment
      jsx: typeof jsx
      jsxs: typeof jsxs
    }
  }

  globalObject.__velinPlaygroundReact = {
    ...React,
    Children,
    cloneElement,
    createContext,
    createElement,
    createRef,
    Fragment,
    forwardRef,
    isValidElement,
    lazy,
    memo,
    Profiler,
    startTransition,
    StrictMode,
    Suspense,
    use,
    useActionState,
    useCallback,
    useContext,
    useDebugValue,
    useDeferredValue,
    useEffect,
    useId,
    useImperativeHandle,
    useInsertionEffect,
    useLayoutEffect,
    useMemo,
    useOptimistic,
    useReducer,
    useRef,
    useState,
    useSyncExternalStore,
    useTransition,
    version,
  }
  globalObject.__velinPlaygroundReactJsxRuntime = {
    Fragment: JsxFragment,
    jsx,
    jsxs,
  }
  reactProxyUrl ??= createRuntimeProxy(`
    const React = globalThis.__velinPlaygroundReact;
    export default React;
    export const Children = React.Children;
    export const Fragment = React.Fragment;
    export const Profiler = React.Profiler;
    export const StrictMode = React.StrictMode;
    export const Suspense = React.Suspense;
    export const cloneElement = React.cloneElement;
    export const createContext = React.createContext;
    export const createElement = React.createElement;
    export const createRef = React.createRef;
    export const forwardRef = React.forwardRef;
    export const isValidElement = React.isValidElement;
    export const lazy = React.lazy;
    export const memo = React.memo;
    export const startTransition = React.startTransition;
    export const use = React.use;
    export const useActionState = React.useActionState;
    export const useCallback = React.useCallback;
    export const useContext = React.useContext;
    export const useDebugValue = React.useDebugValue;
    export const useDeferredValue = React.useDeferredValue;
    export const useEffect = React.useEffect;
    export const useId = React.useId;
    export const useImperativeHandle = React.useImperativeHandle;
    export const useInsertionEffect = React.useInsertionEffect;
    export const useLayoutEffect = React.useLayoutEffect;
    export const useMemo = React.useMemo;
    export const useOptimistic = React.useOptimistic;
    export const useReducer = React.useReducer;
    export const useRef = React.useRef;
    export const useState = React.useState;
    export const useSyncExternalStore = React.useSyncExternalStore;
    export const useTransition = React.useTransition;
    export const version = React.version;
  `)
  jsxRuntimeProxyUrl ??= createRuntimeProxy(`
    const JsxRuntime = globalThis.__velinPlaygroundReactJsxRuntime;
    export const Fragment = JsxRuntime.Fragment;
    export const jsx = JsxRuntime.jsx;
    export const jsxs = JsxRuntime.jsxs;
  `)
}

function createRuntimeProxy(code: string) {
  return URL.createObjectURL(new Blob([code], { type: 'text/javascript' }))
}

function rewriteSupportedImports(code: string, filename: string) {
  return code.replace(
    /\bfrom\s*(['"])([^'"]+)\1/g,
    (statement, quote: string, specifier: string) => {
      if (specifier === 'react') {
        return `from ${quote}${reactProxyUrl}${quote}`
      }

      if (specifier === 'react/jsx-runtime') {
        return `from ${quote}${jsxRuntimeProxyUrl}${quote}`
      }

      throw new Error(`[${filename}] evaluate: unsupported import "${specifier}"`)
    },
  )
}

function normalizePromptProps(value: unknown): ComponentProp[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter(isComponentProp)
}

function isComponentProp(value: unknown): value is ComponentProp {
  if (!value || typeof value !== 'object') {
    return false
  }

  const prop = value as Partial<ComponentProp>

  return typeof prop.key === 'string'
    && typeof prop.title === 'string'
    && (
      prop.type === 'string'
      || prop.type === 'boolean'
      || prop.type === 'number'
      || prop.type === 'array'
      || prop.type === 'unknown'
    )
}

function loaderFromFilename(filename: string): ReactSourceLoader {
  if (filename.endsWith('.jsx')) {
    return 'jsx'
  }

  if (filename.endsWith('.ts')) {
    return 'ts'
  }

  if (filename.endsWith('.js')) {
    return 'js'
  }

  return 'tsx'
}

function stageError(filename: string, stage: 'transform' | 'evaluate', error: unknown): Error {
  if (error instanceof Error && error.message.startsWith(`[${filename}] ${stage}:`)) {
    return error
  }

  const message = errorMessageFrom(error) ?? String(error)
  return new Error(`[${filename}] ${stage}: ${message}`, {
    cause: error,
  })
}
