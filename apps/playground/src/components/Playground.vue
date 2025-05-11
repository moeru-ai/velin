<script
  setup
  lang="ts"
  generic="
    RawProps = any,
    RawPropsComponent = DefineComponent<RawProps, any, any, any, any, any>
  "
>
import type { DefineComponent } from 'vue'
import type { Component } from '../types'

import { resolveProps } from '@velin-dev/core/render-shared'
import { usePrompt } from '@velin-dev/vue'
import { useDark } from '@vueuse/core'
import { Pane, Splitpanes } from 'splitpanes'
import { computed, provide, reactive, ref, toRefs, watch } from 'vue'

import { injectKeyProps } from '../types/vue-repl'
import Editor from './Editor/index.vue'
import { useStore } from './Editor/store'
import Input from './Input.vue'
import Switch from './Switch.vue'

const props = defineProps<{
  prompt: RawPropsComponent
}>()

const renderedPrompt = ref<string>('')
const resolvedProps = computed<Component[]>(() => {
  return resolveProps(props.prompt as any).map((v) => {
    return {
      ...v,
      title: v.key,
      value: v.type === 'number'
        ? 0
        : v.type === 'boolean'
          ? false
          : '',
    } as Component
  })
})

const isDark = useDark()
const replTheme = computed(() => {
  return isDark.value ? 'dark' : 'light'
})

const store = useStore()
store.init()

provide(injectKeyProps, {
  ...toRefs(props),
  // @ts-expect-error - TODO: fix this
  store: ref(store),
  theme: replTheme,
  editorOptions: ref({}),
  autoSave: true,
})

// Create a reactive state object to store form values
const formValues = reactive<Record<string, any>>({})

// Initialize form values when resolvedProps changes
watch(resolvedProps, (props) => {
  props.forEach((component) => {
    if (!(component.title in formValues)) {
      formValues[component.title] = component.value
    }
  })
}, { immediate: true })

// Update the prompt when form values change
watch([resolvedProps, formValues], () => {
  const { prompt, onPrompted } = usePrompt(
    props.prompt as DefineComponent<any, any, any, any, any, any>,
    formValues,
  )

  onPrompted(() => {
    renderedPrompt.value = prompt.value
  })
}, {
  immediate: true,
  deep: true,
})
</script>

<template>
  <div class="font-sans" flex gap-4 w-full>
    <Splitpanes>
      <Pane :size="25" :min-size="25">
        <Editor filename="src/App.vue" />
      </Pane>
      <Pane :size="75" :min-size="25">
        <div px-4 py-3 bg="white dark:neutral-900" rounded-lg>
          <!-- <h2 class="text-xl font-semibold opacity-50">
            Prompt
          </h2> -->
          <div class="whitespace-pre-wrap">
            {{ renderedPrompt }}
          </div>
        </div>
      </Pane>
      <Pane :size="25" :min-size="25">
        <div flex flex-col gap-3 px-4 py-3 bg="neutral-50 dark:neutral-800" rounded-lg>
          <h2 class="text-xl font-semibold opacity-20">
            Props
          </h2>
          <div v-for="component in resolvedProps" :key="component.key" class="grid grid-cols-2 gap-2 items-center">
            <div font-mono opacity-70>
              {{ component.key }}
            </div>
            <template v-if="component.type === 'string' || component.type === 'unknown'">
              <Input
                type="text"
                :model-value="formValues[component.title]"
                @update:model-value="(val) => { formValues[component.title] = val }"
              />
            </template>
            <template v-if="component.type === 'boolean'">
              <div flex justify-end>
                <Switch
                  :model-value="formValues[component.title]"
                  @update:model-value="(val) => { formValues[component.title] = val }"
                />
              </div>
            </template>
            <template v-if="component.type === 'number'">
              <Input
                type="number"
                :model-value="String(formValues[component.title])"
                @update:model-value="(val) => { formValues[component.title] = Number(val) }"
              />
            </template>
          </div>
        </div>
      </Pane>
    </Splitpanes>
  </div>
</template>
