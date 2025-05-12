<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core'
import { RouterView } from 'vue-router'

const isDark = useDark()
const toggleDark = useToggle(isDark)
</script>

<template>
  <div mx-auto h-full max-w-screen-2xl flex flex-row gap-2 w-full>
    <div flex flex-col items-center gap-2 h-full py-4 px-3>
      <h1 text-xl write-vertical-left text="neutral-500 dark:neutral-500" font-jura flex-1 text-nowrap py-2 h-full text-right scale--100>
        Velin Playground
      </h1>
      <div
        flex flex-col items-center
        bg="white dark:neutral-900"
        rounded-full h-fit
        border="2 solid neutral-100 dark:neutral-900"
      >
        <a
          href="https://github.com/luoling8192/velin"
          shadow="none hover:md dark:hover:neutral-100/5"
          bg="dark:hover:neutral-400/10"
          p-2 rounded-full
          transition="all duration-300 ease-in-out"
        >
          <div i-simple-icons:github />
        </a>
        <button
          text-lg
          shadow="none hover:md dark:hover:neutral-100/5"
          bg="dark:hover:neutral-400/10"
          p-2 rounded-full
          transition="all duration-300 ease-in-out"
          @click="() => toggleDark()"
        >
          <div v-if="isDark" i-solar:moon-stars-bold-duotone />
          <div v-else i-solar:sun-bold />
        </button>
      </div>
    </div>
    <div flex-1 w-full py-5 pr-5>
      <RouterView />
    </div>
  </div>
</template>

<style>
html,
body,
#app {
  height: 100%;
  margin: 0;
  padding: 0;
  overscroll-behavior: none;
}

html {
  transition: all 0.3s ease-in-out;
  --at-apply: bg-neutral-50;
}

html.dark {
  color-scheme: dark;
  --at-apply: bg-neutral-800;
}
</style>
