<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  date: string
}>()

const count = ref(0)
</script>

<template>
  <div>
    <h1>Count: {{ count }}</h1>
    <p>{{ props.date }}</p>
  </div>
</template>
