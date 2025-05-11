import type { Transform } from 'sucrase'

import { transform } from 'sucrase'

export function testTs(filename: string | undefined | null) {
  // eslint-disable-next-line regexp/no-unused-capturing-group
  return !!(filename && /(\.|\b)tsx?$/.test(filename))
}

export async function transformTS(src: string, isJSX?: boolean) {
  return transform(src, {
    transforms: ['typescript', ...(isJSX ? (['jsx'] as Transform[]) : [])],
    jsxRuntime: 'preserve',
  }).code
}
