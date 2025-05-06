import type { App, ComponentInternalInstance, DefineComponent } from 'vue'

/**
 * @see https://github.com/vuejs/devtools/blob/e7dffa24fe98b212404a1451818b6c66739f88ee/packages/devtools-kit/src/core/component/state/process.ts#L62
 * @see https://github.com/vuejs/devtools/blob/e7dffa24fe98b212404a1451818b6c66739f88ee/packages/devtools-kit/src/core/app/index.ts#L14
 *
 * @param component
 */
export function resolveProps(component: DefineComponent | App<any>) {
  if (component._component && component._component.props && typeof component._component.props === 'object') {
    return Object.entries(component._component.props).map(([key, value]) => {
      return {
        key,
        type: value === Number
          ? 'number'
          : value === String
            ? 'string'
            : value === Boolean
              ? 'boolean'
              : 'unknown',
      }
    })
  }
  else if ((component as unknown as ComponentInternalInstance).props && typeof (component as unknown as ComponentInternalInstance).props === 'object') {
    return Object.entries((component as unknown as ComponentInternalInstance).props).map(([key, value]) => {
      const propDef = value as {
        // eslint-disable-next-line ts/no-unsafe-function-type
        type: Function
      }

      return {
        key,
        type: propDef.type === Number
          ? 'number'
          : propDef.type === String
            ? 'string'
            : propDef.type === Boolean
              ? 'boolean'
              : 'unknown',
      }
    })
  }
  else {
    return []
  }
}
