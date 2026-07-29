import type { VelinTool } from './tool'

import { describe, expect, it } from 'vitest'
import { defineComponent, h, onServerPrefetch, ref } from 'vue'

import { defineTool, useToolContext, VelinToolInputError } from './tool'

/**
 * The tool contract of a runner that executes tools itself, transcribed from
 * `Tool` in `@xsai/shared-chat@0.5.0-beta.2`. It is repeated here rather than
 * imported so that this package stays free of SDK dependencies.
 *
 * NOTICE:
 * This exists to pin parameter variance. Function parameters are contravariant,
 * so declaring `execute`'s first parameter as anything narrower than `unknown`
 * — or requiring fields on its second — silently makes {@link VelinTool}
 * unassignable here, and the failure surfaces in the user's project rather than
 * in this one. `pnpm typecheck` covers this file, so the check is enforced.
 */
interface SdkTool {
  execute: (input: unknown, options: { abortSignal?: AbortSignal, messages: unknown[], toolCallId: string }) => Promise<object | string | unknown[]> | object | string | unknown[]
  function: { description?: string, name: string, parameters: Record<string, unknown>, strict?: boolean }
  type: 'function'
}

type AssertExtends<Expected, Actual extends Expected> = Actual

/** Fails `pnpm typecheck` if {@link VelinTool} stops satisfying {@link SdkTool}. */
export type ToolSatisfiesSdkContract = AssertExtends<SdkTool, VelinTool>

const GetWeather = defineComponent({
  name: 'get_weather',
  props: {
    city: { type: String, required: true, description: 'City to look up' },
    days: { type: Number },
  },
  setup: props => () => h('div', `Weather for ${props.city} over ${props.days ?? 1} day(s)`),
})

const NoProps = defineComponent({
  name: 'list_cities',
  setup: () => () => h('div', 'Tokyo, Osaka'),
})

