<script setup lang="ts">
import { onMounted, ref } from 'vue'
// Import a markdown file as a string
import PromptTemplate from './PromptTemplate.md'

const language = ref('TypeScript')
const question = ref('How to create a Vite plugin?')

// 确保我们处理的是字符串类型
const promptTemplateString = ref(typeof PromptTemplate === 'string' ? PromptTemplate : JSON.stringify(PromptTemplate))

// 在控制台输出处理后的Markdown
onMounted(() => {
  console.log('=== Markdown Processing Results ===')
  console.log('Prompt Template Markdown:')
  console.log(promptTemplateString.value)
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
      <h3>原始 Markdown:</h3>
      <pre class="raw-content">{{ promptTemplateString }}</pre>
    </div>

    <div class="debug-info">
      <h3>调试信息:</h3>
      <p>打开浏览器控制台查看更多输出信息</p>
      <p><strong>当前变量:</strong> language = {{ language }}, question = {{ question }}</p>
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

.debug-info {
  margin-top: 2rem;
  padding: 1rem;
  background-color: #fff8dc;
  border: 1px dashed #ccc;
  border-radius: 0.5rem;
}
</style>
