// https://github.com/vuejs/repl/blob/5e092b6111118f5bb5fc419f0f8f3f84cd539366/src/utils.ts

import { strFromU8, strToU8, unzlibSync, zlibSync } from 'fflate'

export function debounce(fn: (...args: any[]) => any, n = 100) {
  let handle: any
  return (...args: any[]) => {
    if (handle)
      clearTimeout(handle)
    handle = setTimeout(() => {
      fn(...args)
    }, n)
  }
}

export function utoa(data: string): string {
  const buffer = strToU8(data)
  const zipped = zlibSync(buffer, { level: 9 })
  const binary = strFromU8(zipped, true)
  return btoa(binary)
}

export function atou(base64: string): string {
  const binary = atob(base64)

  // zlib header (x78), level 9 (xDA)
  if (binary.startsWith('\x78\xDA')) {
    const buffer = strToU8(binary, true)
    const unzipped = unzlibSync(buffer)
    return strFromU8(unzipped)
  }

  // old unicode hacks for backward compatibility
  // https://base64.guru/developers/javascript/examples/unicode-strings
  return decodeURIComponent(escape(binary))
}
