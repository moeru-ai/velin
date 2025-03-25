import fs from 'node:fs/promises'
import { select } from 'hast-util-select'
import { toHtml } from 'hast-util-to-html'
import markdownIt from 'markdown-it'
import rehypeParse from 'rehype-parse'
import rehypeRemark from 'rehype-remark'
import remarkStringify from 'remark-stringify'
import { unified } from 'unified'
import { remove } from 'unist-util-remove'
import { renderSFC } from '../src'

/**
 * Processes a Markdown file by converting it to HTML, extracting script content,
 * creating an SFC, rendering it, and converting back to Markdown.
 * 
 * @param inputFile - Path to the input Markdown file
 * @returns Promise that resolves when processing is complete
 */
async function processMarkdown(inputFile: string): Promise<string> {
  // Read Markdown file
  const markdownString = await fs.readFile(inputFile, 'utf-8')

  // Convert Markdown to HTML
  const html = convertMarkdownToHtml(markdownString)

  // Process HTML and extract script content
  const { remainingHTML, scriptContent } = extractScriptFromHtml(html)

  // Create SFC (Single File Component)
  const sfcString = createSFC(remainingHTML, scriptContent)

  // Render SFC to HTML
  const renderedHTML = await renderSFC(sfcString)

  // Convert HTML back to Markdown
  const markdownResult = await convertHtmlToMarkdown(renderedHTML)
  
  // console.log(renderedHTML)
  console.log(markdownResult)
  
  return markdownResult
}

/**
 * Converts Markdown string to HTML
 */
function convertMarkdownToHtml(markdownString: string): string {
  const md = markdownIt({ html: true })
  return md.render(markdownString)
}

/**
 * Extracts script content from HTML and returns the remaining HTML
 */
function extractScriptFromHtml(html: string): { remainingHTML: string; scriptContent: string } {
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
function createSFC(html: string, scriptContent: string): string {
  return `<template>${html}</template>\n
<script setup>${scriptContent}</script>`
}

/**
 * Converts HTML back to Markdown
 */
async function convertHtmlToMarkdown(html: string): Promise<string> {
  const htmlToMarkdownProcessor = unified()
    .use(rehypeParse)
    .use(rehypeRemark)
    .use(remarkStringify, { bullet: '-' })
  
  const result = await htmlToMarkdownProcessor.process(html)
  return result.toString()
}

// Execute the main function
(async () => {
  await processMarkdown('examples/assets/Markdown.md')
})()
