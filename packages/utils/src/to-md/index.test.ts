import { describe, expect, it } from 'vitest'

import { toMarkdown } from '.'

describe('toMarkdown', () => {
  it('should strip Vue SSR comments like <!--[--> <!--]--> <!--v-if-->', async () => {
    const html = '<!--[--><p>hello</p><!--]--><!--v-if--><p>world</p>'
    const result = await toMarkdown(html)
    expect(result).not.toContain('<!--')
    expect(result).toContain('hello')
    expect(result).toContain('world')
  })
})
