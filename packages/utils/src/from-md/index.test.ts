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
      template: `
<template>
  <div>
    <h1>Hello, world!</h1>
  </div>
</template>
`,
    })
  })

  it('should be able to parse with script', () => {
    const result = scriptFrom(`
<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>

<template>
  <div>
    <h1>Hello, world!</h1>
    <p>Count: {{ count }}</p>
  </div>
</template>
`)

    expect(result).toMatchObject({
      script: `
import { ref } from 'vue'
const count = ref(0)
`,
      template: `


<template>
  <div>
    <h1>Hello, world!</h1>
    <p>Count: {{ count }}</p>
  </div>
</template>
`,
    })
  })
})
