## 原始 Markdown 内容

这个文件会被直接作为纯文本导出，不会进行任何处理。

<script setup>
const message = "这段脚本不会被处理"
</script>

模板变量 {{message}} 不会被执行，而是会原样保留。

**这对于以下场景非常有用：**

- 当你需要获取原始的 Markdown 内容用于其他处理时
- 当你想自己实现处理模板变量的逻辑时
- 当你想将 Markdown 发送到 API 进行处理时

```js
// 你可以在客户端自己实现模板变量的处理
function processTemplate(template, variables) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, name) => variables[name] || '')
}

const processed = processTemplate(rawMarkdown, { message: '你好，世界！' })
```
