<script
  setup
  lang="ts"
  generic="
    RawProps = any,
    RawPropsComponent = DefineComponent<RawProps, any, any, any, any, any>
  "
>
import type { DefineComponent } from 'vue'
import type { Component } from './types'

import { usePrompt } from '@velin-dev/vue'
import { computed } from 'vue'

const props = defineProps<{
  prompt: RawPropsComponent
}>()
const components = defineModel<Component[]>()
const componentsComputed = computed(() =>
  Object.fromEntries(components.value?.map(component => ([component.title, component.value])) ?? []),
)

const { prompt, onPrompted } = usePrompt(
  props.prompt as DefineComponent<any, any, any, any, any, any>,
  componentsComputed,
)

onPrompted(() => {
  // eslint-disable-next-line no-console
  console.log(prompt.value)
})
</script>

<template>
  <div class="p-6 max-w-4xl mx-auto font-sans">
    <div class="space-y-6 border border-gray-200 rounded-lg p-6 bg-gray-50 shadow-sm  transition-shadow duration-300">
      <h2 class="text-xl font-semibold text-gray-800 border-b pb-3 mb-4">
        Props
      </h2>
      <div
        v-for="component in components"
        :key="component.title"
        class="flex flex-col gap-2 transition-all duration-200 "
      >
        <label class="text-sm font-medium text-gray-700 capitalize">{{ component.title }}</label>
        <template v-if="component.type === 'text'">
          <input
            v-model="component.value"
            type="text"
            class="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
          >
        </template>
        <template v-if="component.type === 'switch'">
          <label class="inline-flex items-center cursor-pointer">
            <input
              v-model="component.value"
              type="checkbox"
              class="sr-only peer"
            >
            <div class="relative w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
          </label>
        </template>
      </div>
    </div>

    <div class="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 shadow-inner">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">
        Prompt
      </h2>
      <div class="bg-white p-4 rounded-md shadow-sm overflow-auto max-h-96 font-mono text-gray-700">
        {{ prompt }}
      </div>
    </div>
  </div>
</template>
