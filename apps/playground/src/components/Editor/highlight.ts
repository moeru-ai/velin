// https://github.com/vuejs/repl/blob/5e092b6111118f5bb5fc419f0f8f3f84cd539366/src/monaco/highlight.ts

import { createHighlighterCoreSync } from '@shikijs/core'
import { createJavaScriptRegexEngine } from '@shikijs/engine-javascript'
import langJsx from '@shikijs/langs/jsx'
import langTsx from '@shikijs/langs/tsx'
import langVue from '@shikijs/langs/vue'
import { shikiToMonaco } from '@shikijs/monaco'
import themeLight from '@shikijs/themes/catppuccin-latte'
import themeDark from '@shikijs/themes/catppuccin-mocha'
import * as monaco from 'monaco-editor-core'

let registered = false
export function registerHighlighter() {
  if (!registered) {
    const highlighter = createHighlighterCoreSync({
      themes: [themeDark, themeLight],
      langs: [langVue, langTsx, langJsx],
      engine: createJavaScriptRegexEngine(),
    })
    monaco.languages.register({ id: 'vue' })
    shikiToMonaco(highlighter, monaco)
    registered = true
  }

  return {
    light: themeLight.name!,
    dark: themeDark.name!,
  }
}
