# @velin-dev/react

React bindings for Velin.

## Usage

```tsx
import { usePrompt } from '@velin-dev/react'
import { useEffect } from 'react'

function Prompt({ name }: { name: string }) {
  return <div>{`Hello ${name}`}</div>
}

function PromptPreview() {
  const { prompt, rendering, dispose, onPrompted, onUnprompted } = usePrompt(Prompt, {
    name: 'Velin',
  })

  useEffect(() => {
    const unsubscribePrompted = onPrompted(() => {
      console.log('Prompt rendered')
    })

    const unsubscribeUnprompted = onUnprompted(() => {
      console.log('Prompt disposed')
    })

    return () => {
      unsubscribePrompted()
      unsubscribeUnprompted()
    }
  }, [onPrompted, onUnprompted])

  return (
    <>
      <pre>{rendering ? 'Rendering...' : prompt}</pre>
      <button type="button" onClick={dispose}>Dispose</button>
    </>
  )
}
```
