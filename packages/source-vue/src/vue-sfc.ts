export function createSFC(html: string, scriptContent: string, lang: string): string {
  return `<template>${html}</template>\n
<script setup lang="${lang}">${scriptContent.trim() || '/* EMPTY */'}</script>`
}
