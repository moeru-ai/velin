<script setup>
import { ref } from 'vue';

const count = ref(10);
const message = ref('Hello from Vue!');
</script>

<template>
  <div>
    <h1>{{ message }}</h1>
    <p>Count: {{ count }}</p>
    <div>
      121
    </div>

    <div v-if="count > 5">
      <p>count is greater than 5</p>
    </div>
    <div v-else>
      <p>count is less than or equal to 5</p>
    </div>
  </div>
</template>

