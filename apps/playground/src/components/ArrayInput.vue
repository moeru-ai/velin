<script setup lang="ts">
import { computed, ref } from 'vue'

const modelValue = defineModel<any[]>({ required: true })

// Track individual items as strings for editing
const items = ref<string[]>(
  Array.isArray(modelValue.value)
    ? modelValue.value.map(item => JSON.stringify(item))
    : [],
)

// Parse and update modelValue whenever items change
function updateModelValue() {
  try {
    modelValue.value = items.value.map((item) => {
      try {
        return JSON.parse(item)
      }
      catch {
        // If parsing fails, treat as string
        return item
      }
    })
  }
  catch (error) {
    console.error('Error updating array:', error)
  }
}

function addItem() {
  items.value.push('""')
  updateModelValue()
}

function removeItem(index: number) {
  items.value.splice(index, 1)
  updateModelValue()
}

function updateItem(index: number, value: string) {
  items.value[index] = value
  updateModelValue()
}

const hasItems = computed(() => items.value.length > 0)
</script>

<template>
  <div flex flex-col gap-2 w-full>
    <div
      v-for="(item, index) in items"
      :key="index"
      flex gap-2 items-center
    >
      <input
        :value="item"
        type="text"
        placeholder='Enter value (e.g., "text", 123, {"key":"value"})'
        transition="all duration-200 ease-in-out"
        cursor="disabled:not-allowed"
        flex-1 rounded-lg px-2 py-1 text-sm outline-none
        shadow="sm"
        bg="gray-50 dark:[#242436]"
        border="2 solid gray-300 dark:[#242436]"
        class="focus:bg-white dark:focus:bg-gray-900 focus:border-primary-300 dark:focus:border-primary-400/50"
        @input="(e) => updateItem(index, (e.target as HTMLInputElement).value)"
      >
      <button
        type="button"
        class="p-1.5 rounded-lg transition-colors hover:bg-red-500/10 dark:hover:bg-red-500/20"
        title="Remove item"
        @click="removeItem(index)"
      >
        <div class="i-carbon:subtract-alt text-red-500 size-4" />
      </button>
    </div>
    <button
      type="button"
      flex items-center justify-center gap-1.5
      class="w-full px-2 py-1.5 rounded-lg text-sm font-medium transition-colors"
      bg="primary-500/10 dark:primary-500/20 hover:primary-500/20 dark:hover:primary-500/30"
      text="primary-700 dark:primary-300"
      @click="addItem"
    >
      <div class="i-carbon:add-alt size-4" />
      <span>Add Item</span>
    </button>
    <div v-if="!hasItems" text="xs gray-500 dark:gray-400" italic mt-1>
      Empty array. Click "Add Item" to start.
    </div>
  </div>
</template>
