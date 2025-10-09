import { describe, expect, it } from 'vitest'

import { resolveProps } from './props'

describe('resolveProps', () => {
  describe('string type', () => {
    it('should resolve String constructor as string type', () => {
      const component = {
        _component: {
          props: {
            name: String,
          },
        },
      }
      const props = resolveProps(component as any)
      expect(props).toEqual([
        { key: 'name', title: 'name', type: 'string' },
      ])
    })

    it('should resolve { type: String } as string type', () => {
      const component = {
        _component: {
          props: {
            name: { type: String },
          },
        },
      }
      const props = resolveProps(component as any)
      expect(props).toEqual([
        { key: 'name', title: 'name', type: 'string' },
      ])
    })
  })

  describe('number type', () => {
    it('should resolve Number constructor as number type', () => {
      const component = {
        _component: {
          props: {
            age: Number,
          },
        },
      }
      const props = resolveProps(component as any)
      expect(props).toEqual([
        { key: 'age', title: 'age', type: 'number' },
      ])
    })

    it('should resolve { type: Number } as number type', () => {
      const component = {
        _component: {
          props: {
            age: { type: Number },
          },
        },
      }
      const props = resolveProps(component as any)
      expect(props).toEqual([
        { key: 'age', title: 'age', type: 'number' },
      ])
    })
  })

  describe('boolean type', () => {
    it('should resolve Boolean constructor as boolean type', () => {
      const component = {
        _component: {
          props: {
            active: Boolean,
          },
        },
      }
      const props = resolveProps(component as any)
      expect(props).toEqual([
        { key: 'active', title: 'active', type: 'boolean' },
      ])
    })

    it('should resolve { type: Boolean } as boolean type', () => {
      const component = {
        _component: {
          props: {
            active: { type: Boolean },
          },
        },
      }
      const props = resolveProps(component as any)
      expect(props).toEqual([
        { key: 'active', title: 'active', type: 'boolean' },
      ])
    })
  })

  describe('array type', () => {
    it('should resolve Array constructor as array type', () => {
      const component = {
        _component: {
          props: {
            items: Array,
          },
        },
      }
      const props = resolveProps(component as any)
      expect(props).toEqual([
        { key: 'items', title: 'items', type: 'array' },
      ])
    })

    it('should resolve { type: Array } as array type', () => {
      const component = {
        _component: {
          props: {
            items: { type: Array },
          },
        },
      }
      const props = resolveProps(component as any)
      expect(props).toEqual([
        { key: 'items', title: 'items', type: 'array' },
      ])
    })

    it('should resolve { type: Array, default: () => [] } as array type', () => {
      const component = {
        _component: {
          props: {
            items: { type: Array, default: () => [] },
          },
        },
      }
      const props = resolveProps(component as any)
      expect(props).toEqual([
        { key: 'items', title: 'items', type: 'array' },
      ])
    })
  })

  describe('mixed types', () => {
    it('should resolve multiple props with different types', () => {
      const component = {
        _component: {
          props: {
            name: String,
            age: Number,
            active: Boolean,
            tags: Array,
          },
        },
      }
      const props = resolveProps(component as any)
      expect(props).toEqual([
        { key: 'name', title: 'name', type: 'string' },
        { key: 'age', title: 'age', type: 'number' },
        { key: 'active', title: 'active', type: 'boolean' },
        { key: 'tags', title: 'tags', type: 'array' },
      ])
    })

    it('should resolve props from ComponentInternalInstance', () => {
      const component = {
        props: {
          name: String,
          items: Array,
        },
      }
      const props = resolveProps(component as any)
      expect(props).toEqual([
        { key: 'name', title: 'name', type: 'string' },
        { key: 'items', title: 'items', type: 'array' },
      ])
    })
  })

  describe('unknown type', () => {
    it('should resolve unknown constructor as unknown type', () => {
      const component = {
        _component: {
          props: {
            custom: Object,
          },
        },
      }
      const props = resolveProps(component as any)
      expect(props).toEqual([
        { key: 'custom', title: 'custom', type: 'unknown' },
      ])
    })
  })

  describe('empty props', () => {
    it('should return empty array when no props defined', () => {
      const component = {}
      const props = resolveProps(component as any)
      expect(props).toEqual([])
    })

    it('should return empty array when props is null', () => {
      const component = {
        _component: {
          props: null,
        },
      }
      const props = resolveProps(component as any)
      expect(props).toEqual([])
    })
  })
})
