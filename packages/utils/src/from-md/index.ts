import { select } from 'hast-util-select'
import { toHtml } from 'hast-util-to-html'
import markdownIt from 'markdown-it'
import rehypeParse from 'rehype-parse'
import { unified } from 'unified'
import { remove } from 'unist-util-remove'

export function fromMarkdown(markdownString: string): string {
  const md = markdownIt({ html: true })
  return md.render(markdownString)
}

export function scriptFrom(html: string): { remainingHTML: string, scriptContent: string } {
  const hastProcessor = unified().use(rehypeParse)
  const hastTree = hastProcessor.parse(html)

  const scriptNode = select('script[setup]', hastTree) as {
    children: {
      value: string
    }[]
  }

  const scriptContent = scriptNode ? scriptNode.children[0].value : ''

  if (scriptNode) {
    remove(hastTree, scriptNode)
  }

  const remainingHTML = toHtml(hastTree)

  return { remainingHTML, scriptContent }
}
