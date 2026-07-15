import type {
  ComponentPropsOptions,
  DefineComponent,
  ExtractPropTypes,
  MaybeRefOrGetter,
  Reactive,
} from 'vue'

export type RenderComponentInputComponent<T>
  // eslint-disable-next-line ts/no-empty-object-type
  = | DefineComponent<T, object, any, {}, {}, {}>
    | DefineComponent<any, any, any, any, any, any>
    | DefineComponent<object, object, any>

type LooseRequired<T> = {
  [P in keyof (T & Required<T>)]: (T & Required<T>)[P]
}

export type InputProps<T>
  = | T
    | MaybeRefOrGetter<T>
    | Record<string, Reactive<any>>
    | Record<string, MaybeRefOrGetter<any>>

export interface RenderSFCOptions {
  basePath?: string
  filename?: string
  vfs?: Record<string, string> | Map<string, string>
}

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
