<script setup lang="ts">
import type { ComponentProp } from '@velin-dev/core/render-shared'

import vueServerRendererUrl from '@vue/server-renderer/dist/server-renderer.esm-browser.js?url'
import vueRuntimeUrl from 'vue/dist/vue.esm-browser.js?url'
import vueRuntimeProdUrl from 'vue/dist/vue.esm-browser.prod.js?url'

import { fromMarkdown } from '@velin-dev/utils/from-md'
import { usePrompt } from '@velin-dev/vue/repl'
import { useDark } from '@vueuse/core'
import { Pane, Splitpanes } from 'splitpanes'
import { computed, onMounted, provide, reactive, ref, toRefs, watch } from 'vue'

import Editor from './Editor/index.vue'
import Input from './Input.vue'
import Switch from './Switch.vue'

import { injectKeyProps } from '../types/vue-repl'
import { useVueImportMap } from './Editor/import-map'
import { useStore } from './Editor/store'

const props = defineProps<{
  prompt: string
}>()

const initializing = ref(true)
const inputPrompt = ref<string>(props.prompt)
const renderedPrompt = ref<string>('')
const renderedPromptFromMarkdown = computed(() => fromMarkdown(renderedPrompt.value))

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
  return new Promise<void>((resolve) => {
    const { prompt, onPrompted, promptProps } = usePrompt(inputPrompt, formValues)

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

      resolve()
    })
  })
}

// Handle updates to formValues after initial setup
watch(formValues, () => {
  if (isPropsInitialized.value) {
    // Only re-render when changes are made to formValues after initialization
    const { prompt, onPrompted } = usePrompt(inputPrompt, formValues)

    onPrompted(() => {
      renderedPrompt.value = prompt.value
    })
  }
}, {
  deep: true,
})

// Initialize on component mount
onMounted(async () => {
  initializing.value = true
  await initializePrompt()
  initializing.value = false
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
      <Pane :size="60" :min-size="50">
        <div relative h-full>
          <div v-if="initializing" class="size-15" i-line-md:loading-loop absolute left="1/2" top="10" translate-x="-50%" />
          <template v-else>
            <Splitpanes>
              <Pane :size="60" :min-size="25">
                <div mx-2 px-4 py-3 bg="white dark:[#2e2e3b]" rounded-lg border="2 solid gray-100 dark:[#272733]" shadow-sm max-h-full overflow-y-scroll>
                  <div class="whitespace-pre-wrap prose prose-gray dark:prose-white max-w-full! flex flex-col gap-8" v-html="renderedPromptFromMarkdown" />
                </div>
              </Pane>
              <Pane :size="40" :min-size="25">
                <div flex flex-col gap-3 px-4 py-3 bg="indigo-100/20 dark:[#323242]" rounded-lg transition="all duration-500 ease-in-out">
                  <h2 class="text-xl font-semibold opacity-45">
                    Props
                  </h2>
                  <div v-for="component in resolvedProps" :key="component.key" class="grid grid-cols-2 gap-2 items-center">
                    <div font-mono opacity-90>
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
          </template>
        </div>
      </Pane>
    </Splitpanes>
  </div>
</template>
