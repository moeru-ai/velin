export interface CompoText {
  type: 'string'
  value?: string
}

export interface CompoBool {
  type: 'boolean'
  value?: boolean
}

export interface CompoNumber {
  type: 'number'
  value?: number
}

export type Component = (CompoText | CompoBool | CompoNumber) & {
  title: string
  key: string
}
