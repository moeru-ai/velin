import type { ComponentProp } from '../render-shared/props'
import type { InputProps } from '../types'

import { createSFC } from '@velin-dev/source-vue'
import { fromMarkdown, scriptFrom } from '@velin-dev/utils/from-md'

import { renderSFCString } from './sfc'

export async function renderMarkdownString<RawProps = any>(
  source: string,
  data?: InputProps<RawProps>,
  _basePath?: string,
): Promise<{
  props: ComponentProp[]
  rendered: string
}> {
  const html = fromMarkdown(source)

  const { script, template, lang } = scriptFrom(html)
  const sfcString = createSFC(template, script, lang)

  return await renderSFCString(sfcString, data)
}
