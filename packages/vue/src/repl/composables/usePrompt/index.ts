import type {
  InputProps,
  ResolveRenderComponentInputProps,
} from '@velin-dev/core'
import type { ComponentProp } from '@velin-dev/core/render-shared'
import type { ComponentPropsOptions, MaybeRefOrGetter, Reactive, Ref } from 'vue'

import { render } from '@velin-dev/core/render-repl'
import { isReactive, isRef, ref, toRef, toValue, watch, watchEffect } from 'vue'

export function usePrompt<
  RawProps = any,
  _ComponentProps = ComponentPropsOptions<RawProps>,
  _ResolvedProps = ResolveRenderComponentInputProps<RawProps, _ComponentProps>,
>(
  promptComponent: MaybeRefOrGetter<string>,
  props: InputProps<Record<string, unknown>>,
) {
  const prompt = ref('')
  const promptProps = ref<ComponentProp[]>([])
  const rendering = ref(false)

  const onPromptedCallbacks = ref<(() => Promise<void> | void)[]>([])
  const onUnPromptedCallbacks = ref<(() => Promise<void> | void)[]>([])

  function onPrompted(cb: () => Promise<void> | void) {
    onPromptedCallbacks.value.push(cb)
  }

  function onUnprompted(cb: () => Promise<void> | void) {
    onUnPromptedCallbacks.value.push(cb)
  }

  async function _render() {
    return await render(toValue(promptComponent), props)
  }

  function renderEffect() {
    rendering.value = true

    _render()
      .then((renderedResults) => {
        prompt.value = renderedResults.rendered
        promptProps.value = renderedResults.props
        onPromptedCallbacks.value.forEach(cb => cb())
      })
      .finally(() => {
        rendering.value = false
      })
  }

  function dispose() {
    onUnPromptedCallbacks.value.forEach(cb => cb())
  }

  if (isRef(promptComponent)) {
    watch(promptComponent as unknown as Ref<string>, renderEffect)
  }
  else {
    watchEffect(renderEffect)
  }

  if (isReactive(props)) {
    watch(props as unknown as Reactive<InputProps<Record<string, unknown>>>, renderEffect)
  }
  else if (isRef(props)) {
    watch(props as unknown as Ref<InputProps<Record<string, unknown>>>, renderEffect)
  }
  else if (typeof props === 'object' && props !== null) {
    watch(Object.values(props).map((val) => {
      if (isReactive(val)) {
        return val
      }
      else if (isRef(val)) {
        return val
      }
      else {
        return toRef(val)
      }
    }), renderEffect)
  }
  else {
    watchEffect(renderEffect)
  }

  // immediate: true
  renderEffect()

  return {
    prompt,
    promptProps,
    rendering,
    dispose,
    onPrompted,
    onUnprompted,
  }
}
