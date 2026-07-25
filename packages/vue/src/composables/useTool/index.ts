import type {
  DefineToolOptions,
  RenderComponentInputComponent,
  ResolveRenderComponentInputProps,
  VelinTool,
} from '@velin-dev/core-vue'
import type { ComponentPropsOptions, Ref } from 'vue'

import { defineTool } from '@velin-dev/core-vue'
import { ref } from 'vue'

export type UseToolReturn = VelinTool & {
  /**
   * Whether any call is currently rendering. Mirrors `usePrompt`'s `rendering`,
   * but stays true until the last concurrent call settles — a model may call
   * the same tool several times in one turn, and runners execute those in
   * parallel.
   */
  readonly pending: Ref<boolean>
}

/**
 * Exposes a prompt component as an LLM tool, tracking whether a call is in
 * flight so the UI can react to it.
 *
 * The returned value is the tool itself, so it can be handed to an SDK
 * directly. `pending` is attached non-enumerably: a `Ref` must never end up in
 * a serialized request body next to `name` and `parameters`.
 *
 * @example
 * ```ts
 * import GetWeather from './GetWeather.vue'
 *
 * const tool = useTool(GetWeather, { description: 'Get the weather for a city.' })
 * const result = await generateText({ ...options, messages, tools: [tool] })
 * ```
 */
export function useTool<
  RawProps = any,
  ComponentProps = ComponentPropsOptions<RawProps>,
  ResolvedProps = ResolveRenderComponentInputProps<RawProps, ComponentProps>,
>(
  component: RenderComponentInputComponent<ResolvedProps>,
  options?: DefineToolOptions,
): UseToolReturn {
  const tool = defineTool(component, options)
  const pending = ref(false)

  // Counted rather than a plain flag: parallel tool calls share this one tool
  // object, so the first call to settle must not report the rest as finished.
  let inFlight = 0

  const execute = tool.execute
  tool.execute = async (input, executeOptions) => {
    inFlight += 1
    pending.value = true
    try {
      return await execute(input, executeOptions)
    }
    finally {
      inFlight -= 1
      if (inFlight === 0)
        pending.value = false
    }
  }

  Object.defineProperty(tool, 'pending', { value: pending, enumerable: false })

  return tool as UseToolReturn
}
