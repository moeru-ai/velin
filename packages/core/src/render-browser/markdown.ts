import type { InputProps } from '../types'

import { fromMarkdown, scriptFrom } from '@velin-dev/utils/from-md'
import { createSFC } from '@velin-dev/utils/vue-sfc'

import { renderSFCString } from './sfc'

export async function renderMarkdownString<RawProps = any>(
  source: string,
  data?: InputProps<RawProps>,
  _basePath?: string,
): Promise<string> {
  const html = fromMarkdown(source)

  const { script, template, lang } = scriptFrom(html)
  const sfcString = createSFC(template, script, lang)

  return await renderSFCString(sfcString, data)
}
