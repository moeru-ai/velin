import { renderComponent } from '@velin-dev/core-react'
import { describe, expect, it } from 'vitest'

import { componentFromSource } from './'

describe('componentFromSource', () => {
  it('loads a TSX default export component and renders it through core-react', async () => {
    const Prompt = await componentFromSource<{ name: string }>(`
      export default function Prompt({ name }: { name: string }) {
        return <div>{\`Hello \${name}\`}</div>
      }
    `)

    await expect(renderComponent(Prompt, { name: 'TSX' })).resolves.toBe('Hello TSX\n')
  })

  it('loads a JSX default export component and renders it through core-react', async () => {
    const Prompt = await componentFromSource<{ name: string }>(
      `
        export default function Prompt({ name }) {
          return <div>{\`Hello \${name}\`}</div>
        }
      `,
      { loader: 'jsx' },
    )

    await expect(renderComponent(Prompt, { name: 'JSX' })).resolves.toBe('Hello JSX\n')
  })

  it('defaults omitted loader to TSX', async () => {
    const Prompt = await componentFromSource(`
      type Props = { name: string }

      export default function Prompt({ name }: Props) {
        return <div>{name}</div>
      }
    `)

    await expect(renderComponent(Prompt, { name: 'Default TSX' })).resolves.toBe('Default TSX\n')
  })

  it('loads classic JSX runtime without an explicit React import', async () => {
    const Prompt = await componentFromSource(
      `
        export default function Prompt() {
          return <div>Classic runtime</div>
        }
      `,
      { jsxRuntime: 'classic' },
    )

    await expect(renderComponent(Prompt)).resolves.toBe('Classic runtime\n')
  })

  it('loads classic JSX runtime with a React namespace import', async () => {
    const Prompt = await componentFromSource(
      `
        import * as React from 'react'

        export default function Prompt() {
          return <div>Classic namespace runtime</div>
        }
      `,
      { jsxRuntime: 'classic' },
    )

    await expect(renderComponent(Prompt)).resolves.toBe('Classic namespace runtime\n')
  })

  it('evaluates transformed ESM imports through the module evaluator', async () => {
    const Prompt = await componentFromSource(`
      import { basename } from 'node:path'

      export default function Prompt() {
        return <div>{basename('/tmp/prompt.tsx')}</div>
      }
    `)

    await expect(renderComponent(Prompt)).resolves.toBe('prompt.tsx\n')
  })

  it('evaluates named React imports used by server-rendered components', async () => {
    const Prompt = await componentFromSource<{ name: string }>(`
      import { useCallback, useMemo, useState } from 'react'

      export default function Prompt({ name }: { name: string }) {
        const [prefix] = useState('Hello')
        const upperName = useMemo(() => name.toUpperCase(), [name])
        const format = useCallback((value: string) => \`\${prefix} \${value}\`, [prefix])

        return <div>{format(upperName)}</div>
      }
    `)

    await expect(renderComponent(Prompt, { name: 'react' })).resolves.toBe('Hello REACT\n')
  })

  it('loads a TSX source component with relative imports from a virtual file map', async () => {
    const Prompt = await componentFromSource<{ name: string }>(
      `
        import { Label } from './components/Label.tsx'

        export default function Prompt({ name }: { name: string }) {
          return (
            <section>
              <h1>Virtual prompt</h1>
              <p><Label value={name} /></p>
            </section>
          )
        }
      `,
      {
        filename: 'src/Prompt.tsx',
        vfs: {
          'src/components/Label.tsx': `
            export function Label({ value }: { value: string }) {
              return <strong>{value.toUpperCase()}</strong>
            }
          `,
        },
      },
    )

    await expect(renderComponent(Prompt, { name: 'vfs' })).resolves.toBe(
      '# Virtual prompt\n\n**VFS**\n',
    )
  })

  it('loads a TSX source component with hooks and helpers from a virtual file map', async () => {
    const Prompt = await componentFromSource<{ name: string }>(
      `
        import { useGreeting } from './hooks/useGreeting'

        export default function Prompt({ name }: { name: string }) {
          const greeting = useGreeting(name)

          return <p>{greeting}</p>
        }
      `,
      {
        filename: 'src/Prompt.tsx',
        vfs: {
          'src/hooks/useGreeting.ts': `
            import { useMemo } from 'react'
            import { formatName } from '../utils/format'

            export function useGreeting(name: string) {
              return useMemo(() => \`Hello \${formatName(name)}\`, [name])
            }
          `,
          'src/utils/format.js': `
            export function formatName(value) {
              return value.trim().toUpperCase()
            }
          `,
        },
      },
    )

    await expect(renderComponent(Prompt, { name: ' hook vfs ' })).resolves.toBe(
      'Hello HOOK VFS\n',
    )
  })

  it('throws a clear error when the default export is missing', async () => {
    await expect(componentFromSource('export const Prompt = () => <div />')).rejects.toThrow(
      '[velin-source.tsx] evaluate: default export must be a React component function',
    )
  })

  it('throws a transform error for syntax errors', async () => {
    await expect(componentFromSource('export default function Prompt(')).rejects.toThrow(
      '[velin-source.tsx] transform:',
    )
  })

  it('throws a clear error for unsupported loaders', async () => {
    await expect(
      componentFromSource('export default function Prompt() { return null }', {
        loader: 'css' as never,
      }),
    ).rejects.toThrow('[velin-source.tsx] options: unsupported loader "css"')
  })

  it('throws a clear error for unsupported static imports', async () => {
    await expect(
      componentFromSource(`
        import value from 'not-supported'

        export default function Prompt() {
          return <div>{value}</div>
        }
      `),
    ).rejects.toThrow('[velin-source.tsx] evaluate: unsupported import "not-supported"')
  })

  it('preserves render-time module errors from the loaded component', async () => {
    const Prompt = await componentFromSource(`
      export default function Prompt() {
        throw new Error('boom')
      }
    `)

    await expect(renderComponent(Prompt)).rejects.toThrow('boom')
  })
})
