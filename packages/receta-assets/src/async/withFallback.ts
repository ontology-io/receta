import { isOk, tryCatchAsync, type Result } from '@ontologyio/receta/result'

export type WithFallbackError = {
  readonly code: 'BOTH_FAILED'
  readonly primaryError: unknown
  readonly fallbackError: unknown
  readonly message: string
}

/**
 * Runs a primary async task, and a fallback task only when the primary one throws or rejects.
 *
 * Use when: a value has a preferred source and a backup, such as a live price API and a
 * cached copy, or a primary region and a replica. The fallback starts only after the primary
 * has failed, so it costs nothing while the primary works, and it receives the primary's
 * error so it can log it or decide what to serve. When both fail, both errors come back.
 *
 * @example
 * ```ts
 * import { mapErr } from '@ontologyio/receta/result'
 *
 * const livePrice = async (): Promise<number> => {
 *   throw new Error('503')
 * }
 * const cachedPrice = async () => 41.5
 *
 * await withFallback(livePrice, cachedPrice)
 * // => Ok(41.5)
 *
 * await withFallback(async () => 42, cachedPrice)
 * // => Ok(42)
 *
 * const noCache = async (): Promise<number> => {
 *   throw new Error('cache is cold')
 * }
 * const nothing = await withFallback(livePrice, noCache)
 * R.pipe(nothing, mapErr((error) => error.code))
 * // => Err('BOTH_FAILED')
 * ```
 *
 * @tags fallback, backup, failover, replica, degrade, default, resilience
 * @see tryInOrder - the same idea for any number of sources
 * @see tryCatchAsync - @ontologyio/receta/result, turns each rejection into an Err
 */
export async function withFallback<T>(
  primary: () => Promise<T>,
  fallback: (primaryError: unknown) => Promise<T>,
): Promise<Result<T, WithFallbackError>> {
  const first = await tryCatchAsync(primary)
  if (isOk(first)) return first
  return tryCatchAsync(
    () => fallback(first.error),
    (fallbackError): WithFallbackError => ({
      code: 'BOTH_FAILED',
      primaryError: first.error,
      fallbackError,
      message: 'The primary task and its fallback both failed',
    }),
  )
}