describe('defineTool', () => {
  describe('descriptor', () => {
    it('should derive the argument schema from the component props', () => {
      const tool = defineTool(GetWeather)

      expect(tool.type).toBe('function')
      expect(tool.function.name).toBe('get_weather')
      expect(tool.function.parameters).toEqual({
        type: 'object',
        properties: {
          city: { type: 'string', description: 'City to look up' },
          days: { type: 'number' },
        },
        required: ['city'],
        additionalProperties: false,
      })
    })

    it('should let options override the component name and set a description', () => {
      const tool = defineTool(GetWeather, { name: 'weather', description: 'Get the weather.' })

      expect(tool.function.name).toBe('weather')
      expect(tool.function.description).toBe('Get the weather.')
    })

    it('should omit description when none is given', () => {
      expect('description' in defineTool(GetWeather).function).toBe(false)
    })

    it('should throw when no name can be derived', () => {
      const anonymous = defineComponent({ setup: () => () => h('div', 'hi') })
      expect(() => defineTool(anonymous)).toThrow(/Unable to derive a tool name/)
    })

    // Vue's own `getComponentName` reads `name` first and treats `__name` as
    // the inferred fallback, so `defineOptions({ name })` has to win.
    it('should prefer a declared name over the one inferred from the file', () => {
      const declared = Object.assign(
        defineComponent({
          name: 'get_weather',
          props: { city: { type: String, required: true } },
          setup: props => () => h('div', props.city),
        }),
        { __name: 'GetWeather' },
      )

      expect(defineTool(declared).function.name).toBe('get_weather')
    })

    // This repo names prompt components `*.velin.vue`, and the compiler infers
    // `Prompt.velin` from that — a dot, which providers reject.
    it('should throw when the derived name is not a usable tool name', () => {
      const dotted = Object.assign(
        defineComponent({ setup: () => () => h('div', 'hi') }),
        { __name: 'Prompt.velin' },
      )

      expect(() => defineTool(dotted)).toThrow(/cannot be used as a tool name/)
    })

    it('should accept array-declared props as named arguments', () => {
      const arrayProps = defineComponent({
        name: 'array_props',
        props: ['city'],
        setup: props => () => h('div', `Weather for ${props.city}`),
      })

      expect(defineTool(arrayProps).function.parameters).toEqual({
        type: 'object',
        properties: { city: {} },
        additionalProperties: false,
      })
    })

    // Shape emitted by the SFC compiler for
    // `defineProps<{ city: string, days?: number, when?: Date }>()`, which is
    // how a tool written as a `.vue` file arrives here.
    it('should read the name and props a single-file component compiles to', () => {
      const compiled = Object.assign(
        defineComponent({
          props: {
            city: { type: String, required: true },
            days: { type: Number, required: false },
            when: { type: Date, required: false },
          },
          setup: () => () => h('div', 'forecast'),
        }),
        // The compiler also emits `__name`, which `defineComponent`'s own types
        // do not model.
        { __name: 'get_forecast' },
      )

      const tool = defineTool(compiled)

      expect(tool.function.name).toBe('get_forecast')
      expect(tool.function.parameters).toEqual({
        type: 'object',
        properties: {
          city: { type: 'string' },
          days: { type: 'number' },
          // `Date` carries no JSON Schema equivalent, so it stays unconstrained.
          when: {},
        },
        required: ['city'],
        additionalProperties: false,
      })
    })

    // The enumerable fields are the OpenAI wire tool; `execute` is a function
    // and drops out of serialization on its own.
    it('should serialize to a wire tool object', () => {
      const tool = defineTool(NoProps, { description: 'List cities.' })

      expect(JSON.parse(JSON.stringify(tool))).toEqual({
        type: 'function',
        function: {
          name: 'list_cities',
          description: 'List cities.',
          parameters: { type: 'object', properties: {}, additionalProperties: false },
        },
      })
    })
  })

  describe('execute', () => {
    it('should render the component with the given arguments', async () => {
      const tool = defineTool(GetWeather)
      await expect(tool.execute({ city: 'Tokyo', days: 3 })).resolves.toBe('Weather for Tokyo over 3 day(s)\n')
    })

    // Every OpenAI-shaped API hands back `function.arguments` as a JSON string.
    it('should accept arguments as a JSON string', async () => {
      const tool = defineTool(GetWeather)
      await expect(tool.execute('{"city":"Osaka"}')).resolves.toBe('Weather for Osaka over 1 day(s)\n')
    })

    it('should treat empty input as no arguments', async () => {
      const tool = defineTool(NoProps)

      await expect(tool.execute()).resolves.toBe('Tokyo, Osaka\n')
      await expect(tool.execute('')).resolves.toBe('Tokyo, Osaka\n')
      await expect(tool.execute(null)).resolves.toBe('Tokyo, Osaka\n')
    })

    it('should await onServerPrefetch before returning', async () => {
      const Prefetching = defineComponent({
        name: 'forecast',
        props: { city: { type: String, required: true } },
        setup(props) {
          const forecast = ref('unresolved')
          onServerPrefetch(async () => {
            await new Promise(resolve => setTimeout(resolve, 5))
            forecast.value = `sunny in ${props.city}`
          })
          return () => h('div', `It is ${forecast.value}`)
        },
      })

      await expect(defineTool(Prefetching).execute({ city: 'Kyoto' })).resolves.toBe('It is sunny in Kyoto\n')
    })

    it('should expose the call context to the component', async () => {
      const controller = new AbortController()
      const Contextual = defineComponent({
        name: 'contextual',
        setup() {
          const { toolCallId } = useToolContext()
          return () => h('div', `call ${toolCallId}`)
        },
      })

      const rendered = await defineTool(Contextual).execute(undefined, {
        toolCallId: 'call-1',
        abortSignal: controller.signal,
      })
      expect(rendered).toBe('call call-1\n')
    })

    it('should reject when the call was already aborted', async () => {
      const controller = new AbortController()
      controller.abort()

      await expect(defineTool(NoProps).execute(undefined, { abortSignal: controller.signal })).rejects.toThrow()
    })
  })

  describe('argument validation', () => {
    it('should throw when a required argument is missing', async () => {
      await expect(defineTool(GetWeather).execute({ days: 2 })).rejects.toThrow(VelinToolInputError)
    })

    it('should report every problem in one error', async () => {
      const error = await defineTool(GetWeather).execute({ days: 'three' }).catch((e: unknown) => e)

      expect(error).toBeInstanceOf(VelinToolInputError)
      expect((error as VelinToolInputError).issues).toEqual([
        'missing required argument "city"',
        'argument "days" should be number, received string',
      ])
    })

    it('should throw when the arguments are not valid JSON', async () => {
      await expect(defineTool(GetWeather).execute('{"city":')).rejects.toThrow(/not valid JSON/)
    })

    it('should throw when the arguments are not an object', async () => {
      await expect(defineTool(GetWeather).execute('["Tokyo"]')).rejects.toThrow(/must be a JSON object/)
    })

    it('should render array-declared props from the model arguments', async () => {
      const arrayProps = defineComponent({
        name: 'array_props',
        props: ['city'],
        setup: props => () => h('div', `Weather for ${props.city}`),
      })

      await expect(defineTool(arrayProps).execute({ city: 'Tokyo' })).resolves.toBe('Weather for Tokyo\n')
    })

    // Arguments are read as own properties only. Otherwise a prop named after
    // an `Object.prototype` member picks up the inherited function, and the
    // model is told its `toString` argument "should be string, received
    // function" — a complaint no argument it sends can resolve.
    //
    // Only the reported issue is velin's to fix: Vue itself cannot deliver a
    // prop named `toString` to `props.toString`, so such a prop is unusable
    // regardless of what is passed.
    it('should not mistake prototype members for supplied arguments', async () => {
      const shadowing = defineComponent({
        name: 'shadowing',
        props: { toString: { type: String, required: true } },
        setup: () => () => h('div', 'rendered'),
      })

      const error = await defineTool(shadowing).execute({}).catch((e: unknown) => e)
      expect((error as VelinToolInputError).issues).toEqual(['missing required argument "toString"'])
    })

    it('should treat JSON null as no arguments', async () => {
      await expect(defineTool(NoProps).execute('null')).resolves.toBe('Tokyo, Osaka\n')
    })

    it('should let an omitted optional argument fall back to the prop default', async () => {
      const WithDefault = defineComponent({
        name: 'with_default',
        props: { unit: { type: String, default: 'celsius' } },
        setup: props => () => h('div', `unit ${props.unit}`),
      })

      await expect(defineTool(WithDefault).execute({})).resolves.toBe('unit celsius\n')
    })

    // A model that invents an undeclared argument would otherwise have it fall
    // through as an attribute on the root element, which `toMarkdown` then
    // renders into the very result being fed back to the model.
    it('should drop undeclared arguments instead of rendering them', async () => {
      const Anchor = defineComponent({
        name: 'anchor_tool',
        props: { city: { type: String, required: true } },
        setup: props => () => h('a', `Weather for ${props.city}`),
      })

      const tool = defineTool(Anchor)
      const injected = await tool.execute({ city: 'Tokyo', href: 'https://attacker.example/steal' })

      expect(injected).not.toContain('attacker.example')
      // Identical to the result the same call produces without the extra key.
      expect(injected).toBe(await tool.execute({ city: 'Tokyo' }))
    })
  })
})
