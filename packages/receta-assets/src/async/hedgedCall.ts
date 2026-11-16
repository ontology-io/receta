import { timeout } from '@ontologyio/receta/async'
import { isErr, isOk, ok, tryCatchAsync, type Result } from '@ontologyio/receta/result'

export type HedgedCallOptions = {
  /** How long the first attempt runs alone before a second copy of the task starts. */
  readonly hedgeAfterMs: number
}

export type HedgedCallError = {
  readonly code: 'BOTH_FAILED'
  /** The first attempt's error, then the second's. */
  readonly errors: readonly unknown[]
  readonly message: string
}

const bothFailed = (errors: readonly unknown[]): HedgedCallError => ({
  code: 'BOTH_FAILED',
  errors,
  message: 'Both attempts failed',
})

/**
 * Starts a second copy of a slow async task after a delay, and takes whichever attempt succeeds first.
 *
 * Use when: a read is idempotent and its latency has a long tail, such as a search query, a
 * cache read or an object-store GET, and an occasional slow replica shouldn't make the
 * caller wait. Most calls finish before `hedgeAfterMs` and never start a second attempt.
 * Only use it for reads: the task can run twice.
 *
 * ```text
 *  0 ms                      hedgeAfterMs
 *  ├── attempt 1 ────────────┼─────────────────▶ first success wins
 *  │                         ├── attempt 2 ────▶
 *  │
 *  │ attempt 1 succeeds first ──▶ Ok, attempt 2 never starts
 *  │ attempt 1 fails first ─────▶ attempt 2 starts at once
 *  │ both attempts fail ────────▶ Err({ code: 'BOTH_FAILED', errors })
 * ```
 *
 * @example
 * ```ts
 * import { sleep } from '@ontologyio/receta/async'
 * import { mapErr } from '@ontologyio/receta/result'
 *
 * let calls = 0
 * const search = async () => {
 *   calls += 1
 *   const call = calls
 *   await sleep(call === 1 ? 40 : 2)
 *   return `answer from call ${call}`
 * }
 * await hedgedCall(search, { hedgeAfterMs: 10 })
 * // => Ok('answer from call 2')
 *
 * await hedgedCall(async () => 'quick', { hedgeAfterMs: 10 })
 * // => Ok('quick')
 *
 * const down = async (): Promise<string> => {
 *   throw new Error('down')
 * }
 * const failed = await hedgedCall(down, { hedgeAfterMs: 10 })
 * R.pipe(failed, mapErr((error) => error.errors.length))
 * // => Err(2)
 * ```
 *
 * @tags hedge, tail latency, p99, race, speculative, replica, duplicate request
 * @see raceToSuccess - starts every task at once instead of waiting
 * @see timeout - @ontologyio/receta/async, decides when the second attempt starts
 */
export async function hedgedCall<T>(
  task: () => Promise<T>,
  options: HedgedCallOptions,
): Promise<Result<T, HedgedCallError>> {
  // The async wrapper turns a task that throws before returning a promise into a rejection.
  const start = async () => task()
  const firstAttempt = start()
  // timeout rethrows a rejection, so an Err here means the first attempt failed early.
  const early = await tryCatchAsync(() => timeout(firstAttempt, options.hedgeAfterMs))
  if (isErr(early)) {
    return tryCatchAsync(start, (secondError) => bothFailed([early.error, secondError]))
  }
  if (isOk(early.value)) return ok(early.value.value)
  return tryCatchAsync(
    () => Promise.any([firstAttempt, start()]),
    (failure) => bothFailed(failure instanceof AggregateError ? failure.errors : [failure]),
  )
}
