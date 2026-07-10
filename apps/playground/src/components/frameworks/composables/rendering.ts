import type { ComponentProp } from '@velin-dev/core/render-shared'
import type { ComputedRef, Ref } from 'vue'

import type { FrameworkDefinition } from '../types'

import { errorMessageFrom } from '@moeru/std/error'
import { nextTick, ref } from 'vue'

export interface UseFrameworkPromptRenderingOptions {
  activeFilename: ComputedRef<string>
  activeFramework: ComputedRef<FrameworkDefinition>
  formValues: Record<string, unknown>
  inputPrompt: Ref<string>
}

export function useFrameworkPromptRendering({
  activeFilename,
  activeFramework,
  formValues,
  inputPrompt,
}: UseFrameworkPromptRenderingOptions) {
  const initializing = ref(true)
  const renderedPrompt = ref('')
  const renderError = ref('')
  const resolvedProps = ref<ComponentProp[]>([])
  const isPropsInitialized = ref(false)
  const isApplyingResolvedProps = ref(false)
  let renderGeneration = 0

  function resetPropsInitialization() {
    isPropsInitialized.value = false
  }

  function applyResolvedProps(promptProps: ComponentProp[], reset: boolean) {
    resolvedProps.value = promptProps

    if (!reset && isPropsInitialized.value) {
      return
    }

    isApplyingResolvedProps.value = true

    if (reset) {
      Object.keys(formValues).forEach((key) => {
        delete formValues[key]
      })
    }

    promptProps.forEach((prop) => {
      if (!(prop.title in formValues)) {
        formValues[prop.title] = prop.value
      }
    })

    normalizeFrameworkProps(resolvedProps.value, formValues)
    isPropsInitialized.value = true
    void nextTick(() => {
      isApplyingResolvedProps.value = false
    })
  }

  async function renderFrameworkPrompt(resetProps: boolean) {
    const { promptProps, rendered } = await activeFramework.value.render({
      filename: activeFilename.value,
      formValues,
      source: inputPrompt.value,
    })

    applyResolvedProps(promptProps, resetProps)
    renderedPrompt.value = resetProps
      ? (
          await activeFramework.value.render({
            filename: activeFilename.value,
            formValues,
            source: inputPrompt.value,
          })
        ).rendered
      : rendered
  }

  async function renderPrompt(resetProps = false) {
    const generation = ++renderGeneration

    if (resetProps) {
      initializing.value = true
    }

    renderError.value = ''

    try {
      await renderFrameworkPrompt(resetProps)
    }
    catch (error) {
      if (generation === renderGeneration) {
        renderedPrompt.value = ''
        renderError.value = messageFromError(error)
        resolvedProps.value = []
      }
    }
    finally {
      if (generation === renderGeneration) {
        initializing.value = false
      }
    }
  }

  return {
    initializing,
    isApplyingResolvedProps,
    isPropsInitialized,
    renderedPrompt,
    renderError,
    renderPrompt,
    resetPropsInitialization,
    resolvedProps,
  }
}

function messageFromError(error: unknown) {
  return errorMessageFrom(error) ?? String(error)
}

function normalizeFrameworkProps(
  resolvedProps: ComponentProp[],
  formValues: Record<string, unknown>,
) {
  resolvedProps.forEach((prop) => {
    if (!prop.required || formValues[prop.key] != null) {
      return
    }

    if (prop.type === 'string') {
      formValues[prop.key] = ''
    }
    else if (prop.type === 'boolean') {
      formValues[prop.key] = false
    }
    else if (prop.type === 'number') {
      formValues[prop.key] = 0
    }
    else if (prop.type === 'array') {
      formValues[prop.key] = []
    }
  })
}
