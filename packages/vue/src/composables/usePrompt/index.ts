import type { LooseRequired } from '@vue/shared'
import type { ComponentPropsOptions, DefineComponent, ExtractPropTypes, MaybeRef, Reactive, Ref } from 'vue'

import { isReactive, isRef, ref, toRef, watch, watchEffect } from 'vue'
import { renderToString } from 'vue/server-renderer'

export function usePrompt<
  RawProps,
  ComponentProps = ComponentPropsOptions<RawProps>,
  ResolvedProps = ComponentProps extends ComponentPropsOptions<RawProps>
    ? ExtractPropTypes<ComponentProps>
    : ComponentProps,
>(
  // eslint-disable-next-line ts/no-empty-object-type
  promptComponent: DefineComponent<ResolvedProps, {}, {}, {}, {}, {}, {}>,
  props:
    ResolvedProps |
    Reactive<ResolvedProps> |
    MaybeRef<ResolvedProps> |
    Record<string, Reactive<any>> |
    Record<string, MaybeRef<any>>,
) {
  const setupData = promptComponent.setup?.(
    props as unknown as LooseRequired<Readonly<
      ResolvedProps extends ComponentPropsOptions<Record<string, unknown>>
        ? ExtractPropTypes<ResolvedProps>
        : ResolvedProps
    > & {}>,
    {
      attrs: {},
      slots: {},
      emit: () => { },
      expose: () => { },
    },
  )

  const prompt = ref('')
  const onPromptedCallbacks = ref<(() => Promise<void> | void)[]>([])

  function onPrompted(cb: () => Promise<void> | void) {
    onPromptedCallbacks.value.push(cb)
  }

  function renderEffect() {
    const renderResult = promptComponent.render?.(setupData, setupData, [], setupData, setupData)

    renderToString(renderResult).then((result) => {
      prompt.value = result
      onPromptedCallbacks.value.forEach(cb => cb())
    })
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
    watchEffect(renderEffect)
  }

  // immediate: true
  renderEffect()

  return {
    prompt,
    onPrompted,
  }
}
