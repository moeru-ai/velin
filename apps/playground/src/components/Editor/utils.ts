// https://github.com/vuejs/repl/blob/5e092b6111118f5bb5fc419f0f8f3f84cd539366/src/monaco/utils.ts

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
