<script setup>
import { useCounter } from '@vueuse/core'

defineProps({
  text: String,
  number: Number,
  check: Boolean,
})

const { count } = useCounter()
</script>

<template>
  <div>
    <div>{{ text }}</div>
    <div>{{ number }}</div>
    <div>{{ check }}</div>
    <div>Internal count: {{ count }}</div>
  </div>
</template>
