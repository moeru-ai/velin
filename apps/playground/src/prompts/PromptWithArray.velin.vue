<script setup lang="ts">
defineProps<{
  text: string
  tags: string[]
  numbers: number[]
  items: Array<{ id: number, name: string }>
}>()
</script>

<template>
  <div>
    # Array Props Demo

    ## String prop
    Text: {{ text }}

    ## String array
    Tags:
    - {{ tags.join(', ') }}

    ## Number array
    Numbers: {{ numbers.join(', ') }}

    ## Object array
    Items:
    <div v-for="item in items" :key="item.id">
      - ID: {{ item.id }}, Name: {{ item.name }}
    </div>
  </div>
</template>
