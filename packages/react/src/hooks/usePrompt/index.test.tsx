import type { ReactTestRenderer } from 'react-test-renderer'

import type { usePrompt as usePromptType } from './index'

import { useEffect } from 'react'
import { act, create } from 'react-test-renderer'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const renderComponentMock = vi.fn()

let usePrompt: typeof usePromptType

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

interface PromptProps {
  name: string
}

function Prompt({ name }: PromptProps) {
  return <div>{`Hello ${name}`}</div>
}

function Harness({ name }: PromptProps) {
  const { prompt, rendering } = usePrompt(Prompt, { name })

  return <pre>{rendering ? 'Rendering...' : prompt}</pre>
}

interface CallbackHarnessProps extends PromptProps {
  onPrompted?: () => Promise<void> | void
  onUnprompted?: () => Promise<void> | void
}

function CallbackHarness({ name, onPrompted, onUnprompted }: CallbackHarnessProps) {
  const {
    dispose,
    onPrompted: registerPrompted,
    onUnprompted: registerUnprompted,
    prompt,
    rendering,
  } = usePrompt(Prompt, { name })

  useEffect(() => {
    if (!onPrompted) {
      return
    }

    return registerPrompted(onPrompted)
  }, [onPrompted, registerPrompted])

  useEffect(() => {
    if (!onUnprompted) {
      return
    }

    return registerUnprompted(onUnprompted)
  }, [onUnprompted, registerUnprompted])

  return (
    <>
      <pre>{rendering ? 'Rendering...' : prompt}</pre>
      <button type="button" onClick={dispose}>Dispose</button>
    </>
  )
}

async function flushRender() {
  await new Promise(resolve => setTimeout(resolve, 0))
}

function deferred<T>() {
  let resolve: (value: T) => void
  let reject: (reason?: unknown) => void

  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })

  return {
    promise,
    resolve: resolve!,
    reject: reject!,
  }
}

