import { mkdir, mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

import { renderComponent } from '@velin-dev/core-react'
import { describe, expect, it } from 'vitest'

import { componentFromFile } from './index'

describe('componentFromFile', () => {
  it('loads a TSX file and renders it through core-react', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'velin-source-react-'))
    const filePath = join(directory, 'prompt.tsx')
    await writeFile(
      filePath,
      `
        export default function Prompt() {
          return <div>File prompt</div>
        }
      `,
    )

    const Prompt = await componentFromFile(filePath)

    await expect(renderComponent(Prompt)).resolves.toBe('File prompt\n')
  })

  it('loads a TSX file with evaluator-supported imports', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'velin-source-react-'))
    const filePath = join(directory, 'prompt-with-import.tsx')
    await writeFile(
      filePath,
      `
        import { basename } from 'node:path'

        export default function Prompt() {
          return <div>{basename(${JSON.stringify(filePath)})}</div>
        }
      `,
    )

    const Prompt = await componentFromFile(filePath)

    await expect(renderComponent(Prompt)).resolves.toBe('prompt-with-import.tsx\n')
  })

  it('loads a TSX file that imports another TSX file through a relative path', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'velin-source-react-'))
    const componentsDirectory = join(directory, 'components')
    await mkdir(componentsDirectory)

    const labelPath = join(componentsDirectory, 'Label.tsx')
    await writeFile(
      labelPath,
      `
        export function Label({ value }: { value: string }) {
          return <strong>{value}</strong>
        }
      `,
    )

    const filePath = join(directory, 'prompt.tsx')
    await writeFile(
      filePath,
      `
        import { Label } from './components/Label.tsx'

        export default function Prompt() {
          return (
            <section>
              <h1>Imported prompt</h1>
              <p><Label value="Nested TSX" /></p>
            </section>
          )
        }
      `,
    )

    const Prompt = await componentFromFile(filePath)

    await expect(renderComponent(Prompt)).resolves.toBe('# Imported prompt\n\n**Nested TSX**\n')
  })

  it('includes the file URL in transform errors', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'velin-source-react-'))
    const filePath = join(directory, 'broken.tsx')
    await writeFile(filePath, 'export default function Prompt(')

    await expect(componentFromFile(filePath)).rejects.toThrow(pathToFileURL(filePath).href)
  })
})
