declare module '*.velin.md' {
  import type { MaybeRef } from 'vue'

  const content: <T extends MaybeRef<any>>(...args: T[]) => string
  export default content
}
