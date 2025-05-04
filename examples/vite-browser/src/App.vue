<script setup lang="ts">
import type { Component } from './types'

import { ref } from 'vue'

import Prompt from './assets/Prompt.velin.vue'
import Playground from './Playground.vue'

const state = ref<Component[]>([
  {
    title: 'language',
    type: 'text',
  },
  {
    title: 'theme',
    type: 'switch',
  },
])
</script>

<template>
  <main>
    <Playground v-model="state" :prompt="Prompt" />
  </main>
</template>

<style scoped>
.content {
  white-space: pre-wrap;
  font-family: monospace;
}
</style>
