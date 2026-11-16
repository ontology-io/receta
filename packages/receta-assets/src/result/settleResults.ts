import * as R from 'remeda'
import { isErr, isOk, type Result } from '@ontologyio/receta/result'

export type SettleResultsFailure<T, E> = {
  /** The input that failed, so it can be retried or shown. */
  readonly item: T
  /** Where it sits in the input. */
  readonly index: number
  readonly error: E
}

export type SettleResultsOutcome<T, U, E> = {
  readonly succeeded: readonly U[]
  readonly failed: readonly SettleResultsFailure<T, E>[]
}

/**
 * Runs a step that returns a Result on every item and splits the outcome into what succeeded and what failed, with the inputs.
 *
 * Use when: a batch should do as much as it can and report the rest, such as sending a
 * newsletter, importing contacts or resizing images, where the failures go to a retry
 * queue, a report or a "3 rows were skipped" message. Unlike an all-or-nothing `Result`, the
 * successes are kept even when some items fail. Each failure keeps its item and index.
 *
 * @example
 * ```ts
 * import { err, ok } from '@ontologyio/receta/result'
 *
 * const send = (email: string) => (email.includes('@') ? ok(`sent to ${email}`) : err('BAD_ADDRESS'))
 *
 * settleResults(['ada@example.com', 'grace', 'linus@example.org'], send)
 * // => {
 * //   succeeded: ['sent to ada@example.com', 'sent to linus@example.org'],
 * //   failed: [{ item: 'grace', index: 1, error: 'BAD_ADDRESS' }],
 * // }
 *
 * R.pipe([] as string[], settleResults(send))
 * // => { succeeded: [], failed: [] }
 * ```
 *
 * @tags batch, partial success, settle, report, retry queue, bulk, import, split
 * @see traverseResultsAll - all or nothing, with every error
 * @see summarizeResults - counts outcomes by error code
 */
export function settleResults<T, U, E>(
  items: readonly T[],
  step: (item: T, index: number) => Result<U, E>,
): SettleResultsOutcome<T, U, E>
export function settleResults<T, U, E>(
  step: (item: T, index: number) => Result<U, E>,
): (items: readonly T[]) => SettleResultsOutcome<T, U, E>
export function settleResults(...args: unknown[]): unknown {
  return R.purry(settleResultsImplementation, args)
}

const settleResultsImplementation = <T, U, E>(
  items: readonly T[],
  step: (item: T, index: number) => Result<U, E>,
): SettleResultsOutcome<T, U, E> => {
  const outcomes = R.map(items, (item, index) => ({ item, index, result: step(item, index) }))
  return {
    succeeded: R.flatMap(outcomes, ({ result }) => (isOk(result) ? [result.value] : [])),
    failed: R.flatMap(outcomes, ({ item, index, result }) =>
      isErr(result) ? [{ item, index, error: result.error }] : [],
    ),
  }
}
