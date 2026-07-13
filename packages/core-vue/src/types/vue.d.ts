declare module '*.vue' {
  import type { DefineComponent } from '@vue/runtime-core'

  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, any>
  export default component
}
