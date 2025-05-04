<script setup lang="ts">
import { ref } from 'vue'

import Prompt from './assets/Prompt.velin.vue'
import Playground from './Playground.vue'

const state = ref([
  {
    title: 'language',
    type: 'text',
  },
])
</script>

<template>
  <main>
    <Playground
      v-model="state"
      :prompt-component="Prompt"
    />
  </main>
</template>

<style scoped>
.content {
  white-space: pre-wrap;
  font-family: monospace;
}
</style>
