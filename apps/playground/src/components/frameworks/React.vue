<script setup lang="ts">
import Editor from '../Editor/index.vue'

defineProps<{
  filename: string
}>()

const emit = defineEmits<{
  (e: 'change', value: string): void
}>()
</script>

<template>
  <Editor :filename="filename" @change="emit('change', $event)" />
</template>
