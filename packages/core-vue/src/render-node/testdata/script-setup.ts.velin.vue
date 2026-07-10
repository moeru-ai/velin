<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <div>
    <h1>Count: {{ count }}</h1>
  </div>
</template>
