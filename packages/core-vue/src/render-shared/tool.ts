import type { ComponentPropsOptions, InjectionKey } from 'vue'

import type {
  RenderComponentInputComponent,
  ResolveRenderComponentInputProps,
} from '../types'
import type { ComponentProp } from './props'

import { toMarkdown } from '@velin-dev/utils/to-md'
import { renderToString } from '@vue/server-renderer'
import { inject } from 'vue'

import { onlyRender } from './component'
import { propsToJsonSchema } from './json-schema'
import { resolveProps } from './props'

/**
 * Call-time context handed to a tool component while it renders.
 *
 * NOTICE:
 * Every field is optional on purpose. Tool-calling SDKs declare their own,
 * stricter execute options (`@xsai/shared-chat`'s `ToolExecuteOptions` requires
 * `messages` and `toolCallId`), and function parameters are contravariant — a
 * narrower parameter type here would make {@link VelinTool} unassignable to
 * those SDKs' tool types. Do not tighten these.
 */
export interface VelinToolExecuteOptions {
  abortSignal?: AbortSignal
  messages?: unknown[]
  toolCallId?: string
}

export const velinToolContextKey: InjectionKey<VelinToolExecuteOptions> = Symbol('velin-tool-context')

/**
 * Reads the context of the tool call currently rendering the component, so a
 * component can pass `abortSignal` to whatever it fetches inside
 * `onServerPrefetch`. Returns an empty object when the component is rendered
 * outside of a tool call.
 */
export function useToolContext(): VelinToolExecuteOptions {
  return inject(velinToolContextKey, {})
}

/**
 * A prompt component exposed as an LLM tool.
 *
 * The enumerable fields are exactly the OpenAI Chat Completions tool object, so
 * `JSON.stringify(tool)` is a valid wire payload — `execute` is a function and
 * is dropped by serialization. Runners that execute tools themselves (xsai,
 * among others) call `execute` directly.
 */
export interface VelinTool {
  type: 'function'
  function: {
    name: string
    description?: string
    parameters: Record<string, unknown>
  }
  execute: (input?: unknown, options?: VelinToolExecuteOptions) => Promise<string>
}

export interface DefineToolOptions {
  /**
   * Name the model calls. Defaults to the component's own name, which Vue's SFC
   * compiler derives from the file name.
   */
  name?: string
  /** What the tool does. Written for the model, not for the reader of the code. */
  description?: string
}

/** Thrown when a tool call's arguments cannot be used to render the component. */
export class VelinToolInputError extends Error {
  readonly toolName: string
  /** Every problem found, so one error can correct the model in a single turn. */
  readonly issues: string[]

  constructor(toolName: string, issues: string[]) {
    super(`Tool "${toolName}" received invalid arguments: ${issues.join('; ')}`)
    this.name = 'VelinToolInputError'
    this.toolName = toolName
    this.issues = issues
  }
}

/**
 * Providers accept tool names matching this and reject the rest, so a name that
 * cannot be called is caught while defining the tool rather than on the first
 * request.
 */
const TOOL_NAME_PATTERN = /^[\w-]{1,64}$/

function resolveToolName(component: RenderComponentInputComponent<any>, name?: string): string {
  // Declared name first, inferred name second — the order Vue's own
  // `getComponentName` uses, so `defineOptions({ name })` wins over the name
  // the SFC compiler derives from the file.
  const resolved = name
    ?? (component as { name?: string }).name
    ?? (component as { __name?: string }).__name

  if (!resolved) {
    throw new Error(
      'Unable to derive a tool name from the component. Pass `name` to defineTool, '
      + 'or declare one with defineOptions({ name }): components created with '
      + '`defineComponent` carry no name unless one is given, while single-file '
      + 'components are named after their file.',
    )
  }

  if (!TOOL_NAME_PATTERN.test(resolved)) {
    // Reached by this repo's own `*.velin.vue` convention, whose inferred name
    // keeps the extra dotted segment. Rewriting it silently would change the
    // name a model is told to call, so say so instead.
    throw new Error(
      `"${resolved}" cannot be used as a tool name: providers only accept up to 64 characters `
      + 'of letters, digits, underscores and hyphens. Pass `name` to defineTool, '
      + 'or declare one with defineOptions({ name }).',
    )
  }

  return resolved
}

/**
 * Parses what a provider handed back for a tool call into an arguments object.
 *
 * OpenAI-shaped APIs deliver `tool_call.function.arguments` as a JSON *string*,
 * so accepting one here removes the `JSON.parse` every caller would otherwise
 * write — including its error handling, which is the part that usually gets
 * skipped.
 */
