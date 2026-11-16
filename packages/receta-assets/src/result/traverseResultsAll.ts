import * as R from 'remeda'
import { err, mapErr, ok, partition, type Result } from '@ontologyio/receta/result'

export type TraverseResultsAllFailure<E> = {
  /** Where the failing item sits in the input. */
  readonly index: number
  readonly error: E
}

/**
 * Runs a step that returns a Result on every item and reports every failure with its index, or all the values.
 *
 * Use when: a person will fix the input, such as rows of a CSV upload, lines of a pasted
 * list or entries of a bulk form, and should see each problem with where it is in one pass.
 * Every item runs, even after a failure. On success the values keep the input's order.
 *
 * @example
 * ```ts
 * import { err, ok } from '@ontologyio/receta/result'
 *
 * const parseQuantity = (text: string) =>
 *   /^\d+$/.test(text) ? ok(Number(text)) : err(`"${text}" is not a quantity`)
 *
 * traverseResultsAll(['3', '12'], parseQuantity)
 * // => Ok([3, 12])
 *
 * R.pipe(['3', 'two', '7', '-1'], traverseResultsAll(parseQuantity))
 * // => Err([{ index: 1, error: '"two" is not a quantity' }, { index: 3, error: '"-1" is not a quantity' }])
 * ```
 *
 * @tags batch, all errors, rows, csv, import, bulk, accumulate, report, map
 * @see traverseResults - stops at the first failure
 * @see collectAllErrors - for Results that already exist
 * @see partition - @ontologyio/receta/result, splits values from failures
 */
export function traverseResultsAll<T, U, E>(
  items: readonly T[],
  step: (item: T, index: number) => Result<U, E>,
): Result<readonly U[], readonly TraverseResultsAllFailure<E>[]>
export function traverseResultsAll<T, U, E>(
  step: (item: T, index: number) => Result<U, E>,
): (items: readonly T[]) => Result<readonly U[], readonly TraverseResultsAllFailure<E>[]>
export function traverseResultsAll(...args: unknown[]): unknown {
  return R.purry(traverseResultsAllImplementation, args)
}

const traverseResultsAllImplementation = <T, U, E>(
  items: readonly T[],
  step: (item: T, index: number) => Result<U, E>,
): Result<readonly U[], readonly TraverseResultsAllFailure<E>[]> => {
  const [values, failures] = R.pipe(
    items,
    R.map((item, index) => mapErr(step(item, index), (error) => ({ index, error }))),
    (results) => partition(results),
  )
  return R.isEmpty(failures) ? ok(values) : err(failures)
}
