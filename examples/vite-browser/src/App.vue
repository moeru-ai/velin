<script setup lang="ts">
import markdown from './assets/Markdown.velin.md'
</script>

<template>
  <main>
    <div class="content">
      {{ markdown() }}
    </div>
  </main>
</template>

<style scoped>
.content {
  white-space: pre-wrap;
  font-family: monospace;
}
</style>
