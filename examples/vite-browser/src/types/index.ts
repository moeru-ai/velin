export interface CompoText {
  type: 'text'
  value?: string
}

export interface CompoBool {
  type: 'switch'
  value?: boolean
}

export type Component = (CompoText | CompoBool) & {
  title: string
}
