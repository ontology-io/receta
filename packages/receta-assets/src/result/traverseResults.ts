import * as R from 'remeda'
import { isErr, ok, tap, type Result } from '@ontologyio/receta/result'

/**
 * Runs a step that returns a Result on each item and stops at the first Err, so later items are never touched.
 *
 * Use when: each item goes through a parse, a check or a write that can fail, and one
 * failure should stop the batch, such as applying migrations in order, importing rows into a
 * transaction, or parsing a list where any bad entry rejects the request. The step is never
 * called after the first `Err`, which matters when it has effects. On success the values
 * keep the input's order.
 *
 * @example
 * ```ts
 * import { err, ok, parseNumber } from '@ontologyio/receta/result'
 *
 * traverseResults(['1', '2', '3'], parseNumber)
 * // => Ok([1, 2, 3])
 *
 * const seen: string[] = []
 * const parseLogged = (text: string) => {
 *   seen.push(text)
 *   return text === 'x' ? err(`bad: ${text}`) : ok(text.length)
 * }
 * R.pipe(['a', 'x', 'c'], traverseResults(parseLogged))
 * // => Err('bad: x')
 *
 * seen
 * // => ['a', 'x']
 * ```
 *
 * @tags map, each, batch, fail fast, stop on error, sequence, transaction, import
 * @see traverseResultsAll - runs every item and reports every error with its index
 * @see traverseResultsAsync - the same for async steps, with a concurrency limit
 * @see collect - @ontologyio/receta/result, for Results that already exist
 */
export function traverseResults<T, U, E>(
  items: readonly T[],
  step: (item: T, index: number) => Result<U, E>,
): Result<readonly U[], E>
export function traverseResults<T, U, E>(
  step: (item: T, index: number) => Result<U, E>,
): (items: readonly T[]) => Result<readonly U[], E>
export function traverseResults(...args: unknown[]): unknown {
  return R.purry(traverseResultsImplementation, args)
}

const traverseResultsImplementation = <T, U, E>(
  items: readonly T[],
  step: (item: T, index: number) => Result<U, E>,
): Result<readonly U[], E> => {
  const values: U[] = []
  // R.map and R.find run lazily inside R.pipe, so step is never called after the first Err.
  const failure = R.pipe(
    items,
    R.map((item, index) =>
      tap(step(item, index), (value) => {
        values.push(value)
      }),
    ),
    R.find(isErr),
  )
  return failure ?? ok(values)
}
