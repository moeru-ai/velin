<script setup lang="ts">
import { SwitchRoot, SwitchThumb } from 'reka-ui'

const props = defineProps<{
  inverted?: boolean
}>()

const modelValue = defineModel<boolean>({ required: true })
</script>

<template>
  <SwitchRoot
    v-model="modelValue"
    transition="background duration-250 ease-in-out"
    outline="focus-within:none"
    flex="~" relative h-7 w="12.5" rounded-full
    shadow="sm focus-within:shadow-gray-800 focus-within:[0_0_0_1px] "
    :class="[
      props.inverted
        ? 'data-[state=checked]:bg-primary-400/80 data-[state=unchecked]:bg-[#242436] data-[state=checked]:dark:bg-primary-400 dark:data-[state=unchecked]:bg-gray-300'
        : 'data-[state=checked]:bg-primary-400 data-[state=unchecked]:bg-gray-300 data-[state=checked]:dark:bg-primary-400/80 dark:data-[state=unchecked]:bg-[#242436]',
      props.inverted
        ? 'border-[#242436] dark:border-gray-300 data-[state=checked]:border-primary-200 data-[state=unchecked]:border-[#242436] focus-within:border-gray-800'
        : 'border-gray-300 dark:border-[#242436] data-[state=checked]:border-primary-200 data-[state=unchecked]:border-gray-300 focus-within:border-gray-800',
    ]"
  >
    <SwitchThumb
      my-auto size-6
      flex items-center justify-center
      translate-x="0.5 data-[state=checked]:full"
      rounded-full bg-white text-xs shadow-xl
      transition="transform duration-250 ease-in-out"
      will-change-transform
    />
  </SwitchRoot>
</template>
