import type { ComponentProp } from './render-shared'
import type { InputProps, RenderSFCOptions } from './types'

import { isNode } from 'std-env'

import {
  renderMarkdownString as renderMarkdownStringBrowser,
  renderSFCString as renderSFCStringBrowser,
} from './render-browser'

export async function renderMarkdownString<RawProps = any>(
  source: string,
  data?: InputProps<RawProps>,
  basePath?: string,
): Promise<{
  props: ComponentProp[]
  rendered: string
}> {
  if (isNode) {
    const { renderMarkdownString } = await import('./render-node')
    return renderMarkdownString(source, data, basePath)
  }

  return renderMarkdownStringBrowser(source, data, basePath)
}

export async function renderSFCString<RawProps = any>(
  source: string,
  data?: InputProps<RawProps>,
  options?: string | RenderSFCOptions,
): Promise<{
  props: ComponentProp[]
  rendered: string
}> {
  if (isNode) {
    const { renderSFCString } = await import('./render-node')
    return renderSFCString(source, data, options)
  }

  return renderSFCStringBrowser(source, data, typeof options === 'string' ? options : options?.basePath)
}

export {
  normalizeProps,
  onlyRender,
  onlySetup,
  renderComponent,
  resolveProps,
} from './render-shared'
export * from './types'
