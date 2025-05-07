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

export interface CompoUnknown {
  type: 'unknown'
  value?: unknown
}

export type Component = (CompoText | CompoBool | CompoNumber | CompoUnknown) & {
  title: string
  key: string
}
