<script setup lang="ts">
import { onMounted, ref, type DefineComponent, type ComponentPropsOptions, type ExtractPropTypes, watchEffect, type Reactive, type MaybeRef, isReactive, watch, isRef, type Ref, toRef } from 'vue'
import { renderToString } from 'vue/server-renderer'
import type { LooseRequired } from '@vue/shared'

// import markdown from './assets/Markdown.velin.md'
import Prompt from './assets/Prompt.velin.vue'

function usePrompt<
  RawProps,
  ComponentProps = ComponentPropsOptions<RawProps>,
  ResolvedProps = ComponentProps extends ComponentPropsOptions<RawProps>
  ? ExtractPropTypes<ComponentProps>
  : ComponentProps,
>(
  promptComponent: DefineComponent<ResolvedProps, {}, {}, {}, {}, {}, {}>,
  props:
    ResolvedProps |
    Reactive<ResolvedProps> |
    MaybeRef<ResolvedProps> |
    Record<string, Reactive<any>> |
    Record<string, MaybeRef<any>>
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
      expose: () => { }
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
      onPromptedCallbacks.value.forEach((cb) => cb())
    })
  }

  if (isReactive(props)) {
    watch(props as unknown as Reactive<ResolvedProps>, renderEffect)
  } else if (isRef(props)) {
    watch(props as unknown as Ref<ResolvedProps>, renderEffect)
  } else if (typeof props === 'object' && props !== null) {
    watch(Object.values(props).map((val) => {
      if (isReactive(val)) {
        return val
      } else if (isRef(val)) {
        return val
      } else {
        return toRef(val)
      }
    }), renderEffect)
  } else {
    watchEffect(renderEffect)
  }

  // immediate: true
  renderEffect()

  return {
    prompt,
    onPrompted,
  }
}

const promptVariable = ref('')
const promptResult = ref('')
const ready = ref(false)

onMounted(async () => {
  const { prompt, onPrompted } = await usePrompt(Prompt, { language: promptVariable })
  onPrompted(() => {
    ready.value = true
    promptResult.value = prompt.value
  })
})
</script>

<template>
  <main>
    <input v-model="promptVariable" />
    <div class="content">
      {{ promptResult }} {{ ready }}
    </div>
  </main>
</template>

<style scoped>
.content {
  white-space: pre-wrap;
  font-family: monospace;
}
</style>
