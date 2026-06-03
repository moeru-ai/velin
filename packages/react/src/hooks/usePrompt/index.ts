import type { ComponentType } from 'react'

import { renderComponent } from '@velin-dev/core-react'
import { useCallback, useEffect, useRef, useState } from 'react'

type RenderComponentArgs<Props extends object> = Record<never, never> extends Props
  ? [props?: Props]
  : [props: Props]

type PromptCallback = () => Promise<void> | void
type Unsubscribe = () => void

export interface UsePromptReturn {
  prompt: string
  rendering: boolean
  dispose: () => void
  onPrompted: (cb: PromptCallback) => Unsubscribe
  onUnprompted: (cb: PromptCallback) => Unsubscribe
}

function arePropsEqual<Props extends object>(previous?: Props, next?: Props) {
  if (previous === next) {
    return true
  }

  if (previous === undefined || next === undefined) {
    return previous === next
  }

  const previousKeys = Object.keys(previous)
  const nextKeys = Object.keys(next)

  return previousKeys.length === nextKeys.length
    && previousKeys.every(key => Object.is(previous[key as keyof Props], next[key as keyof Props]))
}

function snapshotProps<Props extends object>(props?: Props) {
  return props === undefined ? undefined : { ...props }
}

function useShallowStableProps<Props extends object>(props?: Props) {
  const stableProps = useRef<Props | undefined>(snapshotProps(props))

  if (!arePropsEqual(stableProps.current, props)) {
    stableProps.current = snapshotProps(props)
  }

  return stableProps.current
}

function registerCallback(callbacks: PromptCallback[], cb: PromptCallback) {
  let subscribed = true
  callbacks.push(cb)

  return () => {
    if (!subscribed) {
      return
    }

    subscribed = false
    const index = callbacks.indexOf(cb)

    if (index >= 0) {
      callbacks.splice(index, 1)
    }
  }
}

function runPromptCallback(cb: PromptCallback) {
  try {
    const result = cb()

    if (result) {
      result.catch((error: unknown) => {
        console.error('Prompt callback failed', error)
      })
    }
  }
  catch (error) {
    console.error('Prompt callback failed', error)
  }
}

function runPromptCallbacks(callbacks: PromptCallback[]) {
  callbacks.slice().forEach(runPromptCallback)
}

export function usePrompt<Props extends object = Record<never, never>>(
  component: ComponentType<Props>,
  ...args: RenderComponentArgs<Props>
): UsePromptReturn {
  const props = args[0]
  const stableProps = useShallowStableProps(props)
  const [prompt, setPrompt] = useState('')
  const [rendering, setRendering] = useState(false)
  const renderId = useRef(0)
  const onPromptedCallbacks = useRef<PromptCallback[]>([])
  const onUnpromptedCallbacks = useRef<PromptCallback[]>([])

  const onPrompted = useCallback((cb: PromptCallback) => {
    return registerCallback(onPromptedCallbacks.current, cb)
  }, [])

  const onUnprompted = useCallback((cb: PromptCallback) => {
    return registerCallback(onUnpromptedCallbacks.current, cb)
  }, [])

  const dispose = useCallback(() => {
    runPromptCallbacks(onUnpromptedCallbacks.current)
  }, [])

  useEffect(() => {
    return () => {
      renderId.current += 1
    }
  }, [])

  useEffect(() => {
    const generation = renderId.current + 1
    let disposed = false
    renderId.current = generation
    setRendering(true)

    function isCurrentRender() {
      return !disposed && renderId.current === generation
    }

    renderComponent(component, ...(stableProps === undefined ? [] : [stableProps]) as RenderComponentArgs<Props>)
      .then((md) => {
        if (!isCurrentRender()) {
          return
        }

        setPrompt(md)
        runPromptCallbacks(onPromptedCallbacks.current)
      })
      .catch((error: unknown) => {
        if (!isCurrentRender()) {
          return
        }

        console.error('Failed to render prompt', error)
      })
      .finally(() => {
        if (isCurrentRender()) {
          setRendering(false)
        }
      })

    return () => {
      disposed = true
    }
  }, [component, stableProps])

  return {
    prompt,
    rendering,
    dispose,
    onPrompted,
    onUnprompted,
  }
}
