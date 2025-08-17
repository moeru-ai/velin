// https://github.com/vuejs/repl/blob/5e092b6111118f5bb5fc419f0f8f3f84cd539366/src/monaco/vue.worker.ts

import type { LanguageServiceEnvironment } from '@volar/monaco/worker'
import type { VueCompilerOptions } from '@vue/language-service'
import type * as monaco from 'monaco-editor-core'

import type { WorkerHost, WorkerMessage } from './env'

import { createNpmFileSystem } from '@volar/jsdelivr'
import {
  createTypeScriptWorkerLanguageService,

} from '@volar/monaco/worker'
import {
  createVueLanguagePlugin,
  getDefaultCompilerOptions,
  getFullLanguageServicePlugins,
} from '@vue/language-service'
import { URI } from 'vscode-uri'

import * as worker from 'monaco-editor-core/esm/vs/editor/editor.worker'
import * as typescript from 'typescript'

export interface CreateData {
  tsconfig: {
    compilerOptions?: import('typescript').CompilerOptions
    vueCompilerOptions?: Partial<VueCompilerOptions>
  }
  dependencies: Record<string, string>
}

let locale: string | undefined

// eslint-disable-next-line no-restricted-globals
self.onmessage = async (msg: MessageEvent<WorkerMessage>) => {
  if (msg.data?.event === 'init') {
    locale = msg.data.tsLocale
    // eslint-disable-next-line no-restricted-globals
    self.postMessage('inited')
    return
  }

  worker.initialize(
    (
      ctx: monaco.worker.IWorkerContext<WorkerHost>,
      { tsconfig, dependencies }: CreateData,
    ) => {
      const asFileName = (uri: URI) => uri.path
      const asUri = (fileName: string): URI => URI.file(fileName)
      const env: LanguageServiceEnvironment = {
        workspaceFolders: [URI.file('/')],
        locale,
        fs: createNpmFileSystem(
          (uri) => {
            if (uri.scheme === 'file') {
              if (uri.path === '/node_modules') {
                return ''
              }
              else if (uri.path.startsWith('/node_modules/')) {
                return uri.path.slice('/node_modules/'.length)
              }
            }
          },
          pkgName => dependencies[pkgName],
          (path, content) => {
            ctx.host.onFetchCdnFile(
              asUri(`/node_modules/${path}`).toString(),
              content,
            )
          },
        ),
      }

      const { options: compilerOptions } = typescript.convertCompilerOptionsFromJson(
        tsconfig?.compilerOptions || {},
        '',
      )
      const vueCompilerOptions = getDefaultCompilerOptions(
        tsconfig.vueCompilerOptions?.target,
        tsconfig.vueCompilerOptions?.lib,
      )

      return createTypeScriptWorkerLanguageService({
        typescript,
        compilerOptions,
        workerContext: ctx,
        env,
        uriConverter: {
          asFileName,
          asUri,
        },
        languagePlugins: [
          createVueLanguagePlugin(
            typescript,
            compilerOptions,
            vueCompilerOptions,
            asFileName,
          ),
        ],
        languageServicePlugins: getFullLanguageServicePlugins(typescript),
        setup({ project }) {
          project.vue = { compilerOptions: vueCompilerOptions }
        },
      })
    },
  )
}
