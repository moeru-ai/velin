import { fromHtml } from 'hast-util-from-html'

export function normalizeSFCSource(source: string): string {
  const hastRoot = fromHtml(source, { fragment: true })

  const hasTemplate = hastRoot.children.some(node => node.type === 'element' && node.tagName === 'template')
  const hasScript = hastRoot.children.some(node => node.type === 'element' && node.tagName === 'script')

  if (!hasTemplate && !source) {
    source = `${source}\n<template><div /></template>`
  }
  if (!hasScript) {
    source = `${source}\n<script setup>/* EMPTY */</script>`
  }

  return source
}
