import type { App, ComponentInternalInstance, DefineComponent } from 'vue'

export interface ComponentPropText {
  type: 'string'
  value?: string
}

export interface ComponentPropBool {
  type: 'boolean'
  value?: boolean
}

export interface ComponentPropNumber {
  type: 'number'
  value?: number
}

export interface ComponentPropUnknown {
  type: 'unknown'
  value?: unknown
}

export type ComponentProp = (ComponentPropText | ComponentPropBool | ComponentPropNumber | ComponentPropUnknown) & {
  title: string
  key: string
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

function inferType(propDef:
  | {
    // eslint-disable-next-line ts/no-unsafe-function-type
    type: Function
  }
  | typeof String
  | typeof Number
  | typeof Boolean
  | unknown) {
  let type: 'unknown' | 'string' | 'number' | 'boolean' = 'unknown'
  if (willTurnIntoString(propDef)) {
    type = 'string'
  }
  else if (willTurnIntoNumber(propDef)) {
    type = 'number'
  }
  else if (willTurnIntoBoolean(propDef)) {
    type = 'boolean'
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
      }
    })
  }
  else if ((component as unknown as ComponentInternalInstance).props && typeof (component as unknown as ComponentInternalInstance).props === 'object') {
    return Object.entries((component as unknown as ComponentInternalInstance).props).map(([key, propDef]) => {
      return {
        key,
        title: key,
        type: inferType(propDef),
      }
    })
  }
  else {
    return []
  }
}
