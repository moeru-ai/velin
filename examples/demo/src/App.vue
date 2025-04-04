<script setup lang="ts">
import { processMarkdown } from '@velin-dev/ml'
import { onMounted, ref } from 'vue'
import { markdown } from './Markdown'

// const result = computed(async () => await processMarkdown(markdown))
const result = ref('')

onMounted(async () => {
  result.value = await processMarkdown(markdown)
})
</script>

<template>
  <main>
    <code>
      {{ result }}
    </code>
  </main>
</template>
