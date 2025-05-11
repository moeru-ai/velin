<script setup lang="ts">
import type { ComponentProp } from '@velin-dev/core/render-shared'

import { usePrompt } from '@velin-dev/vue/repl'
import { useDark } from '@vueuse/core'
import { Pane, Splitpanes } from 'splitpanes'
// eslint-disable-next-line import/order
import { computed, onMounted, provide, reactive, ref, toRefs, watch } from 'vue'

import vueRuntimeUrl from 'vue/dist/vue.esm-browser.js?url'
import vueRuntimeProdUrl from 'vue/dist/vue.esm-browser.prod.js?url'
// eslint-disable-next-line perfectionist/sort-imports
import vueServerRendererUrl from '@vue/server-renderer/dist/server-renderer.esm-browser.js?url'

import { injectKeyProps } from '../types/vue-repl'
import { useVueImportMap } from './Editor/import-map'
import Editor from './Editor/index.vue'
import { useStore } from './Editor/store'
import Input from './Input.vue'
import Switch from './Switch.vue'

const props = defineProps<{
  prompt: string
}>()

const inputPrompt = ref<string>(props.prompt)
const renderedPrompt = ref<string>('')
const resolvedProps = ref<ComponentProp[]>([])

// Create a reactive state object to store form values
const formValues = reactive<Record<string, any>>({})
const isPropsInitialized = ref(false)

const isDark = useDark()
const replTheme = computed(() => {
  return isDark.value ? 'dark' : 'light'
})

const { importMap, vueVersion } = useVueImportMap({
  runtimeDev: vueRuntimeUrl,
  runtimeProd: vueRuntimeProdUrl,
  serverRenderer: vueServerRendererUrl,
})

const store = useStore({
  builtinImportMap: importMap,
  vueVersion,
  sfcOptions: ref({
    script: {
      inlineTemplate: true,
      isProd: true,
      propsDestructure: true,
    },
    style: {
      isProd: true,
    },
    template: {
      isProd: true,
    },
  }),
})

store.init()

provide(injectKeyProps, {
  ...toRefs(props),
  // @ts-expect-error - TODO: fix this
  store: ref(store),
  theme: replTheme,
  editorOptions: ref({}),
  autoSave: ref(true),
})

// Initialize the prompt and props
function initializePrompt() {
  const { prompt, onPrompted, promptProps } = usePrompt(
    inputPrompt,
    formValues,
  )

  // Handle the initial props resolution and initialization
  onPrompted(() => {
    renderedPrompt.value = prompt.value
    resolvedProps.value = promptProps.value

    // Only initialize form values if they haven't been set yet
    if (!isPropsInitialized.value) {
      promptProps.value.forEach((prop) => {
        // Initialize only if not already defined
        if (!(prop.title in formValues)) {
          formValues[prop.title] = prop.value
        }
      })
      isPropsInitialized.value = true
    }
  })
}

// Handle updates to formValues after initial setup
watch(formValues, () => {
  if (isPropsInitialized.value) {
    // Only re-render when changes are made to formValues after initialization
    const { prompt, onPrompted } = usePrompt(
      inputPrompt,
      formValues,
    )

    onPrompted(() => {
      renderedPrompt.value = prompt.value
    })
  }
}, {
  deep: true,
})

// Initialize on component mount
onMounted(() => {
  initializePrompt()
})

// Re-initialize when prompt changes
watch(() => inputPrompt, () => {
  isPropsInitialized.value = false
  initializePrompt()
})

function handleEditorChange(updated: string) {
  inputPrompt.value = updated
}
</script>

<template>
  <div class="font-sans" flex gap-4 w-full>
    <Splitpanes>
      <Pane :size="40" :min-size="25">
        <Editor filename="src/App.vue" @change="handleEditorChange" />
      </Pane>
      <Pane :size="40" :min-size="25">
        <div mx-2 px-4 py-3 bg="white dark:neutral-900" rounded-lg>
          <!-- <h2 class="text-xl font-semibold opacity-50">
            Prompt
          </h2> -->
          <div class="whitespace-pre-wrap">
            {{ renderedPrompt }}
          </div>
        </div>
      </Pane>
      <Pane :size="20" :min-size="25">
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
