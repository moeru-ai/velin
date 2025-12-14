// https://github.com/vuejs/repl/blob/69c2ed1dca84132708c3b9a1d0a008e11be2be74/src/monaco/utils.ts

import type { Uri } from 'monaco-editor-core'

import { editor } from 'monaco-editor-core'

export function getOrCreateModel(
  uri: Uri,
  lang: string | undefined,
  value: string,
) {
  const model = editor.getModel(uri)
  if (model) {
    model.setValue(value)
    return model
  }
  return editor.createModel(value, lang, uri)
}
