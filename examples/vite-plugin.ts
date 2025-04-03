import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { vitePluginMarkdownTemplate } from '../src/vite'

// Example Vite config using the markdown template plugin
export default defineConfig({
  plugins: [
    vue(),
    // 示例 1: 将 Markdown 转换为 Vue 组件 (默认行为)
    vitePluginMarkdownTemplate({
      // Process .md and .mdx files
      extensions: ['.md'],

      // 包装为 Vue 组件
      wrapComponent: true,

      // Include Vue runtime compiler for dynamic templates
      includeRuntimeCompiler: true,
    }),

    // 示例 2: 将 Markdown 转换为纯字符串
    vitePluginMarkdownTemplate({
      // 为了避免冲突，使用不同的扩展名
      extensions: ['.mdx'],

      // 不包装为 Vue 组件，直接导出字符串
      wrapComponent: false,

      // 可选: 自定义转换函数仍然可用
      transform: async (code) => {
        return `/* 编译后的 Markdown 内容 */\n${code}`
      },
    }),
  ],
})
