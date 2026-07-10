// https://github.com/vuejs/repl/blob/5e092b6111118f5bb5fc419f0f8f3f84cd539366/src/monaco/highlight.ts

import langJsx from '@shikijs/langs/jsx'
import langTsx from '@shikijs/langs/tsx'
import langVue from '@shikijs/langs/vue'
import themeLight from '@shikijs/themes/catppuccin-latte'
import themeDark from '@shikijs/themes/catppuccin-mocha'

import { createHighlighterCoreSync } from '@shikijs/core'
import { createJavaScriptRegexEngine } from '@shikijs/engine-javascript'
import { shikiToMonaco } from '@shikijs/monaco'
import { editor, languages } from 'monaco-editor-core'

const monaco = {
  editor,
  languages,
} as unknown as typeof import('monaco-editor-core')

let registered = false
export function registerHighlighter() {
  if (!registered) {
    const highlighter = createHighlighterCoreSync({
      themes: [themeDark, themeLight],
      langs: [langVue, langTsx, langJsx],
      engine: createJavaScriptRegexEngine(),
    })
    languages.register({ id: 'vue' })
    shikiToMonaco(highlighter, monaco)
    registered = true
  }

  return {
    light: themeLight.name!,
    dark: themeDark.name!,
  }
}
