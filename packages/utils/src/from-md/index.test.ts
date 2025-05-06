import { describe, expect, it } from 'vitest'

import { scriptFrom } from '.'

describe('scriptFrom', () => {
  it('should be able to parse', () => {
    const result = scriptFrom(`
<template>
  <div>
    <h1>Hello, world!</h1>
  </div>
</template>
`)

    expect(result).toMatchObject({
      remainingHTML: `
<template>
  <div>
    <h1>Hello, world!</h1>
  </div>
</template>
`,
    })
  })
})
