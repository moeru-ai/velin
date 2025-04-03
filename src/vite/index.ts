import type { Plugin } from 'vite'
import { extname } from 'node:path'
import { processMarkdown } from '../markdown/parser'

export interface MarkdownTemplateOptions {
  /**
   * File extensions to process
   * @default ['.md']
   */
  extensions?: string[]

  /**
   * Custom transform function to process the output markdown
   * @param code The processed markdown content
   * @returns The final transformed code
   */
  transform?: (code: string) => string | Promise<string>

  /**
   * Whether to wrap the markdown in a Vue component
   * @default true
   */
  wrapComponent?: boolean

  /**
   * Whether to include the Vue runtime template compiler
   * Needed for components with dynamic template content
   * @default true
   */
  includeRuntimeCompiler?: boolean

  /**
   * Whether to skip Vue template processing and just return raw markdown
   * Useful if you want to get the raw markdown content
   * @default false
   */
  rawContent?: boolean
}

/**
 * Vite plugin that converts Markdown with Vue template syntax to Vue components
 */
export function vitePluginMarkdownTemplate(options: MarkdownTemplateOptions = {}): Plugin {
  const extensions = options.extensions || ['.md']
  const wrapComponent = options.wrapComponent !== false
  const _includeRuntimeCompiler = options.includeRuntimeCompiler !== false
  const rawContent = options.rawContent === true

  return {
    name: 'vite-plugin-markdown-template',

    async transform(code: string, id: string) {
      // Check if the file extension matches our target extensions
      const ext = extname(id)
      if (!extensions.includes(ext))
        return null

      try {
        // 如果选择直接输出原始内容，则跳过处理模板的步骤
        let result = rawContent ? code : await processMarkdown(code)
        console.log('Raw content:\n', code)

        // Apply custom transformation if provided
        if (options.transform) {
          result = await options.transform(result)
        }

        console.log(result)

        // 简单地导出处理后的Markdown内容作为字符串
        return {
          code: `export default ${JSON.stringify(result)}`,
          map: null,
        }
      }
      catch (error) {
        console.error('Error processing markdown:', error)
        return null
      }
    },

    configResolved(config) {
      // Warn if Vue plugin is not installed when using wrapComponent
      if (wrapComponent) {
        const hasVuePlugin = config.plugins.some(plugin =>
          plugin.name === 'vite:vue' || plugin.name === 'vite:vue-jsx',
        )

        if (!hasVuePlugin) {
          console.warn('[vite-plugin-markdown-template] Vue plugin not detected. For best results, please include @vitejs/plugin-vue in your Vite plugins.')
        }
      }
    },
  }
}
