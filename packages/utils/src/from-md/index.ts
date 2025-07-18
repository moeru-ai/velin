import type { Element, Text } from 'hast'

import { fromHtml } from 'hast-util-from-html'
import { select } from 'hast-util-select'
import { toHtml } from 'hast-util-to-html'
import markdownIt from 'markdown-it'
import { remove } from 'unist-util-remove'

export function fromMarkdown(markdownString: string): string {
  const md = markdownIt({ html: true })
  return md.render(markdownString)
}

function asHTMLElement(input?: any): Element | undefined {
  return input
}

function asHTMLText(input?: any): Text | undefined {
  return input
}

export function scriptFrom(html: string): { script: string, template: string, lang: string } {
  const hastTree = fromHtml(html, { fragment: true })
  const scriptNode = asHTMLElement(select('script[setup]', hastTree))
  const lang = String(scriptNode?.properties?.lang || 'js')
  const script = scriptNode ? asHTMLText(scriptNode.children[0]).value : ''
  if (scriptNode) {
    remove(hastTree, scriptNode)
  }

  const template = toHtml(hastTree)
  return { script, template, lang }
}
