import type { App, ComponentInternalInstance, DefineComponent } from 'vue'

import type { InputProps } from '../types'

export interface ComponentPropText {
  type: 'string'
  value?: string
  required?: boolean
}

export interface ComponentPropBool {
  type: 'boolean'
  value?: boolean
  required?: boolean
}

export interface ComponentPropNumber {
  type: 'number'
  value?: number
  required?: boolean
}

export interface ComponentPropUnknown {
  type: 'unknown'
  value?: unknown
  required?: boolean
}

export interface ComponentPropArray {
  type: 'array'
  value?: unknown[]
  required?: boolean
}

export type ComponentProp = (ComponentPropText | ComponentPropBool | ComponentPropNumber | ComponentPropArray | ComponentPropUnknown) & {
  title: string
  key: string
  required?: boolean
}

function willTurnIntoNumber(value: unknown): boolean {
  if (value === Number) {
    return true
  }

  // it is possible value is { type: Number() }
  if (typeof value === 'object' && value !== null && 'type' in value) {
    // check if value.type is Number()
    if (typeof (value as { type: unknown }).type === 'function' && (value as { type: unknown }).type === Number) {
      return true
    }
  }

  return false
}

function willTurnIntoBoolean(value: unknown): boolean {
  if (value === Boolean) {
    return true
  }

  // it is possible value is { type: Boolean() }
  if (typeof value === 'object' && value !== null && 'type' in value) {
    // check if value.type is Boolean()
    if (typeof (value as { type: unknown }).type === 'function' && (value as { type: unknown }).type === Boolean) {
      return true
    }
  }

  return false
}

function willTurnIntoString(value: unknown): boolean {
  if (value === String) {
    return true
  }

  // it is possible value is { type: String() }
  if (typeof value === 'object' && value !== null && 'type' in value) {
    // check if value.type is String()
    if (typeof (value as { type: unknown }).type === 'function' && (value as { type: unknown }).type === String) {
      return true
    }
  }

  return false
}

function willTurnIntoArray(value: unknown): boolean {
  if (value === Array) {
    return true
  }

  // it is possible value is { type: Array() }
  if (typeof value === 'object' && value !== null && 'type' in value) {
    // check if value.type is Array()
    if (typeof (value as { type: unknown }).type === 'function' && (value as { type: unknown }).type === Array) {
      return true
    }
  }

  return false
}

function inferType(
  propDef:
    | {
    // eslint-disable-next-line ts/no-unsafe-function-type
      type: Function
    }
    | typeof String
    | typeof Number
    | typeof Boolean
    | typeof Array
    | unknown,
) {
  let type: 'unknown' | 'string' | 'number' | 'boolean' | 'array' = 'unknown'
  if (willTurnIntoString(propDef)) {
    type = 'string'
  }
  else if (willTurnIntoNumber(propDef)) {
    type = 'number'
  }
  else if (willTurnIntoBoolean(propDef)) {
    type = 'boolean'
  }
  else if (willTurnIntoArray(propDef)) {
    type = 'array'
  }
  return type
}

/**
 * @see https://github.com/vuejs/devtools/blob/e7dffa24fe98b212404a1451818b6c66739f88ee/packages/devtools-kit/src/core/component/state/process.ts#L62
 * @see https://github.com/vuejs/devtools/blob/e7dffa24fe98b212404a1451818b6c66739f88ee/packages/devtools-kit/src/core/app/index.ts#L14
 *
 * @param component
 */
export function resolveProps(component: DefineComponent | App<any>): ComponentProp[] {
  if (component._component && component._component.props && typeof component._component.props === 'object') {
    return Object.entries(component._component.props).map(([key, propDef]) => {
      return {
        key,
        title: key,
        type: inferType(propDef),
        required: propDef != null && typeof propDef === 'object' && 'required' in propDef ? (propDef as { required?: boolean }).required : false,
      }
    })
  }
  else if ((component as unknown as ComponentInternalInstance).props && typeof (component as unknown as ComponentInternalInstance).props === 'object') {
    return Object.entries((component as unknown as ComponentInternalInstance).props).map(([key, propDef]) => {
      return {
        key,
        title: key,
        type: inferType(propDef),
        required: propDef != null && typeof propDef === 'object' && 'required' in propDef ? (propDef as { required?: boolean }).required : false,
      }
    })
  }
  else {
    return []
  }
}

export function normalizeProps<RawProps = any>(resolvedProps: ComponentProp[], data?: InputProps<RawProps> | null): InputProps<RawProps> {
  const normalizedData: InputProps<RawProps> = data || {} as InputProps<RawProps>

  resolvedProps.forEach((prop) => {
    if (prop.required) {
      const keyData = prop.key as keyof typeof normalizedData

      if (!normalizedData || normalizedData[keyData] == null) {
        if (prop.type === 'string') {
          ;(normalizedData[keyData] as any) = ''
        }
        else if (prop.type === 'boolean') {
          ;(normalizedData[keyData] as any) = false
        }
        else if (prop.type === 'number') {
          ;(normalizedData[keyData] as any) = 0
        }
        else if (prop.type === 'array') {
          ;(normalizedData[keyData] as any) = []
        }
      }
    }
  })

  return normalizedData
}
