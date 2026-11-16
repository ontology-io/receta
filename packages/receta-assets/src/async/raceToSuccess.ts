import * as R from 'remeda'
import { tryCatchAsync, type Result } from '@ontologyio/receta/result'

export type RaceToSuccessError = {
  readonly code: 'ALL_FAILED'
  /** One error per task, in the order the tasks were given. */
  readonly errors: readonly unknown[]
  readonly message: string
}

/**
 * Starts every async task at once and returns the first one that succeeds.
 *
 * Use when: several equivalent sources can answer and the fastest working one should win,
 * such as the same file on three CDNs or a lookup against several resolvers. A failure
 * doesn't end the race; only when every task has failed does an Err come back, with all
 * the errors. The losing tasks keep running, because a promise can't be cancelled.
 *
 * @example
 * ```ts
 * import { sleep } from '@ontologyio/receta/async'
 * import { mapErr } from '@ontologyio/receta/result'
 *
 * const slowCdn = async () => {
 *   await sleep(10)
 *   return 'slow cdn'
 * }
 * const brokenCdn = async (): Promise<string> => {
 *   throw new Error('404')
 * }
 *
 * await raceToSuccess([slowCdn, brokenCdn, async () => 'fast cdn'])
 * // => Ok('fast cdn')
 *
 * const allBroken = await raceToSuccess([brokenCdn, brokenCdn])
 * R.pipe(allBroken, mapErr((error) => error.errors.length))
 * // => Err(2)
 * ```
 *
 * @tags race, any, fastest, first success, mirrors, cdn, parallel, hedge
 * @see tryInOrder - runs the tasks one at a time instead, in order of preference
 * @see hedgedCall - starts a second copy of one task only when the first is slow
 */
export async function raceToSuccess<T>(
  tasks: ReadonlyArray<() => Promise<T>>,
): Promise<Result<T, RaceToSuccessError>> {
  return tryCatchAsync(
    // The async wrapper turns a task that throws before returning a promise into a rejection.
    () => Promise.any(R.map(tasks, async (task) => task())),
    (failure): RaceToSuccessError => {
      const errors = failure instanceof AggregateError ? failure.errors : [failure]
      return { code: 'ALL_FAILED', errors, message: `All ${errors.length} tasks failed` }
    },
  )
}