describe('usePrompt', () => {
  beforeEach(async () => {
    vi.resetModules()
    renderComponentMock.mockReset()
    vi.doMock('@velin-dev/core-react', () => ({
      renderComponent: renderComponentMock,
    }))

    const promptModule = await import('./index')
    usePrompt = promptModule.usePrompt
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should render a React component prompt', async () => {
    renderComponentMock.mockResolvedValueOnce('Hello Velin\n')
    let renderer: ReactTestRenderer

    await act(async () => {
      renderer = create(<Harness name="Velin" />)
      await flushRender()
    })

    expect(renderer!.toJSON()).toMatchObject({
      children: ['Hello Velin\n'],
    })
    expect(renderComponentMock).toHaveBeenCalledWith(Prompt, { name: 'Velin' })
  })

  it('should update the prompt when props change', async () => {
    renderComponentMock
      .mockResolvedValueOnce('Hello Velin\n')
      .mockResolvedValueOnce('Hello React\n')
    let renderer: ReactTestRenderer

    await act(async () => {
      renderer = create(<Harness name="Velin" />)
      await flushRender()
    })

    await act(async () => {
      renderer.update(<Harness name="React" />)
      await flushRender()
    })

    expect(renderer!.toJSON()).toMatchObject({
      children: ['Hello React\n'],
    })
    expect(renderComponentMock).toHaveBeenLastCalledWith(Prompt, { name: 'React' })
  })

  it('should type-check required props', () => {
    function NoPropsPrompt() {
      return <div>Hello Velin</div>
    }

    function TypeCheckHarness() {
      void usePrompt(NoPropsPrompt)
      // @ts-expect-error required props must be provided
      void usePrompt(Prompt)
      void usePrompt(Prompt, { name: 'React' })

      return null
    }

    expect(TypeCheckHarness).toBeTypeOf('function')
  })

  it('should ignore stale success when an older render resolves after a newer render', async () => {
    const firstRender = deferred<string>()
    const secondRender = deferred<string>()
    renderComponentMock
      .mockReturnValueOnce(firstRender.promise)
      .mockReturnValueOnce(secondRender.promise)
    let renderer: ReactTestRenderer

    await act(async () => {
      renderer = create(<Harness name="Velin" />)
      await flushRender()
    })

    await act(async () => {
      renderer.update(<Harness name="React" />)
      await flushRender()
    })

    await act(async () => {
      secondRender.resolve('Hello React\n')
      await flushRender()
    })

    expect(renderer!.toJSON()).toMatchObject({
      children: ['Hello React\n'],
    })

    await act(async () => {
      firstRender.resolve('Hello Velin\n')
      await flushRender()
    })

    expect(renderer!.toJSON()).toMatchObject({
      children: ['Hello React\n'],
    })
  })

  it('should ignore stale rejection without logging or replacing the newer result', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const firstRender = deferred<string>()
    const secondRender = deferred<string>()
    renderComponentMock
      .mockReturnValueOnce(firstRender.promise)
      .mockReturnValueOnce(secondRender.promise)
    let renderer: ReactTestRenderer

    await act(async () => {
      renderer = create(<Harness name="Velin" />)
      await flushRender()
    })

    await act(async () => {
      renderer.update(<Harness name="React" />)
      await flushRender()
    })

    await act(async () => {
      firstRender.reject(new Error('Stale render failed'))
      await flushRender()
    })

    expect(consoleError).not.toHaveBeenCalledWith(
      'Failed to render prompt',
      expect.any(Error),
    )

    await act(async () => {
      secondRender.resolve('Hello React\n')
      await flushRender()
    })

    expect(renderer!.toJSON()).toMatchObject({
      children: ['Hello React\n'],
    })
  })

  it('should not let stale finally clear the current render state', async () => {
    const firstRender = deferred<string>()
    const secondRender = deferred<string>()
    renderComponentMock
      .mockReturnValueOnce(firstRender.promise)
      .mockReturnValueOnce(secondRender.promise)
    let renderer: ReactTestRenderer

    await act(async () => {
      renderer = create(<Harness name="Velin" />)
      await flushRender()
    })

    await act(async () => {
      renderer.update(<Harness name="React" />)
      await flushRender()
    })

    await act(async () => {
      firstRender.resolve('Hello Velin\n')
      await flushRender()
    })

    expect(renderer!.toJSON()).toMatchObject({
      children: ['Rendering...'],
    })

    await act(async () => {
      secondRender.resolve('Hello React\n')
      await flushRender()
    })

    expect(renderer!.toJSON()).toMatchObject({
      children: ['Hello React\n'],
    })
  })

  it('should handle current render failures without leaving rendering stuck', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    renderComponentMock.mockRejectedValueOnce(new Error('Failed to render prompt'))
    let renderer: ReactTestRenderer

    await act(async () => {
      renderer = create(<Harness name="Velin" />)
      await flushRender()
    })

    expect(consoleError).toHaveBeenCalledWith(
      'Failed to render prompt',
      expect.any(Error),
    )
    expect(renderer!.toJSON()).toMatchObject({
      children: null,
    })
  })

  it('should fire onPrompted once after render', async () => {
    renderComponentMock.mockResolvedValueOnce('Hello Velin\n')
    const onPrompted = vi.fn()

    await act(async () => {
      create(<CallbackHarness name="Velin" onPrompted={onPrompted} />)
      await flushRender()
    })

    expect(onPrompted).toHaveBeenCalledTimes(1)
  })

  it('should unsubscribe prompted callbacks when React effects clean up', async () => {
    renderComponentMock
      .mockResolvedValueOnce('Hello Velin\n')
      .mockResolvedValueOnce('Hello React\n')
      .mockResolvedValueOnce('Hello Vue\n')
    const stalePrompted = vi.fn()
    const currentPrompted = vi.fn()
    let renderer: ReactTestRenderer

    await act(async () => {
      renderer = create(<CallbackHarness name="Velin" onPrompted={stalePrompted} />)
      await flushRender()
    })

    await act(async () => {
      renderer.update(<CallbackHarness name="React" onPrompted={currentPrompted} />)
      await flushRender()
    })

    await act(async () => {
      renderer.update(<CallbackHarness name="Vue" onPrompted={currentPrompted} />)
      await flushRender()
    })

    expect(stalePrompted).toHaveBeenCalledTimes(1)
    expect(currentPrompted).toHaveBeenCalledTimes(2)
  })

  it('should isolate sync and async prompted callback failures', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const syncError = new Error('Sync prompted failed')
    const asyncError = new Error('Async prompted failed')
    renderComponentMock.mockResolvedValueOnce('Hello Velin\n')

    await act(async () => {
      create(
        <CallbackHarness
          name="Velin"
          onPrompted={() => {
            throw syncError
          }}
        />,
      )
      await flushRender()
    })

    renderComponentMock.mockResolvedValueOnce('Hello React\n')

    await act(async () => {
      create(
        <CallbackHarness
          name="React"
          onPrompted={async () => {
            throw asyncError
          }}
        />,
      )
      await flushRender()
    })

    expect(consoleError).toHaveBeenCalledWith('Prompt callback failed', syncError)
    expect(consoleError).toHaveBeenCalledWith('Prompt callback failed', asyncError)
    expect(consoleError).not.toHaveBeenCalledWith('Failed to render prompt', expect.any(Error))
  })

  it('should run onUnprompted on dispose and respect unsubscribe', async () => {
    renderComponentMock.mockResolvedValueOnce('Hello Velin\n')
    const staleUnprompted = vi.fn()
    const currentUnprompted = vi.fn()
    let renderer: ReactTestRenderer

    await act(async () => {
      renderer = create(<CallbackHarness name="Velin" onUnprompted={staleUnprompted} />)
      await flushRender()
    })

    await act(async () => {
      renderer.update(<CallbackHarness name="Velin" onUnprompted={currentUnprompted} />)
      await flushRender()
    })

    await act(async () => {
      renderer.root.findByType('button').props.onClick()
      await flushRender()
    })

    expect(staleUnprompted).not.toHaveBeenCalled()
    expect(currentUnprompted).toHaveBeenCalledTimes(1)
  })

  it('should isolate dispose callback failures', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const syncError = new Error('Sync dispose failed')
    const asyncError = new Error('Async dispose failed')
    renderComponentMock.mockResolvedValueOnce('Hello Velin\n')
    let renderer: ReactTestRenderer

    await act(async () => {
      renderer = create(
        <CallbackHarness
          name="Velin"
          onUnprompted={() => {
            throw syncError
          }}
        />,
      )
      await flushRender()
    })

    await act(async () => {
      renderer.root.findByType('button').props.onClick()
      await flushRender()
    })

    await act(async () => {
      renderer.update(
        <CallbackHarness
          name="Velin"
          onUnprompted={async () => {
            throw asyncError
          }}
        />,
      )
      await flushRender()
    })

    await act(async () => {
      renderer.root.findByType('button').props.onClick()
      await flushRender()
    })

    expect(consoleError).toHaveBeenCalledWith('Prompt callback failed', syncError)
    expect(consoleError).toHaveBeenCalledWith('Prompt callback failed', asyncError)
    expect(consoleError).not.toHaveBeenCalledWith('Failed to render prompt', expect.any(Error))
  })
})