function parseToolInput(toolName: string, input: unknown): Record<string, unknown> {
  if (input == null || input === '')
    return {}

  let value = input
  if (typeof input === 'string') {
    try {
      value = JSON.parse(input)
    }
    catch {
      throw new VelinToolInputError(toolName, ['arguments are not valid JSON'])
    }
  }

  // JSON `null` says the same thing as the `null` accepted above.
  if (value == null)
    return {}

  if (typeof value !== 'object' || Array.isArray(value))
    throw new VelinToolInputError(toolName, ['arguments must be a JSON object'])

  return value as Record<string, unknown>
}

function describeType(value: unknown): string {
  return Array.isArray(value) ? 'array' : typeof value
}

function matchesPropType(prop: ComponentProp, value: unknown): boolean {
  switch (prop.type) {
    case 'string':
      return typeof value === 'string'
    case 'number':
      return typeof value === 'number' && Number.isFinite(value)
    case 'boolean':
      return typeof value === 'boolean'
    case 'array':
      return Array.isArray(value)
    default:
      // Nothing was derivable about the prop's type, so nothing can be checked.
      return true
  }
}

/**
 * Narrows a tool call's arguments to the props the component actually declares.
 *
 * NOTICE:
 * Dropping undeclared keys is a safety property, not tidiness. Vue funnels
 * undeclared root props into fallthrough attributes, and `renderToString`
 * serializes them before `toMarkdown` runs — so a model that invents an `href`
 * on a component whose root element is an anchor turns its own tool result into
 * `[text](https://attacker.example)`, which is then fed back to it. Verified
 * against this repo's renderer.
 *
 * Missing and mistyped values are reported instead of being rendered: a
 * confidently wrong tool result is worse for a model than an error it can act
 * on, because it will build on the wrong answer.
 */
function pickDeclaredProps(toolName: string, props: ComponentProp[], args: Record<string, unknown>): Record<string, unknown> {
  const picked: Record<string, unknown> = {}
  const issues: string[] = []

  for (const prop of props) {
    // Own properties only: a prop named after an `Object.prototype` member
    // (`toString`, `constructor`) would otherwise pick up the inherited value
    // and render it, or fail a type check the model cannot possibly satisfy.
    const value = Object.hasOwn(args, prop.key) ? args[prop.key] : undefined

    if (value == null) {
      if (prop.required)
        issues.push(`missing required argument "${prop.key}"`)
      // Otherwise leave the key out entirely so the prop's own default applies.
      continue
    }

    if (!matchesPropType(prop, value)) {
      issues.push(`argument "${prop.key}" should be ${prop.type}, received ${describeType(value)}`)
      continue
    }

    picked[prop.key] = value
  }

  if (issues.length > 0)
    throw new VelinToolInputError(toolName, issues)

  return picked
}

/**
 * Turns a prompt component into a tool an LLM can call: its props become the
 * argument schema, and rendering it with the model's arguments produces the
 * result.
 *
 * Because rendering goes through Vue's server renderer, a component may load
 * what it needs in `onServerPrefetch` (or an async `setup`) and the rendered
 * markdown will already include it.
 *
 * @example
 * ```ts
 * import GetWeather from './GetWeather.vue'
 *
 * const tool = defineTool(GetWeather, { description: 'Get the weather for a city.' })
 *
 * // tool.function.parameters -> { type: 'object', properties: { city: { type: 'string' } }, ... }
 * const result = await tool.execute('{"city":"Tokyo"}')
 * ```
 */
export function defineTool<
  RawProps = any,
  ComponentProps = ComponentPropsOptions<RawProps>,
  ResolvedProps = ResolveRenderComponentInputProps<RawProps, ComponentProps>,
>(
  component: RenderComponentInputComponent<ResolvedProps>,
  options?: DefineToolOptions,
): VelinTool {
  // The generics exist to keep call sites inferring like `renderComponent` and
  // `usePrompt`; nothing below is prop-shape specific, so widen once here
  // rather than threading the parameter through every helper.
  const target = component as RenderComponentInputComponent<any>

  const props = resolveProps(target)
  const name = resolveToolName(target, options?.name)

  const fn: VelinTool['function'] = {
    name,
    parameters: propsToJsonSchema(props),
  }
  if (options?.description)
    fn.description = options.description

  return {
    type: 'function',
    function: fn,
    execute: async (input, executeOptions) => {
      const args = pickDeclaredProps(name, props, parseToolInput(name, input))

      // Fail before rendering rather than after: a component's own fetch may
      // ignore the signal, and there is nothing to return once it has run.
      executeOptions?.abortSignal?.throwIfAborted()

      const app = onlyRender(target, args)
      // Provided rather than passed as a prop so it never reaches the template
      // or collides with a declared prop name.
      app.provide(velinToolContextKey, executeOptions ?? {})

      return toMarkdown(await renderToString(app))
    },
  }
}
