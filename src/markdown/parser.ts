import fs from 'node:fs/promises'

import { renderSFC, mountSFC } from '../sfc/parser'
import { convertHtmlToMarkdown, convertMarkdownToHtml, createSFC, extractScriptFromHtml } from './utils'

/**
 * Processes a Markdown file by converting it to HTML, extracting script content,
 * creating an SFC, rendering it, and converting back to Markdown.
 *
 * @param inputFile - Path to the input Markdown file
 * @returns Promise that resolves when processing is complete
 */
export async function processMarkdown(inputFile: string): Promise<string> {
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
 * Processes a Markdown string and mounts the resulting Vue component to a DOM element
 * 
 * @param markdownString - Markdown content as string
 * @param container - DOM element or selector to mount the component
 */
export async function mountMarkdown(markdownString: string, container: Element | string): Promise<void> {
  // Convert Markdown to HTML
  const html = convertMarkdownToHtml(markdownString)

  // Process HTML and extract script content
  const { remainingHTML, scriptContent } = extractScriptFromHtml(html)

  // Create SFC (Single File Component)
  const sfcString = createSFC(remainingHTML, scriptContent)

  // Mount SFC to DOM element
  await mountSFC(sfcString, container)
}
