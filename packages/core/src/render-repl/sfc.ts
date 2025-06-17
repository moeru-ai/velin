import type { DefineComponent } from 'vue'

import type { ComponentProp } from '../render-shared'
import type { InputProps } from '../types'

import { evaluate } from '@unrteljs/eval/browser'
import { toMarkdown } from '@velin-dev/utils/to-md'
import { compileModulesForPreview } from '@velin-dev/utils/transformers/vue'
import { renderToString } from '@vue/server-renderer'
import { fromHtml } from 'hast-util-from-html'

import { compileSFC, onlyRender, resolveProps } from '../render-shared'

export async function evaluateSFC(
  source: string,
  _basePath?: string,
) {
  const { script } = await compileSFC(source)

  // TODO: evaluate setup when not <script setup>
  const compiled = compileModulesForPreview({
    files: {
      'temp.vue': {
        code: source,
        filename: 'temp.vue',
        compiled: {
          js: script.content,
          ssr: script.content,
          css: '',
        },
        hidden: false,
        language: 'vue',
      },
    },
    mainFile: 'temp.vue',
  })

  // The compiled code now returns the module's default export directly
  return evaluate<DefineComponent>(`
    const __modules__ = {};
    return (async function() {
      ${compiled.join('\n')}
    })();
  `)
}

export async function resolvePropsFromString(content: string) {
  const component = await evaluateSFC(content)
  const renderedComponent = onlyRender(component, {})
  return resolveProps(renderedComponent as any)
}

export async function renderSFC<RawProps = any>(
  source: string,
  data?: InputProps<RawProps>,
  basePath?: string,
): Promise<{
    props: ComponentProp[]
    rendered: string
  }> {
  const evaluatedComponent = await evaluateSFC(source, basePath)
  const props = resolveProps(evaluatedComponent)

  return {
    props,
    rendered: await renderToString(onlyRender(evaluatedComponent, data)),
  }
}

export async function renderSFCString<RawProps = any>(
  source: string,
  data?: InputProps<RawProps>,
  basePath?: string,
): Promise<{
    props: ComponentProp[]
    rendered: string
  }> {
  const hastRoot = fromHtml(source, { fragment: true })
  const hasScript = hastRoot.children.some(node => node.type === 'element' && node.tagName === 'script')
  if (!hasScript) {
    source = `${source}\n<script setup>/* EMPTY */</script>`
  }

  const { rendered, props } = await renderSFC(source, data, basePath)
  return {
    props,
    rendered: await toMarkdown(rendered),
  }
}
