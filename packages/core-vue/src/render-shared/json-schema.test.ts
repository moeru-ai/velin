import type { ComponentProp } from './props'

import { describe, expect, it } from 'vitest'

import { propsToJsonSchema } from './json-schema'

function prop(partial: Partial<ComponentProp> & { key: string }): ComponentProp {
  return { title: partial.key, type: 'string', required: false, ...partial } as ComponentProp
}

describe('propsToJsonSchema', () => {
  describe('scalar types', () => {
    it('should map a string prop to a string schema', () => {
      const schema = propsToJsonSchema([prop({ key: 'city', type: 'string' })])
      expect(schema.properties).toEqual({ city: { type: 'string' } })
    })

    it('should map a number prop to a number schema', () => {
      const schema = propsToJsonSchema([prop({ key: 'days', type: 'number' })])
      expect(schema.properties).toEqual({ days: { type: 'number' } })
    })

    it('should map a boolean prop to a boolean schema', () => {
      const schema = propsToJsonSchema([prop({ key: 'metric', type: 'boolean' })])
      expect(schema.properties).toEqual({ metric: { type: 'boolean' } })
    })
  })

  describe('array type', () => {
    it('should map an array prop to an array schema with an unconstrained items', () => {
      const schema = propsToJsonSchema([prop({ key: 'tags', type: 'array' })])
      expect(schema.properties).toEqual({ tags: { type: 'array', items: {} } })
    })
  })

  describe('unknown type', () => {
    it('should map an unknown prop to an empty schema that accepts any value', () => {
      const schema = propsToJsonSchema([prop({ key: 'payload', type: 'unknown' })])
      expect(schema.properties).toEqual({ payload: {} })
    })
  })

  describe('required', () => {
    it('should collect required keys in declaration order', () => {
      const schema = propsToJsonSchema([
        prop({ key: 'city', required: true }),
        prop({ key: 'unit' }),
        prop({ key: 'days', type: 'number', required: true }),
      ])
      expect(schema.required).toEqual(['city', 'days'])
    })

    // An empty `required` is invalid under JSON Schema draft-04, and some
    // providers still validate against it.
    it('should omit required entirely when no prop is required', () => {
      const schema = propsToJsonSchema([prop({ key: 'city' })])
      expect('required' in schema).toBe(false)
    })
  })

  describe('description', () => {
    it('should carry a prop description into the property schema', () => {
      const schema = propsToJsonSchema([prop({ key: 'city', description: 'City to look up, e.g. Tokyo' })])
      expect(schema.properties).toEqual({ city: { type: 'string', description: 'City to look up, e.g. Tokyo' } })
    })

    it('should omit description when the prop has none', () => {
      const schema = propsToJsonSchema([prop({ key: 'city' })])
      expect(schema.properties.city).toEqual({ type: 'string' })
    })
  })

  describe('envelope', () => {
    // Providers reject a tool whose parameters are not an object schema, so
    // this shape has to hold even when there is nothing to describe.
    it('should emit an empty object schema for a component with no props', () => {
      expect(propsToJsonSchema([])).toEqual({
        type: 'object',
        properties: {},
        additionalProperties: false,
      })
    })

    it('should always disallow additional properties', () => {
      const schema = propsToJsonSchema([prop({ key: 'city' })])
      expect(schema.additionalProperties).toBe(false)
    })

    // `resolveProps` sets title === key, so emitting it would only repeat the
    // property name back to the model.
    it('should not emit title', () => {
      const schema = propsToJsonSchema([prop({ key: 'city' })])
      expect('title' in schema.properties.city).toBe(false)
    })
  })
})
