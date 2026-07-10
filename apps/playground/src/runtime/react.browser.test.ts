import { renderComponent } from '@velin-dev/core-react/render-browser'
import { describe, expect, it } from 'vitest'

import { componentFromReactSource } from './react'

describe('componentFromReactSource', () => {
  it('loads a TSX default export and renders it in the browser', async () => {
    const { component } = await componentFromReactSource<{ name: string }>(`
      export default function Prompt({ name }: { name: string }) {
        return <section><h1>Hello {name}</h1></section>
      }
    `)

    await expect(renderComponent(component, { name: 'React' })).resolves.toBe('# Hello React\n')
  })

  it('supports common named React imports used by prompt components', async () => {
    const { component } = await componentFromReactSource<{ name: string }>(`
      import { useMemo, useState } from 'react'

      export default function Prompt({ name }: { name: string }) {
        const [prefix] = useState('Hello')
        const upperName = useMemo(() => name.toUpperCase(), [name])
        return <p>{prefix} {upperName}</p>
      }
    `)

    await expect(renderComponent(component, { name: 'runtime' })).resolves.toBe('Hello RUNTIME\n')
  })

  it('exposes optional prompt props metadata', async () => {
    const { promptProps } = await componentFromReactSource(`
      export const promptProps = [
        { key: 'name', title: 'name', type: 'string', value: 'React' },
      ]

      export default function Prompt({ name }: { name: string }) {
        return <p>{name}</p>
      }
    `)

    expect(promptProps).toEqual([
      { key: 'name', title: 'name', type: 'string', value: 'React' },
    ])
  })

  it('rejects unsupported static imports before evaluating the module', async () => {
    await expect(componentFromReactSource(`
      import value from 'not-supported'

      export default function Prompt() {
        return <p>{value}</p>
      }
    `)).rejects.toThrow('[src/App.tsx] evaluate: unsupported import "not-supported"')
  })
})
