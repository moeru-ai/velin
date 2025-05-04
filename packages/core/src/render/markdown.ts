import { fromMarkdown, scriptFrom } from '@velin-dev/utils/from-md'
import { toMarkdown } from '@velin-dev/utils/to-md'
import { createSFC } from '@velin-dev/utils/vue-sfc'

import { renderSFC } from './sfc'

export async function renderMarkdownString(source: string, data?: Record<string, unknown>, basePath?: string): Promise<string> {
  const html = fromMarkdown(source)

  const { remainingHTML, scriptContent } = scriptFrom(html)
  const sfcString = createSFC(remainingHTML, scriptContent)
  const renderedHTML = await renderSFC(sfcString, data, basePath)

  const markdownResult = await toMarkdown(renderedHTML)
  return markdownResult
}
