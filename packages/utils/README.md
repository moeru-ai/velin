# `@velin-dev/utils`

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

Refer to [README.md](https://github.com/moeru-ai/velin/blob/main/README.md) for more information.

## Custom tags in prompts

`toMarkdown()` converts standard HTML elements to Markdown and preserves other
element tags and their attributes. The standard tag list comes from
[`html-tags`](https://github.com/sindresorhus/html-tags), which excludes obsolete
HTML tags. Standard HTML inside custom elements is still converted:

```ts
import { toMarkdown } from '@velin-dev/utils/to-md'

await toMarkdown('<instructions priority="high"><strong>Be concise</strong></instructions>')
// <instructions priority="high">**Be concise**</instructions>
```

This also applies to the Vue, React, and Markdown prompt renderers, which share
the same conversion. Existing handling of standard elements, such as removing
`script` and `style`, still applies. Vue SFC compilation may warn about unresolved
custom elements; preserving tags in the output does not change component resolution.

The input is parsed as HTML, not XML: tag and attribute casing, whitespace, and
entity spelling can be normalized. Write custom elements with explicit closing
tags when providing HTML or Markdown source; HTML parsing does not recognize XML
self-closing syntax for these elements. Vue/JSX self-closing elements are expanded
by the component renderer before conversion. XML declarations and CDATA are not
supported as XML syntax.

## License

MIT

[npm-version-src]: https://img.shields.io/npm/v/@velin-dev/utils?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/@velin-dev/utils
[npm-downloads-src]: https://img.shields.io/npm/dm/@velin-dev/utils?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/@velin-dev/utils
[bundle-src]: https://img.shields.io/bundlephobia/minzip/@velin-dev/utils?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=@velin-dev/utils
[license-src]: https://img.shields.io/github/license/moeru-ai/velin.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/moeru-ai/velin/blob/main/LICENSE
[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=1fa669
[jsdocs-href]: https://www.jsdocs.io/package/@velin-dev/utils
