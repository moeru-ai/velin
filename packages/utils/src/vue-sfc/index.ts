export function createSFC(html: string, scriptContent: string): string {
  return `<template>${html}</template>\n
<script setup>${scriptContent.trim() || '/* EMPTY */'}</script>`
}
