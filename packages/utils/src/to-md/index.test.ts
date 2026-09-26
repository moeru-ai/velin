import { describe, expect, it } from 'vitest'

import { toMarkdown } from '.'

describe('toMarkdown', () => {
  it('should preserve custom tags and attributes', async () => {
    await expect(toMarkdown('<instructions priority="high">Be concise</instructions>'))
      .resolves
      .toBe('<instructions priority="high">Be concise</instructions>\n')
  })

  it('should preserve nested and empty custom elements', async () => {
    await expect(toMarkdown('<context><rule>One</rule><rule>Two</rule><checkpoint id="x"></checkpoint></context>'))
      .resolves
      .toBe('<context><rule>One</rule><rule>Two</rule><checkpoint id="x"></checkpoint></context>\n')
  })

  it('should convert standard HTML inside custom tags', async () => {
    await expect(toMarkdown('<instructions><strong>Important</strong> and <em>brief</em></instructions>'))
      .resolves
      .toBe('<instructions>**Important** and *brief*</instructions>\n')
  })

  it('should preserve custom tags inside standard HTML', async () => {
    await expect(toMarkdown('<p>Use <parameter name="tone">concise</parameter> replies.</p>'))
      .resolves
      .toBe('Use <parameter name="tone">concise</parameter> replies.\n')
  })

  it('should preserve nonstandard tags even when rehype has a built-in handler', async () => {
    await expect(toMarkdown('<content>Keep this</content>'))
      .resolves
      .toBe('<content>Keep this</content>\n')
  })

  it('should keep standard HTML conversion and removal behavior', async () => {
    await expect(toMarkdown('<section><h1>Plan</h1><p><strong>Do this</strong></p><ul><li>First</li></ul><script>hidden()</script></section>'))
      .resolves
      .toBe('# Plan\n\n**Do this**\n\n- First\n')
  })

  it('should convert block HTML inside custom elements', async () => {
    await expect(toMarkdown('<instructions><h2>Rules</h2><ul><li>Be concise</li></ul></instructions>'))
      .resolves
      .toBe('<instructions>\n\n## Rules\n\n- Be concise\n\n</instructions>\n')
  })

  it('should escape attribute values without escaping the custom tags', async () => {
    await expect(toMarkdown('<parameter value="a &quot;b&quot; &amp; c">ok</parameter>'))
      .resolves
      .toBe('<parameter value="a &#x22;b&#x22; &#x26; c">ok</parameter>\n')
  })

  it('should preserve obsolete void elements outside the standard tag list', async () => {
    await expect(toMarkdown('<param name="tone" value="concise">'))
      .resolves
      .toBe('<param name="tone" value="concise">\n')
  })

  it('should remove SSR comments inside custom elements', async () => {
    await expect(toMarkdown('<context><!--[--><rule>One</rule><!--]--><!--v-if--></context>'))
      .resolves
      .toBe('<context><rule>One</rule></context>\n')
  })

  it('should leave XML examples in code blocks as literal text', async () => {
    await expect(toMarkdown('<pre><code>&lt;instructions&gt;Be concise&lt;/instructions&gt;</code></pre>'))
      .resolves
      .toBe('```\n<instructions>Be concise</instructions>\n```\n')
  })

  it('should strip Vue SSR comments like <!--[--> <!--]--> <!--v-if-->', async () => {
    const html = '<!--[--><p>hello</p><!--]--><!--v-if--><p>world</p>'
    const result = await toMarkdown(html)
    expect(result).not.toContain('<!--')
    expect(result).toContain('hello')
    expect(result).toContain('world')
  })
})
