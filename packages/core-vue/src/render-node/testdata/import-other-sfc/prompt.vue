<script setup lang="ts">
import Session from './prompt-sections/session.vue'
import SystemAdditional from './prompt-sections/system-additional.vue'

defineProps<{
  sessionDate?: Date
  userId: string
}>()
</script>

<template>
  <section>
    <h1>Agent Prompt</h1>
    <Session :session-date="sessionDate" :user-id="userId" />
    <SystemAdditional />
  </section>
</template>
