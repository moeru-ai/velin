<script setup lang="ts">
import { processMarkdown } from '@velin-dev/ml'
import { onMounted, ref } from 'vue'

import { markdown } from './assets/Markdown'
import { taskMarkdown } from './assets/TaskMarkdown'

// const result = computed(async () => await processMarkdown(markdown))
const result = ref('')
const taskResult = ref('')

onMounted(async () => {
  result.value = await processMarkdown(markdown)
  taskResult.value = await processMarkdown(taskMarkdown)

  // eslint-disable-next-line no-console
  console.log(result.value)
  // eslint-disable-next-line no-console
  console.log(taskResult.value)
})
</script>

<template>
  <main class="main">
    <code>
      {{ result }}
    </code>

    <code>
      {{ taskResult }}
    </code>
  </main>
</template>

<style lang="css" scoped>
.main {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
