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

export async function processMarkdownToVDom(source: string) {
  const html = convertMarkdownToHtml(source)
  const { remainingHTML, scriptContent } = extractScriptFromHtml(html)
  const sfcString = createSFC(remainingHTML, scriptContent)

  const { templateResult, scriptResult } = await compileSFCForRaw(sfcString, false)
  // console.log(templateResult.code)
  // console.log(scriptResult.content)

  // const vdom = eval(templateResult.code).render()
  const script = await evaluateAnyModule(scriptResult.content)
  const render = await evaluateAnyModule(templateResult.code) as RenderFunction

  // console.log(script)
  // console.log(render)
  // const ctx = await script.setup()
  // const vdom = render(ctx)

  const ctx = await resolveDataFromScriptComponent(script)

  const dom = render.call(ctx, ctx, [])

  const renderedHTML = await renderToString(dom)
  console.log(renderedHTML)

  const markdownResult = await convertHtmlToMarkdown(renderedHTML)
  console.log(markdownResult)

  return markdownResult

  // console.log(dom)

  // const hast = fromDom(dom)

  // console.log(hast)

  // console.log(render.toString())

  // const result = await compileSFC(sfcString)
  // const { ssrRender, data, setup } = result
  // console.log(ssrRender)
  // console.log(data)
  // console.log(setup)

  // // console.log(ssrRender({}, {}, {}, {}))
  // const vdom = createVNode({
  //   setup,
  //   template: ssrRender,
  // })
  // console.log(vdom)
}
