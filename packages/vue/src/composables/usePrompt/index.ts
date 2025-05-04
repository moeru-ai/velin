import type {
  RenderComponentInputComponent,
  RenderComponentInputProps,
  ResolveRenderComponentInputProps,
} from '@velin-dev/core/render'
import type { ComponentPropsOptions, Reactive, Ref } from 'vue'

import { renderComponent } from '@velin-dev/core/render'
import { isReactive, isRef, ref, toRef, watch } from '@vue/reactivity'

export function usePrompt<
  RawProps = any,
  ComponentProps = ComponentPropsOptions<RawProps>,
  ResolvedProps = ResolveRenderComponentInputProps<RawProps, ComponentProps>,
>(
  promptComponent: RenderComponentInputComponent<ResolvedProps>,
  props: RenderComponentInputProps<ResolvedProps>,
) {
  const prompt = ref('')

  const onPromptedCallbacks = ref<(() => Promise<void> | void)[]>([])
  const onUnPromptedCallbacks = ref<(() => Promise<void> | void)[]>([])

  function onPrompted(cb: () => Promise<void> | void) {
    onPromptedCallbacks.value.push(cb)
  }

  function onUnprompted(cb: () => Promise<void> | void) {
    onUnPromptedCallbacks.value.push(cb)
  }

  function renderEffect() {
    renderComponent(promptComponent, props).then((md) => {
      prompt.value = md
      onPromptedCallbacks.value.forEach(cb => cb())
    })
  }

  function dispose() {
    onUnPromptedCallbacks.value.forEach(cb => cb())
  }

  if (isReactive(props)) {
    watch(props as unknown as Reactive<ResolvedProps>, renderEffect)
  }
  else if (isRef(props)) {
    watch(props as unknown as Ref<ResolvedProps>, renderEffect)
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
    watch(renderEffect)
  }

  // immediate: true
  renderEffect()

  return {
    prompt,
    dispose,
    onPrompted,
    onUnprompted,
  }
}
