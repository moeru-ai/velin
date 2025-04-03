import fs from 'node:fs/promises'

import { renderSFC } from '../sfc/parser'
import { convertHtmlToMarkdown, convertMarkdownToHtml, createSFC, extractScriptFromHtml } from './utils'

/**
 * Processes a Markdown file by converting it to HTML, extracting script content,
 * creating an SFC, rendering it, and converting back to Markdown.
 *
 * @param input - Path to the input Markdown file or Markdown content
 * @param isContent - Whether the input is content rather than a file path
 * @returns Promise that resolves to the processed Markdown string
 */
export async function processMarkdown(input: string, isContent: boolean = false): Promise<string> {
  // Get Markdown string from file or use input directly
  const markdownString = isContent ? input : await fs.readFile(input, 'utf-8')

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
