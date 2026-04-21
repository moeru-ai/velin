<script setup>
import { ref } from 'vue'

const show = ref(true)
const items = ref(['a', 'b', 'c'])
</script>

<template>
  <div>
    <h1>Title</h1>
    <p v-if="show">visible</p>
    <ul>
      <li v-for="item in items" :key="item">{{ item }}</li>
    </ul>
  </div>
</template>
