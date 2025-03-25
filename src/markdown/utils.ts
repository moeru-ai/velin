import { select } from 'hast-util-select'
import { toHtml } from 'hast-util-to-html'
import markdownIt from 'markdown-it'
import rehypeParse from 'rehype-parse'
import rehypeRemark from 'rehype-remark'
import remarkStringify from 'remark-stringify'
import { unified } from 'unified'
import { remove } from 'unist-util-remove'

/**
 * Converts Markdown string to HTML
 */
export function convertMarkdownToHtml(markdownString: string): string {
  const md = markdownIt({ html: true })
  return md.render(markdownString)
}

/**
 * Extracts script content from HTML and returns the remaining HTML
 */
export function extractScriptFromHtml(html: string): { remainingHTML: string, scriptContent: string } {
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

/**
 * Creates a Vue Single File Component string
 */
export function createSFC(html: string, scriptContent: string): string {
  return `<template>${html}</template>\n
<script setup>${scriptContent}</script>`
}

/**
 * Converts HTML back to Markdown
 */
export async function convertHtmlToMarkdown(html: string): Promise<string> {
  const htmlToMarkdownProcessor = unified()
    .use(rehypeParse)
    .use(rehypeRemark)
    .use(remarkStringify, { bullet: '-' })

  const result = await htmlToMarkdownProcessor.process(html)
  return result.toString()
}
