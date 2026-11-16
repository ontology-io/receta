import { err, isOk, tryCatchAsync, type Result } from '@ontologyio/receta/result'

export type TryInOrderError = {
  readonly code: 'ALL_FAILED'
  /** One error per task, in the order the tasks ran. */
  readonly errors: readonly unknown[]
  readonly message: string
}

/**
 * Runs async tasks one at a time, in order, and stops at the first one that succeeds.
 *
 * Use when: the same thing can come from several sources ranked by preference, such as a
 * list of mirrors, a primary database then a replica then a snapshot, or one LLM provider
 * after another. A task starts only after the one before it failed, so later sources cost
 * nothing while an earlier one works. An empty list fails with no errors.
 *
 * @example
 * ```ts
 * import { mapErr } from '@ontologyio/receta/result'
 *
 * const down = async (): Promise<string> => {
 *   throw new Error('ECONNREFUSED')
 * }
 *
 * await tryInOrder([down, async () => 'eu mirror', async () => 'us mirror'])
 * // => Ok('eu mirror')
 *
 * const allDown = await tryInOrder([down, down, down])
 * R.pipe(allDown, mapErr((error) => error.errors.length))
 * // => Err(3)
 *
 * const none = await tryInOrder([])
 * R.pipe(none, mapErr((error) => error.code))
 * // => Err('ALL_FAILED')
 * ```
 *
 * @tags fallback, failover, mirrors, sequential, first success, providers, chain
 * @see withFallback - two sources, with the primary's error passed to the fallback
 * @see raceToSuccess - starts every task at once and takes the first success
 */
export async function tryInOrder<T>(
  tasks: ReadonlyArray<() => Promise<T>>,
): Promise<Result<T, TryInOrderError>> {
  const tryFrom = async (
    remaining: ReadonlyArray<() => Promise<T>>,
    errors: readonly unknown[],
  ): Promise<Result<T, TryInOrderError>> => {
    const [task, ...rest] = remaining
    if (task === undefined) {
      return err({ code: 'ALL_FAILED', errors, message: `All ${errors.length} tasks failed` })
    }
    const attempt = await tryCatchAsync(task)
    return isOk(attempt) ? attempt : tryFrom(rest, [...errors, attempt.error])
  }
  return tryFrom(tasks, [])
}
