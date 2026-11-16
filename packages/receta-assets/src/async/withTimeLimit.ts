import * as R from 'remeda'
import { timeout } from '@ontologyio/receta/async'
import { flatMap, mapErr, tryCatchAsync, type Result } from '@ontologyio/receta/result'

export type WithTimeLimitError =
  | { readonly code: 'TIMED_OUT'; readonly limitMs: number; readonly message: string }
  | { readonly code: 'FAILED'; readonly error: unknown; readonly message: string }

/**
 * Gives an async task a time limit, and returns a Result that tells a timeout apart from a failure.
 *
 * Use when: a request must answer within a budget, such as a payment authorisation or a
 * health check, and the caller reacts differently to "too slow" and "broken". Receta's
 * `timeout` rethrows a rejection and reports a timeout as a class instance; this returns
 * both as plain errors with a `code`. The task keeps running after the limit, because a
 * promise can't be cancelled.
 *
 * @example
 * ```ts
 * import { sleep } from '@ontologyio/receta/async'
 *
 * await withTimeLimit(async () => 'authorised', 20)
 * // => Ok('authorised')
 *
 * const slow = async () => {
 *   await sleep(40)
 *   return 'authorised'
 * }
 * await withTimeLimit(slow, 10)
 * // => Err({ code: 'TIMED_OUT', limitMs: 10, message: 'The task ran past its 10 ms limit' })
 *
 * const declined = new Error('declined')
 * await withTimeLimit(async () => Promise.reject(declined), 20)
 * // => Err({ code: 'FAILED', error: declined, message: 'The task failed before its time limit' })
 * ```
 *
 * @tags timeout, time limit, deadline, budget, sla, slow, result
 * @see timeBox - the same limit as an Option, when the reason doesn't matter
 * @see timeout - @ontologyio/receta/async, the race against the clock
 */
export async function withTimeLimit<T>(
  task: () => Promise<T>,
  limitMs: number,
): Promise<Result<T, WithTimeLimitError>> {
  const outcome = await tryCatchAsync(
    () => timeout(task(), limitMs),
    (error): WithTimeLimitError => ({ code: 'FAILED', error, message: 'The task failed before its time limit' }),
  )
  return R.pipe(
    outcome,
    flatMap((inTime) =>
      mapErr(inTime, (): WithTimeLimitError => ({
        code: 'TIMED_OUT',
        limitMs,
        message: `The task ran past its ${limitMs} ms limit`,
      })),
    ),
  )
}
