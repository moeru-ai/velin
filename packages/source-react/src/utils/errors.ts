import { errorMessageFrom, isError } from '@moeru/std/error'

type SourceStage = 'transform' | 'evaluate'

export function stageError(filename: string, stage: SourceStage, error: unknown): Error {
  const message = errorMessageFrom(error) ?? String(error)

  if (message.startsWith(`[${filename}] ${stage}:`)) {
    return isError(error) ? error : new Error(message)
  }

  return new Error(`[${filename}] ${stage}: ${message}`)
}
