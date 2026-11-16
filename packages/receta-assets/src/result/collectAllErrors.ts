import * as R from 'remeda'
import { err, ok, partition, type Result } from '@ontologyio/receta/result'

/**
 * Combines a list of Results into Ok with every value, or Err with every error, not just the first.
 *
 * Use when: several independent checks or parses have already run, such as one per row, file
 * or field, and the caller should see all the failures at once instead of fixing them one
 * by one. Order is kept on both sides. An empty list is `Ok([])`. Use `collect` from Receta
 * when the first error is enough.
 *
 * @example
 * ```ts
 * import { err, ok } from '@ontologyio/receta/result'
 *
 * collectAllErrors([ok(1), ok(2), ok(3)])
 * // => Ok([1, 2, 3])
 *
 * collectAllErrors([ok(1), err('row 2: no email'), ok(3), err('row 4: bad date')])
 * // => Err(['row 2: no email', 'row 4: bad date'])
 *
 * collectAllErrors([])
 * // => Ok([])
 * ```
 *
 * @tags collect, combine, all errors, accumulate, batch, rows, validation, report
 * @see collect - @ontologyio/receta/result, stops at the first error
 * @see traverseResultsAll - runs the step on each item and keeps each error's index
 * @see partition - @ontologyio/receta/result, the split underneath
 */
export function collectAllErrors<T, E>(
  results: readonly Result<T, E>[],
): Result<readonly T[], readonly E[]> {
  const [values, errors] = partition(results)
  return R.isEmpty(errors) ? ok(values) : err(errors)
}
