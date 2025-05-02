import type { Data } from '../sfc/parser'

import { renderSFC } from '../sfc/parser'
import { convertHtmlToMarkdown, convertMarkdownToHtml, createSFC, extractScriptFromHtml } from './utils'

export async function processMarkdown(source: string, data?: Data): Promise<string> {
  const html = convertMarkdownToHtml(source)

  const { remainingHTML, scriptContent } = extractScriptFromHtml(html)
  const sfcString = createSFC(remainingHTML, scriptContent)
  const renderedHTML = await renderSFC(sfcString, data)

  const markdownResult = await convertHtmlToMarkdown(renderedHTML)
  return markdownResult
}
