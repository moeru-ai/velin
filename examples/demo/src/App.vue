<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { processMarkdownToVDom } from '../../../src/markdown/parser'
import { markdown } from './Markdown'

// const result = computed(async () => await processMarkdownToVDom(markdown))
const result = ref('')

onMounted(async () => {
  result.value = await processMarkdownToVDom(markdown)
})
</script>

<template>
  <main>
    <code>
      {{ result }}
    </code>
  </main>
</template>
