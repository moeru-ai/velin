<script setup lang="ts">
withDefaults(
  defineProps<{
    sessionDate?: Date
    userId: string
  }>(),
  {
    sessionDate: () => new Date(),
  },
)
</script>

<template>
  <p>Session for <code>{{ userId }}</code> on {{ sessionDate.toISOString() }}</p>
</template>
