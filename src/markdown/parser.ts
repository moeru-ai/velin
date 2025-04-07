import type { RenderFunction } from 'vue'
import { renderToString } from '@vue/server-renderer'
import defu from 'defu'
import ErrorStackParser from 'error-stack-parser'
import path from 'path-browserify-esm'
import { evaluateAnyModule } from '../sfc/import'
import { compileSFCForRaw, resolveDataFromScriptComponent } from '../sfc/parser'
import { convertHtmlToMarkdown, convertMarkdownToHtml, createSFC, extractScriptFromHtml } from './utils'

export async function processMarkdown(source: string, data?: Record<string, any>): Promise<string> {
  const html = convertMarkdownToHtml(source)
  const { remainingHTML, scriptContent } = extractScriptFromHtml(html)
  const sfcString = createSFC(remainingHTML, scriptContent)

  const { templateResult, scriptResult } = await compileSFCForRaw(sfcString, false)

  // eslint-disable-next-line unicorn/error-message
  const stack = ErrorStackParser.parse(new Error())
  const entranceDir = path.dirname(stack[1].fileName?.replace('async', '').trim() || '')

  // TODO: type
  const script = await evaluateAnyModule(scriptResult.content, entranceDir)
  const render = await evaluateAnyModule(templateResult.code) as RenderFunction

  let ctx = await resolveDataFromScriptComponent(script)
  ctx = defu(data || {}, ctx)

  const dom = render.call(ctx, ctx, [])

  const renderedHTML = await renderToString(dom)

  const markdownResult = await convertHtmlToMarkdown(renderedHTML)
  return markdownResult
}
