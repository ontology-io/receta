import { instrumentedPurry } from '../../utils'
import type { Result } from '../types'
import { isOk } from '../guards'

/**
 * Separates an array of Results into Ok values and Err values.
 *
 * Returns a tuple of [okValues, errValues].
 *
 * @param results - Array of Results to partition
 * @returns Tuple of [array of Ok values, array of Err values]
 *
 * @example
 * ```typescript
 * const results = [
 *   ok(1),
 *   err('fail1'),
 *   ok(2),
 *   err('fail2'),
 *   ok(3)
 * ]
 *
 * partition(results)
 * // => [[1, 2, 3], ['fail1', 'fail2']]
 *
 * // Practical use case: bulk validation
 * const [validUsers, errors] = pipe(
 *   rawUsers,
 *   R.map(validateUser),
 *   partition
 * )
 *
 * if (errors.length > 0) {
 *   console.log('Validation errors:', errors)
 * }
 * console.log('Valid users:', validUsers)
 * ```
 *
 * @see collect - for short-circuiting on first error
 */
export function partition<T, E>(results: readonly Result<T, E>[]): [T[], E[]]
export function partition<T>(): <E>(results: readonly Result<T, E>[]) => [T[], E[]]
export function partition(...args: unknown[]): unknown {
  return instrumentedPurry('partition', 'result', partitionImplementation, args)
}

function partitionImplementation<T, E>(results: readonly Result<T, E>[]): [T[], E[]] {
  const oks: T[] = []
  const errs: E[] = []

  for (const result of results) {
    if (isOk(result)) {
      oks.push(result.value)
    } else {
      errs.push(result.error)
    }
  }

  return [oks, errs]
}
