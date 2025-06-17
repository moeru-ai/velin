// https://github.com/vuejs/repl/blob/5e092b6111118f5bb5fc419f0f8f3f84cd539366/src/types.ts

import type { editor } from 'monaco-editor-core'
import type { Component, InjectionKey, ToRefs } from 'vue'

import type { Store } from '../components/Editor/store'

export type EditorMode = 'js' | 'css' | 'ssr'
export interface EditorProps {
  value: string
  filename: string
  readonly?: boolean
  mode?: EditorMode
}
export interface EditorEmits {
  (e: 'change', code: string): void
}
export type EditorComponentType = Component<EditorProps>

export type OutputModes = 'preview' | EditorMode

export const injectKeyProps: InjectionKey<ToRefs<Required<{
  theme?: 'dark' | 'light'
  previewTheme?: boolean
  editor: EditorComponentType
  store?: Store
  autoResize?: boolean
  showCompileOutput?: boolean
  showImportMap?: boolean
  showTsConfig?: boolean
  clearConsole?: boolean
  layout?: 'horizontal' | 'vertical'
  layoutReverse?: boolean
  ssr?: boolean
  previewOptions?: {
    headHTML?: string
    bodyHTML?: string
    placeholderHTML?: string
    customCode?: {
      importCode?: string
      useCode?: string
    }
    showRuntimeError?: boolean
    showRuntimeWarning?: boolean
  }
  editorOptions?: {
    showErrorText?: string | false
    autoSaveText?: string | false
    monacoOptions?: editor.IStandaloneEditorConstructionOptions
  }
  splitPaneOptions?: {
    codeTogglerText?: string
    outputTogglerText?: string
  }
} & { autoSave: boolean }>>> = Symbol('props')
