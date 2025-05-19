import type { InputProps } from './types'

import { isNode } from 'std-env'

import {
  renderMarkdownString as renderMarkdownStringBrowser,
  renderSFCString as renderSFCStringBrowser,
} from './render-browser'

export async function renderMarkdownString<RawProps = any>(
  source: string,
  data?: InputProps<RawProps>,
  basePath?: string,
): Promise<string> {
  if (isNode) {
    const { renderMarkdownString } = await import('./render-node')
    return renderMarkdownString(source, data, basePath)
  }

  return renderMarkdownStringBrowser(source, data, basePath)
}

export async function renderSFCString<RawProps = any>(
  source: string,
  data?: InputProps<RawProps>,
  basePath?: string,
): Promise<string> {
  if (isNode) {
    const { renderSFCString } = await import('./render-node')
    return renderSFCString(source, data, basePath)
  }

  return renderSFCStringBrowser(source, data, basePath)
}

export {
  onlyRender,
  onlySetup,
  renderComponent,
  resolveProps,
} from './render-shared'
export * from './types'
