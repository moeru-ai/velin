<script setup lang="ts">
import type { PlaygroundRuntime } from './frameworks'

import vueRuntimeUrl from 'vue/dist/vue.esm-browser.js?url'
import vueRuntimeProdUrl from 'vue/dist/vue.esm-browser.prod.js?url'

import { SelectTab } from '@proj-airi/ui/components/form'
import { fromMarkdown } from '@velin-dev/utils/from-md'
import { useDark } from '@vueuse/core'
import { Pane, Splitpanes } from 'splitpanes'
import { computed, onMounted, provide, reactive, ref, toRefs, watch } from 'vue'

import Input from './Input.vue'
import Switch from './Switch.vue'

import { injectKeyProps } from '../types/vue-repl'
import { useVueImportMap } from './Editor/import-map'
import { useStore } from './Editor/store'
import { frameworkDefinitions, frameworkOptions } from './frameworks'
import { useFrameworkPromptRendering } from './frameworks/composables/rendering'

const props = defineProps<{
  prompt: string
}>()

const runtime = ref<PlaygroundRuntime>('vue')
const runtimeSources = reactive(
  Object.fromEntries(
    Object.entries(frameworkDefinitions).map(([key, definition]) => [
      key,
      key === 'vue' ? props.prompt : definition.source,
    ]),
  ) as Record<PlaygroundRuntime, string>,
)
const inputPrompt = ref<string>(runtimeSources.vue)

// Create a reactive state object to store form values
const formValues = reactive<Record<string, any>>({})

const isDark = useDark()
const replTheme = computed(() => {
  return isDark.value ? 'dark' : 'light'
})

const activeFramework = computed(() => frameworkDefinitions[runtime.value])
const activeFilename = computed(() => activeFramework.value.filename)
const {
  initializing,
  isApplyingResolvedProps,
  isPropsInitialized,
  renderedPrompt,
  renderError,
  renderPrompt,
  resetPropsInitialization,
  resolvedProps,
} = useFrameworkPromptRendering({
  activeFilename,
  activeFramework,
  formValues,
  inputPrompt,
})
const renderedPromptFromMarkdown = computed(() => fromMarkdown(renderedPrompt.value))

const { importMap, vueVersion } = useVueImportMap({
  runtimeDev: vueRuntimeUrl,
  runtimeProd: vueRuntimeProdUrl,
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

// @ts-expect-error - no type
provide(injectKeyProps, {
  ...toRefs(props),
  store: ref(store),
  theme: replTheme,
  editorOptions: ref({}),
  autoSave: ref(true),
})

// Handle updates to formValues after initial setup
watch(formValues, () => {
  if (isPropsInitialized.value && !isApplyingResolvedProps.value) {
    void renderPrompt(false)
  }
}, {
  deep: true,
})

// Initialize on component mount
onMounted(async () => {
  await store.setFiles(
    Object.fromEntries(
      Object.entries(frameworkDefinitions).map(([key, definition]) => [
        definition.filename,
        runtimeSources[key as PlaygroundRuntime],
      ]),
    ),
    activeFilename.value,
  )
  await renderPrompt(true)
})

watch(runtime, async (nextRuntime) => {
  inputPrompt.value = runtimeSources[nextRuntime]
  resetPropsInitialization()
  store.setActive(activeFilename.value)
  await renderPrompt(true)
})

function handleEditorChange(updated: string) {
  inputPrompt.value = updated
  runtimeSources[runtime.value] = updated
  const file = store.files[activeFilename.value]
  if (file) {
    file.code = updated
  }
  resetPropsInitialization()
  void renderPrompt(true)
}
</script>

<template>
  <div class="font-sans" flex gap-4 w-full>
    <Splitpanes>
      <Pane :size="40" :min-size="25">
        <div h-full flex flex-col gap-2>
          <div flex items-center gap-2>
            <SelectTab
              v-model="runtime"
              :options="frameworkOptions"
              size="sm"
            />
          </div>
          <component :is="activeFramework.component" :filename="activeFilename" @change="handleEditorChange" />
        </div>
      </Pane>
      <Pane :size="60" :min-size="50">
        <div relative h-full>
          <div v-if="initializing" class="size-15" i-line-md:loading-loop absolute left="1/2" top="10" translate-x="-50%" />
          <div v-else-if="renderError" mx-2 px-4 py-3 bg="red-50 dark:red-950/30" text="red-700 dark:red-200" rounded-lg border="1 solid red-200 dark:red-900" whitespace-pre-wrap font-mono text-sm>
            {{ renderError }}
          </div>
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
                        v-model="formValues[component.title]"
                        type="text"
                      />
                    </template>
                    <template v-if="component.type === 'boolean'">
                      <div flex justify-end>
                        <Switch
                          v-model="formValues[component.title]"
                        />
                      </div>
                    </template>
                    <template v-if="component.type === 'number'">
                      <Input
                        v-model.number="formValues[component.title]"
                        type="number"
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
