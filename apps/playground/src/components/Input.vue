<script setup lang="ts">
const props = defineProps<{
  type?: string
  inverted?: boolean
}>()

const modelValue = defineModel<string>({ required: true })
</script>

<template>
  <input
    v-model="modelValue"
    :type="props.type || 'text'"
    transition="all duration-200 ease-in-out"
    cursor="disabled:not-allowed"
    w-full rounded-lg px-2 py-1 text-nowrap text-sm outline-none
    shadow="sm"
    :class="[
      props.inverted
        ? 'bg-neutral-700 dark:bg-neutral-50 focus:bg-neutral-900 dark:focus:bg-neutral-50'
        : 'neutral-50 dark:bg-neutral-700 focus:white dark:focus:bg-neutral-900',
      props.inverted
        ? 'focus:border-primary-400/50 dark:focus:border-primary-300 border-2 border-solid border-neutral-600 dark:border-neutral-300'
        : 'focus:border-primary-300 dark:focus:border-primary-400/50 border-2 border-solid border-neutral-300 dark:border-neutral-600',
      props.inverted
        ? 'disabled:text-neutral-600 dark:disabled:text-neutral-400'
        : 'disabled:text-neutral-400 dark:disabled:text-neutral-600',
    ]"
  >
</template>
