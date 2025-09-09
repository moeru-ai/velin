import type { MaybeRefOrGetter, Reactive } from '@vue/reactivity'
import type { ComponentPropsOptions, DefineComponent, ExtractPropTypes } from '@vue/runtime-core'
import type { LooseRequired } from '@vue/shared'

export type RenderComponentInputComponent<T>
  // eslint-disable-next-line ts/no-empty-object-type
  = | DefineComponent<T, object, any, {}, {}, {}>
    | DefineComponent<any, any, any, any, any, any>
    | DefineComponent<object, object, any>

export type InputProps<T>
  = | T
    | MaybeRefOrGetter<T>
    | Record<string, Reactive<any>>
    | Record<string, MaybeRefOrGetter<any>>

export type ResolveRenderComponentInputProps<T = any, P = ComponentPropsOptions<T>>
  = P extends ComponentPropsOptions<T>
    ? ExtractPropTypes<P>
    : P

export type LooseRequiredRenderComponentInputProps<T>
  = LooseRequired<Readonly<
    T extends ComponentPropsOptions<Record<string, unknown>>
      ? ExtractPropTypes<T>
      : T
  > & {}>
