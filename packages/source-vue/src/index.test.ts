import { describe, expect, it } from 'vitest'

import {
  compileModulesForPreview,
  createSFC,
  File,
} from './index'

describe('@velin-dev/source-vue', () => {
  it('exports Vue source helpers from the package entry', () => {
    expect(createSFC('<p>Hello</p>', '', 'ts')).toContain('<template><p>Hello</p></template>')
    expect(new File('src/App.vue').language).toBe('vue')
    expect(typeof compileModulesForPreview).toBe('function')
  })
})
