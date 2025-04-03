import { renderSFC } from '../sfc/parser'
import { convertHtmlToMarkdown, convertMarkdownToHtml, createSFC, extractScriptFromHtml } from './utils'

/**
 * Processes a Markdown file by converting it to HTML, extracting script content,
 * creating an SFC, rendering it, and converting back to Markdown.
 *
 * @param source - Markdown content or file path
 * @returns Promise that resolves when processing is complete
 */
export async function processMarkdown(source: string): Promise<string> {
  // Convert Markdown to HTML
  const html = convertMarkdownToHtml(source)

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
