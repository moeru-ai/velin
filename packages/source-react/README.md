# @velin-dev/source-react

React source tooling for Velin.

## Usage

```ts
import { renderComponent } from '@velin-dev/core-react'
import { componentFromSource } from '@velin-dev/source-react'

const Prompt = await componentFromSource<{ name: string }>(`
  export default function Prompt({ name }: { name: string }) {
    return <div>Hello {name}</div>
  }
`)

const markdown = await renderComponent(Prompt, { name: 'Velin' })
```

## API

```ts
type ReactSourceLoader = 'tsx' | 'jsx' | 'ts' | 'js'

interface ComponentFromSourceOptions {
  loader?: ReactSourceLoader
  jsxRuntime?: 'automatic' | 'classic'
  filename?: string
  vfs?: Record<string, string> | Map<string, string>
}

function componentFromSource<Props = Record<string, unknown>>(
  source: string,
  options?: ComponentFromSourceOptions,
): Promise<ComponentType<Props>>

function componentFromFile<Props = Record<string, unknown>>(
  filePath: string,
  options?: ComponentFromSourceOptions,
): Promise<ComponentType<Props>>
```

`loader` defaults to `tsx`, `jsxRuntime` defaults to `automatic`, and `filename`
defaults to `velin-source.tsx`. The filename is metadata used in transform and
error messages.

`componentFromSource` transforms TS/JSX with `sucrase`. When `vfs` is provided,
relative imports are resolved from the virtual file map and linked before
evaluation. `componentFromFile` still uses `esbuild` to bundle real files from
disk. Both APIs analyze ESM exports and imports with `mlly`, then evaluate the
transformed ESM with `@unrteljs/eval`.

These helpers are not a sandbox or security boundary and must only be used with
trusted source. Source must provide a callable default export, such as a function
or class React component.
