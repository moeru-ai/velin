<script setup lang="ts">
import { usePrompt } from '@velin-dev/vue'
import { ref } from 'vue'

// import Prompt from './assets/Markdown.velin.md'
import Prompt from './assets/Prompt.velin.vue'

const promptVariable = ref('')
const { prompt } = usePrompt(Prompt, { language: promptVariable })
</script>

<template>
  <main>
    <input v-model="promptVariable">
    <div class="content">
      {{ prompt }}
    </div>
  </main>
</template>

<style scoped>
.content {
  white-space: pre-wrap;
  font-family: monospace;
}
</style>
