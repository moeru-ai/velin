import type { ComponentProp } from './props'

/**
 * JSON Schema describing the arguments of a prompt component used as an LLM
 * tool.
 *
 * NOTICE:
 * Declared as a type alias rather than an interface on purpose. TypeScript
 * grants an implicit index signature to object type aliases but not to
 * interfaces, and without one this is not assignable to the
 * `Record<string, unknown>` that tool-calling SDKs declare for the parameters
 * field (for example `Tool['function']['parameters']` in `@xsai/shared-chat`).
 * Switching this to an interface compiles here and breaks at every call site.
 */
// eslint-disable-next-line ts/consistent-type-definitions
export type JsonSchema = {
  type: 'object'
  properties: Record<string, Record<string, unknown>>
  required?: string[]
  additionalProperties: false
}

function schemaForProp(prop: ComponentProp): Record<string, unknown> {
  switch (prop.type) {
    case 'string':
      return { type: 'string' }
    case 'number':
      // Vue's `Number` is a double; a component that wants an integer says so
      // through its own description rather than having it guessed here.
      return { type: 'number' }
    case 'boolean':
      return { type: 'boolean' }
    case 'array':
      // The element type is not recoverable from a runtime `Array` constructor,
      // and `items` is required for an array schema to be well-formed.
      return { type: 'array', items: {} }
    case 'unknown':
    default:
      // `Object`, `Date`, custom classes and union constructors all arrive as
      // `unknown`. An empty schema accepts any value, which is exactly what the
      // component itself does with such a prop.
      return {}
  }
}

/**
 * Derives the tool argument schema from a prompt component's resolved props.
 *
 * Before:
 * - `[{ key: 'city', title: 'city', type: 'string', required: true }]`
 *
 * After:
 * - `{ type: 'object', properties: { city: { type: 'string' } }, required: ['city'], additionalProperties: false }`
 */
export function propsToJsonSchema(props: ComponentProp[]): JsonSchema {
  const properties: Record<string, Record<string, unknown>> = {}
  const required: string[] = []

  for (const prop of props) {
    const propSchema = schemaForProp(prop)
    if (prop.description)
      propSchema.description = prop.description

    // `title` is deliberately not emitted: `resolveProps` always sets it equal
    // to the key, so it would only repeat the property name back to the model.
    properties[prop.key] = propSchema

    if (prop.required)
      required.push(prop.key)
  }

  const schema: JsonSchema = {
    type: 'object',
    properties,
    // Undeclared arguments are dropped before rendering, so advertising that
    // up front stops the model from inventing them in the first place.
    additionalProperties: false,
  }

  // Omitted rather than sent as `[]`: JSON Schema draft-04 requires `required`
  // to hold at least one entry, and some provider-side validators enforce it.
  if (required.length > 0)
    schema.required = required

  return schema
}
