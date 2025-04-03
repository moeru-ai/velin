declare module '*.md' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*.mdx' {
  // 对于 MDX 文件，直接导出为字符串
  const content: string
  export default content
}

declare module '*.raw.md' {
  // 对于 raw.md 文件，直接导出为原始字符串
  const content: string
  export default content
}
