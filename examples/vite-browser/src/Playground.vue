<script setup lang="ts">
import { usePrompt } from '@velin-dev/vue'
import { computed } from 'vue'

interface CompoText {
  type: 'text'
  value?: string
}

interface CompoBool {
  type: 'switch'
  value?: boolean
}

type Component = (CompoText | CompoBool) & {
  title: string
}

const props = defineProps<{
  promptComponent: Parameters<typeof usePrompt>[0]
}>()
const components = defineModel<Component[]>()
const componentsComputed = computed(() =>
  Object.fromEntries(components.value?.map(component => ([component.title, component.value])) ?? []),
)

const { prompt, onPrompted } = usePrompt(
  props.promptComponent,
  componentsComputed,
)

onPrompted(() => {
  // eslint-disable-next-line no-console
  console.log(prompt.value)
})
</script>

<template>
  <div>
    <div v-for="component in components" :key="component.title">
      <label>{{ component.title }}</label>
      <template v-if="component.type === 'text'">
        <input v-model="component.value" type="text">
      </template>
      <template v-if="component.type === 'switch'">
        <input v-model="component.value" type="checkbox">
      </template>
    </div>
  </div>

  <div>
    {{ prompt }}
  </div>
</template>
