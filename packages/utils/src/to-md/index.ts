import type { Element, Root } from 'hast'
import type { Options } from 'rehype-remark'

import htmlTags from 'html-tags'
import rehypeParse from 'rehype-parse'
import rehypeRemark from 'rehype-remark'
import rehypeRemoveComments from 'rehype-remove-comments'
import remarkStringify from 'remark-stringify'

import { toHtml } from 'hast-util-to-html'
import { unified } from 'unified'

type Handlers = NonNullable<Options['handlers']>

const standardHtmlTags = new Set<string>(htmlTags)

/**
 * Keep a custom element's tags while converting its children to Markdown.
 *
 * Triggering workflow:
 * {@link toMarkdown} -> {@link rehypeRemark} element dispatch
 * -> {@link preserveCustomElement} -> {@link remarkStringify} raw HTML nodes.
 */
const preserveCustomElement: Handlers[string] = (state, node) => {
  const closingTag = `</${node.tagName}>`
  const emptyElement = toHtml({ ...node, children: [] })

  // Obsolete HTML void elements can fall outside the standard tag list.
  if (!emptyElement.endsWith(closingTag)) {
    return { type: 'html', value: emptyElement, data: { hName: 'span' } }
  }

  const openingTag = emptyElement.slice(0, -closingTag.length)

  return [
    // Treat the boundaries as phrasing content so inline XML stays inline.
    { type: 'html', value: openingTag, data: { hName: 'span' } },
    ...state.all(node),
    { type: 'html', value: closingTag, data: { hName: 'span' } },
  ]
}

function registerCustomElements(node: Root | Element, handlers: Handlers): void {
  for (const child of node.children) {
    if (child.type !== 'element') {
      continue
    }

    if (!standardHtmlTags.has(child.tagName)) {
      handlers[child.tagName] = preserveCustomElement
    }

    registerCustomElements(child, handlers)
  }
}

export async function toMarkdown(html: string): Promise<string> {
  const handlers: Handlers = Object.create(null)
  const htmlToMarkdownProcessor = unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeRemoveComments, { removeConditional: true })
    .use(rehypeRemark, { handlers })
    .use(remarkStringify, { bullet: '-' })

  const tree = htmlToMarkdownProcessor.parse(html)
  registerCustomElements(tree, handlers)

  const result = await htmlToMarkdownProcessor.run(tree)
  return htmlToMarkdownProcessor.stringify(result)
}
