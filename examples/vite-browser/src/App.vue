<script setup lang="ts">
import { usePrompt } from '@velin-dev/vue'
import { onMounted, ref } from 'vue'

// import markdown from './assets/Markdown.velin.md'
import Prompt from './assets/Prompt.velin.vue'

const promptVariable = ref('')
const promptResult = ref('')
const ready = ref(false)

onMounted(() => {
  const { prompt, onPrompted } = usePrompt(Prompt, { language: promptVariable })
  onPrompted(() => {
    ready.value = true
    promptResult.value = prompt.value
  })
})
</script>

<template>
  <main>
    <input v-model="promptVariable">
    <div class="content">
      {{ promptResult }} {{ ready }}
    </div>
  </main>
</template>

<style scoped>
.content {
  white-space: pre-wrap;
  font-family: monospace;
}
</style>
