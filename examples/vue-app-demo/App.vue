<script setup lang="ts">
import { computed, ref } from 'vue'
// Import a markdown file as a component
import PromptTemplate from './PromptTemplate.md'
// Import raw markdown content
import rawMarkdown from './RawContent.raw.md'
// Import another markdown file as a string (requires wrapComponent: false in plugin config)
import stringMarkdown from './StringExample.mdx'

const language = ref('TypeScript')
const question = ref('How to create a Vite plugin?')

// 示例：客户端处理原始 Markdown 内容
const processedRawMarkdown = computed(() => {
  // 简单的模板变量替换实现
  return rawMarkdown.replace(/\{\{(\w+)\}\}/g, (_, name) => {
    if (name === 'message')
      return '你好，世界！'
    return `{{${name}}}`
  })
})
</script>

<template>
  <div class="app">
    <h1>Markdown Template Demo</h1>

    <div class="controls">
      <div>
        <label for="language">Programming Language:</label>
        <select id="language" v-model="language">
          <option>JavaScript</option>
          <option>TypeScript</option>
          <option>Python</option>
          <option>Rust</option>
          <option>Go</option>
        </select>
      </div>

      <div>
        <label for="question">Question:</label>
        <input id="question" v-model="question">
      </div>
    </div>

    <div class="template-output">
      <!-- 组件导入方式 - 作为 Vue 组件使用 -->
      <h3>作为组件使用:</h3>
      <PromptTemplate />
    </div>

    <div class="template-output">
      <!-- 字符串导入方式 - 使用 v-html 渲染 -->
      <h3>作为字符串使用:</h3>
      <div v-html="stringMarkdown" />
    </div>

    <div class="template-output">
      <!-- 原始内容导入方式 -->
      <h3>原始 Markdown 内容:</h3>
      <pre class="raw-content">{{ rawMarkdown }}</pre>

      <h3>客户端处理后的内容:</h3>
      <div class="processed-content" v-html="processedRawMarkdown" />
    </div>
  </div>
</template>

<style>
.app {
  font-family:
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
}

.controls div {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-weight: bold;
}

input,
select {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 0.25rem;
}

.template-output {
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  background-color: #f8f9fa;
  margin-bottom: 1rem;
}

.raw-content {
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 0.25rem;
  white-space: pre-wrap;
  font-family: monospace;
  font-size: 0.9rem;
}

.processed-content {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f0f8ff;
  border-radius: 0.25rem;
}
</style>
