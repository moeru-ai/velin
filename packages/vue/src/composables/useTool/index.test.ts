import { describe, expect, it } from 'vitest'
import { defineComponent, h, onServerPrefetch, ref } from 'vue'

import { useTool } from './'

const GetWeather = defineComponent({
  name: 'get_weather',
  props: { city: { type: String, required: true } },
  setup: props => () => h('div', `Weather for ${props.city}`),
})

describe('useTool', () => {
  it('should expose the derived tool descriptor', () => {
    const tool = useTool(GetWeather, { description: 'Get the weather.' })

    expect(tool.type).toBe('function')
    expect(tool.function.name).toBe('get_weather')
    expect(tool.function.description).toBe('Get the weather.')
    expect(tool.function.parameters).toEqual({
      type: 'object',
      properties: { city: { type: 'string' } },
      required: ['city'],
      additionalProperties: false,
    })
  })

  it('should render the component when called', async () => {
    const tool = useTool(GetWeather)
    await expect(tool.execute({ city: 'Tokyo' })).resolves.toBe('Weather for Tokyo\n')
  })

  it('should report pending while a call is in flight', async () => {
    const Slow = defineComponent({
      name: 'slow_tool',
      setup() {
        const done = ref(false)
        onServerPrefetch(async () => {
          await new Promise(resolve => setTimeout(resolve, 5))
          done.value = true
        })
        return () => h('div', `done ${done.value}`)
      },
    })

    const tool = useTool(Slow)
    expect(tool.pending.value).toBe(false)

    const call = tool.execute()
    expect(tool.pending.value).toBe(true)

    await call
    expect(tool.pending.value).toBe(false)
  })

  // Runners execute a turn's tool calls with `Promise.all`, and a model may
  // call the same tool more than once, so both calls share this tool object.
  it('should stay pending until the last concurrent call settles', async () => {
    const Delayed = defineComponent({
      name: 'delayed_tool',
      props: { ms: { type: Number, required: true } },
      setup(props) {
        const done = ref(false)
        onServerPrefetch(async () => {
          await new Promise(resolve => setTimeout(resolve, props.ms))
          done.value = true
        })
        return () => h('div', `done ${done.value}`)
      },
    })

    const tool = useTool(Delayed)
    const short = tool.execute({ ms: 1 })
    const long = tool.execute({ ms: 40 })

    await short
    expect(tool.pending.value).toBe(true)

    await long
    expect(tool.pending.value).toBe(false)
  })

  it('should clear pending when a call fails', async () => {
    const tool = useTool(GetWeather)

    await expect(tool.execute({})).rejects.toThrow()
    expect(tool.pending.value).toBe(false)
  })

  // `pending` is a Ref: it must never travel to a provider alongside the
  // tool's name and parameters.
  it('should keep pending out of the serialized tool', () => {
    const tool = useTool(GetWeather)

    expect(Object.keys(tool)).not.toContain('pending')
    expect(JSON.parse(JSON.stringify(tool))).toEqual({
      type: 'function',
      function: {
        name: 'get_weather',
        parameters: {
          type: 'object',
          properties: { city: { type: 'string' } },
          required: ['city'],
          additionalProperties: false,
        },
      },
    })
  })
})
