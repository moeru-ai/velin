<script setup lang="ts">
import { useCounter } from '@vueuse/core'

import Promptv2 from './Promptv2.velin.vue'

defineProps<{
  language: string
}>()

const { count } = useCounter()
</script>

<template>
  <div>
    <div>{{ language }}</div>
    <div>{{ count }}</div>
    <Promptv2 />
  </div>
</template>
