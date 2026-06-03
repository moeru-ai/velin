import type { ComponentType, ReactElement } from 'react'

import { toMarkdown } from '@velin-dev/utils/to-md'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

type RenderComponentArgs<Props extends object> = Record<never, never> extends Props
  ? [props?: Props]
  : [props: Props]

export async function renderElement(element: ReactElement): Promise<string> {
  return await toMarkdown(renderToStaticMarkup(element))
}

export async function renderComponent<Props extends object = Record<never, never>>(
  component: ComponentType<Props>,
  ...args: RenderComponentArgs<Props>
): Promise<string> {
  const props = (args[0] ?? {}) as Props
  return await renderElement(createElement(component, props))
}
