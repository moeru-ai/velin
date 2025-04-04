import type { RenderFunction } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { evaluateAnyModule } from '../sfc/import'
import { compileSFCForRaw, renderSFC, resolveDataFromScriptComponent } from '../sfc/parser'
import { convertHtmlToMarkdown, convertMarkdownToHtml, createSFC, extractScriptFromHtml } from './utils'

/**
 * Processes a Markdown file by converting it to HTML, extracting script content,
 * creating an SFC, rendering it, and converting back to Markdown.
 *
 * @param source - Markdown content or file path
 * @returns Promise that resolves when processing is complete
 */
export async function processMarkdownSSR(source: string): Promise<string> {
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
  return markdownResult
}

export async function processMarkdown(source: string): Promise<string> {
  const html = convertMarkdownToHtml(source)
  const { remainingHTML, scriptContent } = extractScriptFromHtml(html)
  const sfcString = createSFC(remainingHTML, scriptContent)

  const { templateResult, scriptResult } = await compileSFCForRaw(sfcString, false)

  // TODO: type
  const script = await evaluateAnyModule(scriptResult.content)
  const render = await evaluateAnyModule(templateResult.code) as RenderFunction

  const ctx = await resolveDataFromScriptComponent(script)

  const dom = render.call(ctx, ctx, [])

  const renderedHTML = await renderToString(dom)

  const markdownResult = await convertHtmlToMarkdown(renderedHTML)
  return markdownResult
}
