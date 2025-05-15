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
        ? 'bg-[#242436] dark:bg-gray-50 focus:bg-gray-900 dark:focus:bg-gray-50'
        : 'gray-50 dark:bg-[#242436] focus:white dark:focus:bg-gray-900',
      props.inverted
        ? 'focus:border-primary-400/50 dark:focus:border-primary-300 border-2 border-solid border-[#242436] dark:border-gray-300'
        : 'focus:border-primary-300 dark:focus:border-primary-400/50 border-2 border-solid border-gray-300 dark:border-[#242436]',
      props.inverted
        ? 'disabled:text-gray-600 dark:disabled:text-gray-400'
        : 'disabled:text-gray-400 dark:disabled:text-gray-600',
    ]"
  >
</template>
