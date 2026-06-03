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

`componentFromSource` and `componentFromFile` transform source with `esbuild`,
analyze ESM exports and imports with `mlly`, then evaluate the transformed ESM
with `@unrteljs/eval`. They are not a sandbox or security boundary and must only
be used with trusted source.

This first implementation evaluates a single source file. It supports static
imports for `react`, `react/jsx-runtime`, and `node:` builtins. Other static
imports are rejected before evaluation. Source must provide a callable default
export, such as a function or class React component.
