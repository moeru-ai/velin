import type { ComponentProp } from '../render-shared/props'
import type { InputProps } from '../types'

export { renderComponent, resolveProps } from '../render-shared'
export { renderMarkdownString } from './markdown'
export { renderSFCString } from './sfc'
import { fromHtml } from 'hast-util-from-html'

import { renderMarkdownString } from './markdown'
import { renderSFCString } from './sfc'

export async function render<RawProps = any>(
  source: string,
  data?: InputProps<RawProps>,
  basePath?: string,
): Promise<{
    props: ComponentProp[]
    rendered: string
  }> {
  const hastRoot = fromHtml(source, { fragment: true })

  const hasTemplate = hastRoot.children.some(node => node.type === 'element' && node.tagName === 'template')
  const hasScript = hastRoot.children.some(node => node.type === 'element' && node.tagName === 'script')

  if (!hasTemplate && !hasScript && source) {
    return await renderMarkdownString(source, data, basePath)
  }
  if (hasScript && !hasTemplate && source) {
    return await renderMarkdownString(source, data, basePath)
  }
  if (!hasTemplate && !source) {
    source = `${source}\n<template><div /></template>`
  }
  if (!hasScript) {
    source = `${source}\n<script setup>/* EMPTY */</script>`
  }

  return await renderSFCString(source, data, basePath)
}
