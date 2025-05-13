import { describe, expect, it } from 'vitest'

import { transformTS } from './transform'

describe('transformTS', async () => {
  it('should transform TS', () => {
    const result = transformTS(`import { defineComponent as _defineComponent } from 'vue'\nimport { toDisplayString as _toDisplayString, createElementVNode as _createElementVNode, unref as _unref, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue"\n\nimport { useCounter } from '@vueuse/core'\n\n\nexport default /*@__PURE__*/_defineComponent({\n  props: {\n  text: String,\n  number: Number,\n  check: Boolean,\n},\n  setup(__props) {\n\n\n\nconst { count } = useCounter()\n\nreturn (_ctx: any,_cache: any) => {\n  return (_openBlock(), _createElementBlock("div", null, [\n    _createElementVNode("div", null, _toDisplayString(__props.text), 1 /* TEXT */),\n    _createElementVNode("div", null, _toDisplayString(__props.number), 1 /* TEXT */),\n    _createElementVNode("div", null, _toDisplayString(__props.check), 1 /* TEXT */),\n    _createElementVNode("div", null, "Internal count: " + _toDisplayString(_unref(count)), 1 /* TEXT */)\n  ]))\n}\n}\n\n})`)
    expect(result).toBeDefined()
    expect(result).toEqual(`import { defineComponent as _defineComponent } from 'vue'\nimport { toDisplayString as _toDisplayString, createElementVNode as _createElementVNode, unref as _unref, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue"\n\nimport { useCounter } from '@vueuse/core'\n\n\nexport default /*@__PURE__*/_defineComponent({\n  props: {\n  text: String,\n  number: Number,\n  check: Boolean,\n},\n  setup(__props) {\n\n\n\nconst { count } = useCounter()\n\nreturn (_ctx,_cache) => {\n  return (_openBlock(), _createElementBlock("div", null, [\n    _createElementVNode("div", null, _toDisplayString(__props.text), 1 /* TEXT */),\n    _createElementVNode("div", null, _toDisplayString(__props.number), 1 /* TEXT */),\n    _createElementVNode("div", null, _toDisplayString(__props.check), 1 /* TEXT */),\n    _createElementVNode("div", null, "Internal count: " + _toDisplayString(_unref(count)), 1 /* TEXT */)\n  ]))\n}\n}\n\n})`)
  })
})
