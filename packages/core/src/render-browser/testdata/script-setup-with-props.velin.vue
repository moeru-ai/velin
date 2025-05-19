<script setup>
import { ref } from 'vue'

defineProps({
  date: String,
})

const count = ref(0)
</script>

<template>
  <div>
    <h1>Count: {{ count }}</h1>
  </div>
</template>
