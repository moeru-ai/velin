import type { InputProps } from '../types'

import { fromMarkdown, scriptFrom } from '@velin-dev/utils/from-md'
import { toMarkdown } from '@velin-dev/utils/to-md'
import { createSFC } from '@velin-dev/utils/vue-sfc'

import { renderSFCString } from './sfc'

export async function renderMarkdownString<RawProps = any>(
  source: string,
  data?: InputProps<RawProps>,
  _basePath?: string,
): Promise<string> {
  const html = fromMarkdown(source)

  const { remainingHTML, scriptContent } = scriptFrom(html)
  const sfcString = createSFC(remainingHTML, scriptContent)

  const renderedHTML = await renderSFCString(sfcString, data)
  const markdownResult = await toMarkdown(renderedHTML)

  return markdownResult
}
